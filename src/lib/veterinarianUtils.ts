// Utility functions for veterinarian availability

/**
 * Determines if a veterinarian is currently available based on their weekly schedule
 * @param schedule - Array of day schedules
 * @returns boolean indicating if the vet is available at the current time
 */
export function isVetCurrentlyAvailable(schedule: any[]): boolean {
  if (!schedule || schedule.length === 0) {
    return false;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTime = now.toTimeString().substring(0, 5); // Format: HH:MM

  // Find today's schedule
  const todaysSchedule = schedule.find((day: any) => day.day_of_week === currentDay);

  if (!todaysSchedule || !todaysSchedule.is_available) {
    return false;
  }

  // Check if current time falls within the available time range
  const { start_time, end_time } = todaysSchedule;
  return currentTime >= start_time && currentTime <= end_time;
}

/**
 * Determines if a veterinarian has any availability in their weekly schedule
 * @param schedule - Array of day schedules
 * @returns boolean indicating if the vet has any available slots during the week
 */
export function hasWeeklyAvailability(schedule: any[]): boolean {
  if (!schedule || schedule.length === 0) {
    return false;
  }

  // Check if there's at least one day where the vet is available
  return schedule.some((day: any) => day.is_available);
}

/**
 * Gets the next available day for a veterinarian
 * @param schedule - Array of day schedules
 * @returns object with day info or null if no available days
 */
export function getNextAvailableDay(schedule: any[]): any | null {
  if (!schedule || schedule.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.toTimeString().substring(0, 5);

  // Look for available days starting from today
  for (let i = 0; i < 7; i++) {
    const dayIndex = (currentDay + i) % 7;
    const daySchedule = schedule.find((day: any) => day.day_of_week === dayIndex);

    if (daySchedule && daySchedule.is_available) {
      // If it's today and current time is before end time, return today
      if (i === 0 && currentTime <= daySchedule.end_time) {
        return { ...daySchedule, isToday: true };
      } else if (i > 0) {
        // Otherwise return the upcoming day
        return { ...daySchedule, isToday: false };
      }
    }
  }

  return null;
}