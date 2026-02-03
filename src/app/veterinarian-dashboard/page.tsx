import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, getUserById } from '@/lib/auth';
import { profileOperations } from '@/lib/dbOperations';
import VetScheduleManager from '@/components/VetScheduleManager';
import { vetScheduleOperations } from '@/lib/dbOperations';

export default async function VeterinarianDashboard() {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;
  const decodedToken = verifyToken(token as string);

  if (!decodedToken) {
    return redirect('/login?redirectTo=/veterinarian-dashboard');
  }

  const user = getUserById(decodedToken.userId);

  if (!user) {
    return redirect('/login?redirectTo=/veterinarian-dashboard');
  }

  const profile = profileOperations.getById(user.id);

  if (!profile || profile.role !== 'veterinarian') {
    return (
      <div className="flex flex-col items-center p-4 w-full">
        <div className="w-full max-w-2xl px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Access Denied</h1>
          <p className="text-center text-red-500">You must be logged in as a veterinarian to access this page.</p>
        </div>
      </div>
    );
  }

  // Fetch the veterinarian's schedule
  const vetSchedule = vetScheduleOperations.getByVetId(user.id);

  // Cast profile to the expected type for VetScheduleManager
  const typedProfile = {
    id: profile.id,
    name: profile.name,
    is_available: profile.is_available
  };

  return (
    <div className="flex flex-col items-center p-4 w-full">
      <div className="w-full max-w-2xl px-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Veterinarian Dashboard</h1>

        <VetScheduleManager profile={typedProfile} />

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/appointments"
              className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center hover:bg-indigo-100 transition-colors"
            >
              <h3 className="font-medium text-indigo-800">View Appointments</h3>
              <p className="text-sm text-gray-600 mt-1">Manage your scheduled appointments</p>
            </a>
            <a
              href="/profile"
              className="block p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-center hover:bg-indigo-100 transition-colors"
            >
              <h3 className="font-medium text-indigo-800">Edit Profile</h3>
              <p className="text-sm text-gray-600 mt-1">Update your profile information</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}