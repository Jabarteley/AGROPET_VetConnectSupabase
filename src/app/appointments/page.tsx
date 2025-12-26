import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppointmentsList from '@/components/AppointmentsList'

export default async function AppointmentsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login?redirectTo=/appointments')
  }

  // Fetch the user's role and name from their profile
  const { data: profile } = await supabase.from('profiles').select('role, name').eq('id', user.id).single()

  const getWelcomeMessage = () => {
    if (profile) {
      if (profile.role === 'veterinarian') {
        return `Dr. ${profile.name || user.email}'s Appointment Dashboard`
      }
      return `${profile.name || user.email}'s Appointments`
    }
    return 'My Appointments'
  }

  // Fetch all appointments related to the user
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .or(`user_id.eq.${user.id},vet_id.eq.${user.id}`)
    .order('appointment_datetime', { ascending: false })

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError)
    // Handle error in UI
    return <p className="p-4 text-center text-red-500">Could not fetch appointments.</p>
  }

  // Extract all unique user IDs from the appointments to fetch their profiles
  const userIds = [
    ...new Set(
      appointments.flatMap((appt) => [appt.user_id, appt.vet_id])
    ),
  ]

  // Fetch the profiles for all involved users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('id', userIds)

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
    // Handle error in UI
    return <p className="p-4 text-center text-red-500">Could not fetch user profiles.</p>
  }

  // Create a map of profile IDs to names for easy lookup
  const profileMap = new Map(profiles.map((p) => [p.id, p.name || p.email]))

  // Add the names to the appointment objects
  const enrichedAppointments = appointments.map((appt) => ({
    ...appt,
    client_name: profileMap.get(appt.user_id) || 'Unknown',
    vet_name: profileMap.get(appt.vet_id) || 'Unknown',
  }))

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">{getWelcomeMessage()}</h1>
        <AppointmentsList
          initialAppointments={enrichedAppointments}
          currentUser={{ id: user.id, role: profile?.role }}
        />
      </div>
    </div>
  )
}
