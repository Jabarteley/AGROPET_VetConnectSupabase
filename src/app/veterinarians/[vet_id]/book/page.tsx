import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingForm from '@/components/BookingForm'

export default async function BookingPage({ params }: { params: { vet_id: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Pass a redirectTo query param to come back after login
    return redirect(`/login?redirectTo=/veterinarians/${params.vet_id}/book`)
  }

  // Fetch veterinarian details
  const { data: vet, error: vetError } = await supabase
    .from('profiles')
    .select('id, name, location, specialization')
    .eq('id', params.vet_id)
    .eq('role', 'veterinarian')
    .single()

  if (vetError || !vet) {
    return (
      <div className="p-4 text-center">
        <p>Veterinarian not found or an error occurred.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
        <p className="text-lg text-gray-600 mb-8">
          With <span className="font-semibold">{vet.name}</span>
        </p>
        <BookingForm user={user} vet={vet} />
      </div>
    </div>
  )
}
