import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AuthButton from './AuthButton'

export default async function NavBar() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = profile?.role
  }

  return (
    <nav className="w-full bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex space-x-4 items-center">
            {/* Logo / Home Link */}
            <Link href="/" className="font-bold text-xl text-indigo-600">
              AGROPET
            </Link>

             {/* Public Nav */}
             <div className="hidden md:flex items-center space-x-2">
                 <Link href="/veterinarians" className="py-2 px-3 text-gray-700 hover:text-indigo-600 rounded">
                  Find a Vet
                </Link>
            </div>

            {/* Primary Nav (Authenticated Users) */}
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/appointments" className="py-2 px-3 text-gray-700 hover:text-indigo-600 rounded">
                  Appointments
                </Link>
                <Link href="/messages" className="py-2 px-3 text-gray-700 hover:text-indigo-600 rounded">
                  Messages
                </Link>
              </div>
            )}
          </div>

          {/* Secondary Nav & Auth */}
          <div className="flex items-center space-x-3">
             {user && userRole === 'admin' && (
                <Link href="/admin" className="py-2 px-3 text-sm font-semibold text-red-600 hover:text-red-800 rounded">
                  Admin
                </Link>
              )}
             {user && (
                 <Link href="/profile" className="py-2 px-3 hidden sm:block text-gray-700 hover:text-indigo-600 rounded">
                    My Profile
                </Link>
             )}
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}
