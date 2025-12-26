'use client'

import { useState } from 'react'
import { suspendUser, activateUser } from '@/app/admin/actions'

type UserProfile = {
  id: string
  email: string
  role: string
  created_at: string
}

export default function UserManagement({ users, onUserAction }: { users: UserProfile[], onUserAction: (userId: string, action: 'activate' | 'suspend') => void }) {
  const [loading, setLoading] = useState<{[key: string]: boolean}>({})
  const [error, setError] = useState<string | null>(null)

  const handleSuspendUser = async (userId: string) => {
    setLoading(prev => ({ ...prev, [userId]: true }))
    setError(null)

    try {
      const result = await suspendUser(userId);
      if (result.error) {
        setError(result.error);
      } else {
        onUserAction(userId, 'suspend');
      }
    } catch (err) {
      setError('Failed to suspend user');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  }

  const handleActivateUser = async (userId: string) => {
    setLoading(prev => ({ ...prev, [userId]: true }))
    setError(null);

    try {
      const result = await activateUser(userId);
      if (result.error) {
        setError(result.error);
      } else {
        onUserAction(userId, 'activate');
      }
    } catch (err) {
      setError('Failed to activate user');
      console.error(err);
    } finally {
      setLoading(prev => ({ ...prev, [userId]: false }));
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'veterinarian' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {user.role === 'suspended' ? (
                    <button
                      onClick={() => handleActivateUser(user.id)}
                      disabled={loading[user.id]}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                    >
                      {loading[user.id] ? 'Activating...' : 'Activate'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspendUser(user.id)}
                      disabled={loading[user.id]}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {loading[user.id] ? 'Suspending...' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  )
}