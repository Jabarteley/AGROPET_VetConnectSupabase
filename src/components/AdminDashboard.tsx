'use client'

import { useState } from 'react'
import UserManagement from './UserManagement'
import VetVerificationList from '@/components/VetVerificationList'

type VetProfile = {
  id: string
  name: string | null
  email: string
  location: string | null
  specialization: string | null
  verification_status: string
}

type UserProfile = {
  id: string
  email: string
  role: string
  created_at: string
}

export default function AdminDashboard({ pendingVets, allUsers }: { pendingVets: VetProfile[], allUsers: UserProfile[] }) {
  const [activeTab, setActiveTab] = useState('verifications')

  const handleUserAction = (userId: string, action: 'activate' | 'suspend') => {
    // This function is passed to UserManagement to trigger revalidation
    // The actual state update happens via server actions and page revalidation
    window.location.reload(); // Simple way to refresh data after action
  }

  return (
    <div className="w-full max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('verifications')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'verifications'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Vet Verifications
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content Moderation
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'verifications' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Pending Veterinarian Verifications</h2>
          {pendingVets.length > 0 ? (
            <VetVerificationList initialVets={pendingVets} />
          ) : (
            <p className="text-gray-500">No pending veterinarian profiles to verify.</p>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Management</h2>
          <UserManagement users={allUsers} onUserAction={handleUserAction} />
        </div>
      )}

      {activeTab === 'content' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Content Moderation</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-600 mb-4">Content moderation tools coming soon...</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Reported Messages</h3>
                  <p className="text-sm text-gray-500">Messages reported by users</p>
                </div>
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  5
                </span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Flagged Profiles</h3>
                  <p className="text-sm text-gray-500">Profiles reported for review</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  2
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}