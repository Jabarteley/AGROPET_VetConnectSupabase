import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116: single row not found
    console.error('Error fetching profile:', error)
    // Optionally, handle the error more gracefully in the UI
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">User Profile</h1>
        <ProfileForm user={user} profile={profile} />
      </div>
    </div>
  )
}
