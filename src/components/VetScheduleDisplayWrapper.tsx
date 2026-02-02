'use client';

import { useState, useEffect } from 'react';

type ScheduleItem = {
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string;  // Format: HH:MM
  end_time: string;    // Format: HH:MM
  is_available: boolean;
};

type VetScheduleProps = {
  vetId: string;
};

const daysOfWeek = [
  { id: 0, name: 'Sun' },
  { id: 1, name: 'Mon' },
  { id: 2, name: 'Tue' },
  { id: 3, name: 'Wed' },
  { id: 4, name: 'Thu' },
  { id: 5, name: 'Fri' },
  { id: 6, name: 'Sat' },
];

export default function VetScheduleDisplay({ vetId }: VetScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/veterinarian-schedule/${encodeURIComponent(vetId)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }
        
        const data = await response.json();
        if (data.success) {
          setSchedule(data.schedule);
        } else {
          setError(data.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching the schedule');
      } finally {
        setLoading(false);
      }
    };

    if (vetId) {
      fetchSchedule();
    }
  }, [vetId]);

  if (loading) {
    return <p className="text-gray-500 text-sm">Loading schedule...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-sm">Error: {error}</p>;
  }

  // Group schedule by availability status
  const availableDays = schedule.filter(item => item.is_available);
  const unavailableDays = schedule.filter(item => !item.is_available);

  return (
    <div className="mt-2">
      <h4 className="text-sm font-medium text-gray-700 mb-1">Weekly Schedule</h4>

      {availableDays.length > 0 ? (
        <div className="space-y-1">
          {availableDays.map((day) => {
            const dayName = daysOfWeek.find(d => d.id === day.day_of_week)?.name || '';
            return (
              <div key={`${day.day_of_week}-${day.start_time}`} className="flex justify-between text-xs">
                <span className="text-green-600 font-medium">{dayName}</span>
                <span className="text-gray-600">{day.start_time} - {day.end_time}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No available hours this week</p>
      )}

      {unavailableDays.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer">Show unavailable days</summary>
          <div className="mt-1 space-y-1">
            {unavailableDays.map((day) => {
              const dayName = daysOfWeek.find(d => d.id === day.day_of_week)?.name || '';
              return (
                <div key={`${day.day_of_week}-${day.start_time}`} className="flex justify-between text-xs">
                  <span className="text-red-600">{dayName}</span>
                  <span className="text-gray-400">Unavailable</span>
                </div>
              );
            })}
          </div>
        </details>
      )}
    </div>
  );
}