'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// Define a type for the profile data
type Profile = {
  id: string
  email: string
  role: 'farmer_pet_owner' | 'veterinarian' | 'admin'
  name: string | null
  location: string | null
  qualifications: string | null
  specialization: string | null
  service_regions: string | null
  verification_status: 'pending' | 'verified' | 'rejected'
} | null

export default function ProfileForm({ user, profile }: { user: User; profile: Profile }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState(profile?.name || '')
  const [location, setLocation] = useState(profile?.location || '')
  const [qualifications, setQualifications] = useState(profile?.qualifications || '')
  const [specialization, setSpecialization] = useState(profile?.specialization || '')
  const [serviceRegions, setServiceRegions] = useState(profile?.service_regions || '')

  useEffect(() => {
    setName(profile?.name || '')
    setLocation(profile?.location || '')
    setQualifications(profile?.qualifications || '')
    setSpecialization(profile?.specialization || '')
    setServiceRegions(profile?.service_regions || '')
  }, [profile])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const updates = {
      id: user.id,
      email: user.email, // Include email to satisfy NOT NULL constraint
      name,
      location,
      // Only include vet-specific fields if the role is veterinarian
      ...(profile?.role === 'veterinarian' && {
        qualifications,
        specialization,
        service_regions: serviceRegions,
      }),
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      setMessage('Error updating profile: ' + error.message)
    } else {
      setMessage('Profile updated successfully!')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="text"
          value={user.email}
          disabled
          className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
          Role
        </label>
        <input
          id="role"
          type="text"
          value={profile?.role || 'Not set'}
          disabled
          className="mt-1 block w-full bg-gray-100 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location (e.g., City, State)
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {profile?.role === 'veterinarian' && (
        <>
          <hr />
          <h2 className="text-lg font-semibold text-gray-800">Veterinarian Details</h2>
          {profile.verification_status !== 'verified' && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
              <p className="font-bold">Verification Status: {profile.verification_status}</p>
              <p>Your profile is pending review by an administrator.</p>
            </div>
          )}
          <div>
            <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700">
              Qualifications (e.g., DVM, VCN)
            </label>
            <input
              id="qualifications"
              type="text"
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
              Specialization (e.g., Poultry, Small Animals)
            </label>
            <input
              id="specialization"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text.sm"
            />
          </div>
          <div>
            <label htmlFor="serviceRegions" className="block text-sm font-medium text-gray-700">
              Service Regions (e.g., Lagos, Ogun State)
            </label>
            <input
              id="serviceRegions"
              type="text"
              value={serviceRegions}
              onChange={(e) => setServiceRegions(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </>
      )}

      {message && <p className="text-sm text-center text-gray-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  )
}
