import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Fetch the user's profile to check their role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    // If not an admin, redirect them
    console.warn('Non-admin user attempted to access admin dashboard.')
    return redirect('/') // Or a '/permission-denied' page
  }

  // Fetch all pending veterinarian profiles
  const { data: pendingVets, error: vetsError } = await supabase
    .from('profiles')
    .select('id, name, email, location, specialization, verification_status')
    .eq('role', 'veterinarian')
    .eq('verification_status', 'pending')
    .order('created_at', { ascending: true })

  if (vetsError) {
    console.error('Error fetching pending vets:', vetsError)
    return (
      <div className="p-4 text-center text-red-500">
        <p>Could not fetch pending veterinarians.</p>
      </div>
    )
  }

  // Fetch all users for user management
  const { data: allUsers, error: usersError } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('Error fetching users:', usersError)
    return (
      <div className="p-4 text-center text-red-500">
        <p>Could not fetch users.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4">
      <AdminDashboard pendingVets={pendingVets} allUsers={allUsers} />
    </div>
  )
}
