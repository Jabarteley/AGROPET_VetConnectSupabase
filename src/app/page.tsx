import Link from 'next/link';
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
        return `Welcome back, Dr. ${profile.name || user.email}`;
      }
      return `Welcome back, ${profile.name || user.email}`;
    }
    return 'AGROPET VetConnect';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Connecting Farmers & Pet Owners</span>{' '}
                    <span className="block text-indigo-600 xl:inline">with Vet Professionals</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    AGROPET VetConnect bridges the gap between animal owners and certified veterinary professionals in Nigeria.
                    Book appointments, get expert advice, and improve animal welfare through timely access to professional care.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    {user ? (
                      <div className="rounded-md shadow">
                        <Link
                          href="/veterinarians"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                        >
                          Find a Vet
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="rounded-md shadow">
                          <Link
                            href="/register"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                          >
                            Get started
                          </Link>
                        </div>
                        <div className="mt-3 sm:mt-0 sm:ml-3">
                          <Link
                            href="/veterinarians"
                            className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                          >
                            Find a Vet
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <div className="h-64 w-full bg-indigo-50 sm:h-80 md:h-96 lg:w-full lg:h-full grid grid-cols-2 gap-2 p-2">
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/veterinary-animal-welfare.jpg"
                  alt="Pet Care"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                  Pet Care
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/images.jfif"
                  alt="Livestock Care"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                  Livestock Care
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/download.jfif"
                  alt="Expert Vet"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                  Expert Vet
                </div>
              </div>
              <div className="bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src="/one.jfif"
                  alt="Consultation"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1 text-sm">
                  Consultation
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-16">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                How AGROPET VetConnect Helps
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Our platform provides essential tools for connecting animal owners with qualified veterinarians.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12">
                <div className="relative p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Find Vets Easily</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Search for veterinarians by location, specialization, and animal type. Filter results to find the right professional for your needs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Book Appointments</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Schedule consultations with veterinarians at your convenience. Get reminders and manage your appointments in one place.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Secure Messaging</h3>
                      <p className="mt-2 text-base text-gray-500">
                        Communicate directly with veterinarians through our secure messaging system. Discuss concerns before or after appointments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative p-6 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Verified Professionals</h3>
                      <p className="mt-2 text-base text-gray-500">
                        All veterinarians on our platform are verified professionals with proper qualifications and certifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to improve animal welfare?</span>
              <span className="block text-indigo-200">Join AGROPET VetConnect today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
