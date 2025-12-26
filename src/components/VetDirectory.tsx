'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { initiateConversation } from '@/app/veterinarians/actions' // Import the server action

// Define a type for the veterinarian profile data
type VetProfile = {
  id: string
  name: string | null
  location: string | null
  specialization: string | null
  service_regions: string | null
}

export default function VetDirectory() {
  const supabase = createClient()
  const [vets, setVets] = useState<VetProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchVets = async () => {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('profiles')
        .select('id, name, location, specialization, service_regions')
        .eq('role', 'veterinarian')
        .eq('verification_status', 'verified')

      // Apply search term if present
      if (searchTerm) {
        // A simple search across name, location, and specialization
        // For more advanced search, you might need a PostgreSQL function
        query = query.or(`name.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,specialization.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) {
        setError(error.message)
        setVets([])
      } else {
        setVets(data)
      }
      setLoading(false)
    }

    // Debounce the search to avoid too many requests
    const searchTimeout = setTimeout(() => {
      fetchVets()
    }, 300) // 300ms delay

    return () => clearTimeout(searchTimeout)
  }, [searchTerm, supabase])

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, location, or specialization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Vet List */}
      {loading ? (
        <p className="text-center">Loading veterinarians...</p>
      ) : error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : vets.length === 0 ? (
        <p className="text-center text-gray-500">No verified veterinarians found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vets.map((vet) => (
            <div key={vet.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
              <div className="flex-grow">
                <h2 className="text-xl font-bold text-gray-800">{vet.name || 'N/A'}</h2>
                <p className="text-gray-600 mt-2">
                  <strong>Location:</strong> {vet.location || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <strong>Specialization:</strong> {vet.specialization || 'N/A'}
                </p>
                <p className="text-gray-600">
                  <strong>Service Regions:</strong> {vet.service_regions || 'N/A'}
                </p>
              </div>
              <div className="mt-4 flex flex-col space-y-2">
                <Link
                  href={`/veterinarians/${vet.id}/book`}
                  className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Book Appointment
                </Link>
                {/* Message Vet Button */}
                <form action={async () => await initiateConversation(vet.id)}>
                  <button
                    type="submit"
                    className="w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 border-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Message Vet
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
