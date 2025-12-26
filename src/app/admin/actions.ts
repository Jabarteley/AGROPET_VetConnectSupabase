'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function suspendUser(userId: string) {
  const supabase = createClient()

  // Ensure the user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to perform this action.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only administrators can perform this action.' }
  }

  // Update the user's role to suspended
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'suspended' })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error suspending user:', error)
    return { error: 'Database error: Could not suspend user.' }
  }

  // Revalidate the admin page to show the updated user list
  revalidatePath('/admin')

  return { data }
}

export async function activateUser(userId: string) {
  const supabase = createClient()

  // Ensure the user is an admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to perform this action.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only administrators can perform this action.' }
  }

  // Update the user's role back to their original role (defaulting to farmer_pet_owner)
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'farmer_pet_owner' }) // Default to farmer_pet_owner, you might want to store the original role
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error activating user:', error)
    return { error: 'Database error: Could not activate user.' }
  }

  // Revalidate the admin page to show the updated user list
  revalidatePath('/admin')

  return { data }
}

export async function updateVetVerificationStatus(vetId: string, status: 'verified' | 'rejected') {
  const supabase = createClient()

  // Ensure the user is an admin (this is a redundant check, but good for server actions)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to perform this action.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    return { error: 'Unauthorized: Only administrators can perform this action.' }
  }

  // Update the veterinarian's verification status
  const { data, error } = await supabase
    .from('profiles')
    .update({ verification_status: status })
    .eq('id', vetId)
    .select()
    .single()

  if (error) {
    console.error('Error updating vet verification status:', error)
    return { error: 'Database error: Could not update veterinarian status.' }
  }

  // Revalidate the admin page to show the updated list
  revalidatePath('/admin')

  return { data }
}