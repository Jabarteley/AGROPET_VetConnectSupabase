'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

type VetProfile = {
  id: string
  name: string | null
}

export default function BookingForm({ user, vet }: { user: User; vet: VetProfile }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Form state
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!appointmentDate || !appointmentTime) {
      setMessage('Please select a date and time.')
      setLoading(false)
      return
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)

    const { error } = await supabase.from('appointments').insert({
      user_id: user.id,
      vet_id: vet.id,
      appointment_datetime: appointmentDateTime.toISOString(),
      status: 'pending',
    })

    if (error) {
      setMessage('Error creating appointment: ' + error.message)
    } else {
      setMessage('Appointment requested successfully! You will be redirected to your appointments page.')
      setTimeout(() => {
        router.push('/appointments')
      }, 2000)
    }
    setLoading(false)
  }

  // Get today's date in YYYY-MM-DD format for the min attribute of the date input
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleBooking} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
      <div>
        <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700">
          Select a Date
        </label>
        <input
          id="appointmentDate"
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          min={today}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700">
          Select a Time
        </label>
        <input
          id="appointmentTime"
          type="time"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {message && <p className="text-sm text-center text-gray-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Requesting...' : 'Request Appointment'}
      </button>
    </form>
  )
}
