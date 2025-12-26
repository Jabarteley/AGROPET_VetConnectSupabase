'use client'

import { useState } from 'react'
import { updateVetVerificationStatus } from '@/app/admin/actions'

type VetProfile = {
  id: string
  name: string | null
  email: string
  location: string | null
  specialization: string | null
  verification_status: string
}

export default function VetVerificationList({ initialVets }: { initialVets: VetProfile[] }) {
  const [vets, setVets] = useState(initialVets)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusUpdate = async (vetId: string, status: 'verified' | 'rejected') => {
    setLoading(true)
    setError(null)

    const result = await updateVetVerificationStatus(vetId, status)

    if (result.error) {
      setError(result.error)
    } else {
      // Remove the vet from the list after verification/rejection
      setVets((prev) => prev.filter((vet) => vet.id !== vetId))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {vets.length === 0 ? (
        <p className="text-gray-500">No pending veterinarians to verify.</p>
      ) : (
        vets.map((vet) => (
          <div key={vet.id} className="bg-white p-6 rounded-lg shadow-md border flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{vet.name || 'N/A'}</h3>
              <p className="text-gray-600">Email: {vet.email}</p>
              <p className="text-gray-600">Location: {vet.location || 'N/A'}</p>
              <p className="text-gray-600">Specialization: {vet.specialization || 'N/A'}</p>
              <p className="text-gray-600">Status: {vet.verification_status}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={() => handleStatusUpdate(vet.id, 'verified')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                Verify
              </button>
              <button
                onClick={() => handleStatusUpdate(vet.id, 'rejected')}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  )
}
