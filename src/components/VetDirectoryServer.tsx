import { profileOperations, getProfilesWithSchedules } from '@/lib/dbOperations'
import Link from 'next/link'
import MessageVetForm from '@/components/MessageVetForm'
import { Suspense } from 'react'
import VetScheduleDisplayWrapper from '@/components/VetScheduleDisplayWrapper'
import { isVetCurrentlyAvailable, hasWeeklyAvailability } from '@/lib/veterinarianUtils'

// Define a type for the veterinarian profile data
type VetProfile = {
  id: string
  name: string | null
  location: string | null
  specialization: string | null
  service_regions: string | null
  profile_photo: string | null
  is_available: boolean
  schedule?: any[]
}

type VetDirectoryProps = {
  searchTerm?: string
}

export default async function VetDirectory({ searchTerm = '' }: VetDirectoryProps) {
  // Fetch veterinarians from the database with their schedules
  const filters = { role: 'veterinarian', verification_status: 'verified' };
  let veterinarians = getProfilesWithSchedules(filters) || [];

  // Apply search term if present
  if (searchTerm) {
    veterinarians = veterinarians.filter(vet =>
      (vet.name && vet.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vet.location && vet.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vet.specialization && vet.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  return (
    <div className="space-y-6">
      {/* Vet List */}
      {veterinarians.length === 0 ? (
        <p className="text-center text-gray-500">No verified veterinarians found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {veterinarians.map((vet) => {
            // Determine if the vet has any weekly availability
            const hasAvailability = hasWeeklyAvailability(vet.schedule || []);

            return (
              <div key={vet.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col">
                <div className="flex items-center mb-4">
                  {vet.profile_photo ? (
                    <img
                      src={vet.profile_photo}
                      alt={`${vet.name || 'Vet'}'s profile`}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center mr-4">
                      <span className="text-gray-500 text-2xl">+</span>
                    </div>
                  )}
                  <h2 className="text-xl font-bold text-gray-800">{vet.name || 'N/A'}</h2>
                </div>
                <div className="flex-grow">
                  <p className="text-gray-600 mt-2">
                    <strong>Location:</strong> {vet.location || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <strong>Specialization:</strong> {vet.specialization || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <strong>Service Regions:</strong> {vet.service_regions || 'N/A'}
                  </p>
                  <p className={`mt-2 font-semibold ${hasAvailability ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {hasAvailability ? 'Available This Week' : 'No Availabilities'}
                  </p>
                  <Suspense fallback={<p className="text-gray-500 text-sm">Loading schedule...</p>}>
                    <VetScheduleDisplayWrapper vetId={vet.id} />
                  </Suspense>
                </div>
                <div className="mt-4 flex flex-col space-y-2">
                  <Link
                    href={`/veterinarians/${vet.id}/book`}
                    className={`w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      hasAvailability
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    prefetch={false}
                    aria-disabled={!hasAvailability}
                  >
                    {hasAvailability ? 'Book Appointment' : 'Not Available'}
                  </Link>
                  {/* Message Vet Button */}
                  <MessageVetForm vetId={vet.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}