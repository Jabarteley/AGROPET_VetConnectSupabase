import { redirect } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { cookies } from 'next/headers';
import { verifyToken, getUserById } from '@/lib/auth';
import { profileOperations } from '@/lib/dbOperations';
import { vetScheduleOperations } from '@/lib/dbOperations';

export default async function BookingPage({ params }: { params: { vet_id: string } }) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  const decodedToken = verifyToken(token as string);

  if (!decodedToken) {
    return redirect(`/login?redirectTo=/veterinarians/${params.vet_id}/book`);
  }

  const user = getUserById(decodedToken.userId);

  if (!user) {
    return redirect(`/login?redirectTo=/veterinarians/${params.vet_id}/book`);
  }

  // Decode the vet_id parameter in case it's URL-encoded
  const decodedVetId = decodeURIComponent(params.vet_id);
  const rawVet = profileOperations.getById(decodedVetId);

  type VetProfile = {
    id: string
    name: string | null
    is_available: boolean
  }

  const vet = rawVet as VetProfile;

  if (!vet || rawVet?.role !== 'veterinarian') {
    return (
      <div className="p-4 text-center">
        <p>Veterinarian not found or an error occurred.</p>
      </div>
    );
  }

  // Get the vet's schedule
  const vetSchedule = vetScheduleOperations.getByVetId(decodedVetId);

  // Check if the vet has any availability in their schedule
  const hasWeeklyAvailability = vetSchedule.some(day => day.is_available);

  if (!hasWeeklyAvailability) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Appointment Unavailable</h1>
          <p className="text-lg text-gray-600 mb-8">
            Dr. {vet.name} currently has no available times for appointments.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          <span className="font-medium">Note:</span> This veterinarian has not set any available times for appointments.
                          Please check back later or find another veterinarian.
                        </p>
                      </div>
                    </div>
          </div>
          <div className="mt-6">
            <a
              href="/veterinarians"
              className="inline-block px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Find Another Veterinarian
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Book an Appointment</h1>
        <p className="text-lg text-gray-600 mb-8">
          With <span className="font-semibold">Dr. {vet.name}</span>
        </p>
        <BookingForm user={user} vet={vet} vetSchedule={vetSchedule} />
      </div>
    </div>
  );
}
