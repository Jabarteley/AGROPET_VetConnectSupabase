'use client'

import { useState } from 'react'
import { updateAppointmentStatus } from '@/app/appointments/actions'

// Define the type for the enriched appointment
export type EnrichedAppointment = {
  id: string
  user_id: string
  vet_id: string
  appointment_datetime: string
  status: string
  created_at: string
  client_name: string
  vet_name: string
}

type CurrentUser = {
  id: string
  role: 'farmer_pet_owner' | 'veterinarian' | 'admin' | undefined
}

export default function AppointmentsList({
  initialAppointments,
  currentUser,
}: {
  initialAppointments: EnrichedAppointment[]
  currentUser: CurrentUser
}) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'approved' | 'cancelled' | 'completed') => {
    setLoading(true)
    setError(null)

    const result = await updateAppointmentStatus(appointmentId, newStatus)

    if (result.error) {
      setError(result.error)
    } else {
      // Update the status of the appointment in the local state
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      )
    }
    setLoading(false)
  }

  const isVet = currentUser.role === 'veterinarian'

  const clientAppointments = appointments.filter((appt) => appt.user_id === currentUser.id)
  const vetAppointments = isVet ? appointments.filter((appt) => appt.vet_id === currentUser.id) : []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  return (
    <div className="space-y-8">
      {/* Diagnostic message to show the current user's role */}
      <div className="p-4 bg-gray-100 border rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Dashboard Info:</strong> Viewing as role: <span className="font-semibold text-indigo-600">{currentUser.role || 'Not defined'}</span>
        </p>
      </div>

      {/* Appointments booked by the user */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">My Bookings</h2>
        {clientAppointments.length > 0 ? (
          <div className="space-y-4">
            {clientAppointments.map((appt) => (
              <div key={`client-${appt.id}`} className="bg-white p-4 rounded-lg shadow-md border">
                <p>
                  <strong>Veterinarian:</strong> {appt.vet_name}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(appt.appointment_datetime)}
                </p>
                <p>
                  <strong>Status:</strong> <span className={`font-semibold ${
                    appt.status === 'approved' ? 'text-green-600' :
                    appt.status === 'completed' ? 'text-blue-600' :
                    appt.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{appt.status}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You have not booked any appointments.</p>
        )}
      </div>

      {/* Appointments for the veterinarian */}
      {isVet && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Client Requests</h2>
          {vetAppointments.length > 0 ? (
            <div className="space-y-4">
              {vetAppointments.map((appt) => (
                <div key={`vet-${appt.id}`} className="bg-white p-4 rounded-lg shadow-md border">
                  <p>
                    <strong>Client:</strong> {appt.client_name}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(appt.appointment_datetime)}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className={`font-semibold ${
                      appt.status === 'approved' ? 'text-green-600' :
                      appt.status === 'completed' ? 'text-blue-600' :
                      appt.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}`}>{appt.status}</span>
                  </p>
                  {appt.status === 'pending' && (
                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => handleStatusUpdate(appt.id, 'approved')}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {appt.status === 'approved' && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleStatusUpdate(appt.id, 'completed')}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Mark as Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You have no pending client requests.</p>
          )}
        </div>
      )}
      {error && <p className="mt-4 text-center text-red-500">Error: {error}</p>}
    </div>
  )
}
