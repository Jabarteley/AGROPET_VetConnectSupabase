'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

type VetProfile = {
  id: string
  name: string | null
}

type ScheduleItem = {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string;  // Format: HH:MM
  end_time: string;    // Format: HH:MM
  is_available: boolean;
}

export default function BookingForm({ user, vet, vetSchedule }: { user: User; vet: VetProfile; vetSchedule: ScheduleItem[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  // Form state
  const [appointmentDate, setAppointmentDate] = useState('')
  const [appointmentTime, setAppointmentTime] = useState('')
  const [reason, setReason] = useState('')
  const [images, setImages] = useState<File[]>([])

  // Calculate available times when date changes
  useEffect(() => {
    if (appointmentDate) {
      const selectedDate = new Date(appointmentDate);
      const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Find the schedule for the selected day
      const daySchedule = vetSchedule.find(schedule => schedule.day_of_week === dayOfWeek);

      if (daySchedule && daySchedule.is_available) {
        // Generate available times between start and end time in 30-minute intervals
        const [startHour, startMinute] = daySchedule.start_time.split(':').map(Number);
        const [endHour, endMinute] = daySchedule.end_time.split(':').map(Number);

        const times: string[] = [];
        let currentHour = startHour;
        let currentMinute = startMinute;

        while ((currentHour < endHour) || (currentHour === endHour && currentMinute < endMinute)) {
          const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
          times.push(timeString);

          // Increment by 30 minutes
          currentMinute += 30;
          if (currentMinute >= 60) {
            currentHour++;
            currentMinute = 0;
          }

          // Stop if we exceed the end time
          if (currentHour > endHour || (currentHour === endHour && currentMinute > endMinute)) {
            break;
          }
        }

        setAvailableTimes(times);

        // If the currently selected time is not in the available times, reset it
        if (times.length > 0 && !times.includes(appointmentTime)) {
          setAppointmentTime(times[0]); // Default to first available time
        } else if (times.length === 0) {
          setAppointmentTime(''); // No available times
        }
      } else {
        setAvailableTimes([]); // Day is not available
        setAppointmentTime(''); // Reset time selection
      }
    } else {
      setAvailableTimes([]);
      setAppointmentTime('');
    }
  }, [appointmentDate, vetSchedule]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (!appointmentDate || !appointmentTime) {
      setMessage('Please select a date and time.')
      setLoading(false)
      return
    }

    // Validate that the selected time is within the vet's available hours
    const selectedDate = new Date(appointmentDate);
    const dayOfWeek = selectedDate.getDay();
    const daySchedule = vetSchedule.find(schedule => schedule.day_of_week === dayOfWeek);

    if (!daySchedule || !daySchedule.is_available) {
      setMessage('The selected date is not available for this veterinarian.')
      setLoading(false)
      return
    }

    // Check if the selected time is within the vet's available hours
    if (appointmentTime < daySchedule.start_time || appointmentTime > daySchedule.end_time) {
      setMessage(`The selected time is outside the veterinarian's available hours (${daySchedule.start_time} - ${daySchedule.end_time}).`)
      setLoading(false)
      return
    }

    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)

    // Prepare form data for submission
    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('vet_id', vet.id);
    formData.append('appointment_datetime', appointmentDateTime.toISOString());
    formData.append('status', 'pending');
    formData.append('reason', reason);

    // Add images to form data
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create appointment');
      }

      setMessage('Appointment requested successfully! You will be redirected to your appointments page.')
      setTimeout(() => {
        router.push('/appointments')
      }, 2000)
    } catch (error: any) {
      setMessage('Error creating appointment: ' + error.message)
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
        <select
          id="appointmentTime"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
          disabled={availableTimes.length === 0}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
        >
          <option value="">Select a time</option>
          {availableTimes.map((time, index) => (
            <option key={index} value={time}>{time}</option>
          ))}
        </select>
        {availableTimes.length === 0 && appointmentDate && (
          <p className="mt-1 text-sm text-red-600">No available times for the selected date.</p>
        )}
      </div>

      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
          Reason for Appointment
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Describe why you're booking this appointment (e.g., symptoms, concerns)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Upload Images (optional)
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <div className="flex text-sm text-gray-600">
              <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload images</span>
                <input
                  id="images"
                  name="images"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {/* Preview uploaded images */}
        {images.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Images:</h4>
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {message && <p className="text-sm text-center text-gray-600">{message}</p>}

      <button
        type="submit"
        disabled={loading || availableTimes.length === 0}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? 'Requesting...' : 'Request Appointment'}
      </button>
    </form>
  )
}
