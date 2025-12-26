import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const getWelcomeMessage = () => {
    if (profile && user) {
      if (profile.role === 'veterinarian') {
        return `Welcome, Dr. ${profile.name || user.email}`
      }
      return `Welcome, ${profile.name || user.email}`
    }
    return 'Welcome to AGROPET VetConnect'
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold">
          {getWelcomeMessage()}
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your centralized platform for veterinary services in Nigeria.
        </p>
      </div>
    </main>
  )
}
