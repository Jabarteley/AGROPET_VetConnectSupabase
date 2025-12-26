'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(appointmentId: string, newStatus: 'approved' | 'cancelled' | 'completed') {
  const supabase = createClient()

  // Ensure the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to perform this action.' }
  }

  // Vets can approve or cancel; for now, we don't distinguish from clients cancelling
  // The RLS policies on the table provide the actual security
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: newStatus })
    .eq('id', appointmentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment status:', error)
    return { error: 'Database error: Could not update appointment status.' }
  }

  // Revalidate the appointments page to show the updated status
  revalidatePath('/appointments')

  return { data }
}
