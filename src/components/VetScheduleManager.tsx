'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type DaySchedule = {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string;  // Format: HH:MM
  end_time: string;    // Format: HH:MM
  is_available: boolean;
};

type Profile = {
  id: string;
  name: string | null;
  is_available: boolean;
};

const daysOfWeek = [
  { id: 0, name: 'Sunday' },
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
];

export default function VetScheduleManager({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Initialize schedule state - default to all days unavailable
  const [schedule, setSchedule] = useState<DaySchedule[]>(
    daysOfWeek.map(day => ({
      day_of_week: day.id,
      start_time: '09:00',
      end_time: '17:00',
      is_available: false,
    }))
  );

  // Load existing schedule if available
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetch(`/api/veterinarian-schedule/${encodeURIComponent(profile.id)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.schedule) {
            // Map the loaded schedule to match our expected format
            const loadedSchedule = daysOfWeek.map(day => {
              const existingDay = data.schedule.find((s: DaySchedule) => s.day_of_week === day.id);
              return existingDay || {
                day_of_week: day.id,
                start_time: '09:00',
                end_time: '17:00',
                is_available: false,
              };
            });
            setSchedule(loadedSchedule);
          }
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
      }
    };

    if (profile.id) {
      loadSchedule();
    }
  }, [profile.id]);

  const handleDayChange = (dayId: number, field: keyof DaySchedule, value: string | boolean) => {
    setSchedule(prevSchedule => 
      prevSchedule.map(day => 
        day.day_of_week === dayId ? { ...day, [field]: value } : day
      )
    );
  };

  const toggleDayAvailability = (dayId: number) => {
    setSchedule(prevSchedule => 
      prevSchedule.map(day => 
        day.day_of_week === dayId ? { ...day, is_available: !day.is_available } : day
      )
    );
  };

  const saveSchedule = () => {
    // Validate the profile ID before making the request
    if (!profile.id || typeof profile.id !== 'string' || profile.id.trim() === '') {
      setMessage('Invalid profile ID. Cannot update schedule.');
      return;
    }

    startTransition(async () => {
      try {
        setMessage('');

        const response = await fetch(`/api/veterinarian-schedule/${encodeURIComponent(profile.id)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schedule }),
        });

        if (response.ok) {
          setMessage('Schedule updated successfully!');
          
          // Refresh the page to update the UI
          router.refresh();

          // Clear message after 3 seconds
          setTimeout(() => setMessage(''), 3000);
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || 'Failed to update schedule. Please try again.');
        }
      } catch (error) {
        console.error('Error updating schedule:', error);
        setMessage('An error occurred while updating schedule.');
      }
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Weekly Schedule</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {daysOfWeek.map(day => {
            const daySchedule = schedule.find(d => d.day_of_week === day.id) || {
              day_of_week: day.id,
              start_time: '09:00',
              end_time: '17:00',
              is_available: false,
            };

            return (
              <div key={day.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={daySchedule.is_available}
                      onChange={() => toggleDayAvailability(day.id)}
                      className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span className={`ml-2 font-medium ${daySchedule.is_available ? 'text-gray-900' : 'text-gray-500'}`}>
                      {day.name}
                    </span>
                  </label>
                </div>

                {daySchedule.is_available && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={daySchedule.start_time}
                      onChange={(e) => handleDayChange(day.id, 'start_time', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={daySchedule.end_time}
                      onChange={(e) => handleDayChange(day.id, 'end_time', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={saveSchedule}
          disabled={isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}