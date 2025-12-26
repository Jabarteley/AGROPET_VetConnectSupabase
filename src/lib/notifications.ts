'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotification(userId: string, title: string, message: string, type: 'info' | 'warning' | 'success' | 'error' | 'appointment_reminder' = 'info') {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert([{ 
      user_id: userId,
      title,
      message,
      type
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    return { error: 'Database error: Could not create notification.' }
  }

  // Revalidate the relevant pages
  revalidatePath('/profile') // or wherever notifications are displayed
  
  return { data }
}

export async function scheduleAppointmentReminders() {
  const supabase = createClient()
  
  // Get appointments that are scheduled for tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0)).toISOString()
  const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999)).toISOString()
  
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      user_id,
      vet_id,
      appointment_datetime,
      profiles!appointments_user_id_fkey(name)
    `)
    .gte('appointment_datetime', tomorrowStart)
    .lt('appointment_datetime', tomorrowEnd)
    .eq('status', 'approved')
  
  if (error) {
    console.error('Error fetching appointments for reminders:', error)
    return { error: 'Database error: Could not fetch appointments for reminders.' }
  }
  
  if (!appointments || appointments.length === 0) {
    return { message: 'No appointments found for tomorrow.' }
  }
  
  // Create reminder notifications for each appointment
  for (const appointment of appointments) {
    // Send reminder to client
    await createNotification(
      appointment.user_id,
      'Appointment Reminder',
      `You have an appointment tomorrow at ${new Date(appointment.appointment_datetime).toLocaleString()}.`,
      'appointment_reminder'
    )
    
    // Send reminder to veterinarian
    await createNotification(
      appointment.vet_id,
      'Appointment Reminder',
      `You have an appointment tomorrow with ${appointment.profiles?.name || 'a client'} at ${new Date(appointment.appointment_datetime).toLocaleString()}.`,
      'appointment_reminder'
    )
  }
  
  return { message: `Scheduled reminders for ${appointments.length} appointments.` }
}