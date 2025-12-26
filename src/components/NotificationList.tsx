'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'appointment_reminder'
  is_read: boolean
  created_at: string
}

export default function NotificationList() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          // Only add notification if it belongs to the current user
          const currentUserId = supabase.auth.getUser().then(({ data }) => data.user?.id)
          currentUserId.then((userId) => {
            if (payload.new.user_id === userId) {
              setNotifications((prev) => [payload.new as Notification, ...prev])
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching notifications:', error)
    } else {
      setNotifications(data as Notification[])
    }
    setLoading(false)
  }

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error marking notification as read:', error)
    } else {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ))
    }
  }

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .is('is_read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
    } else {
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })))
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700'
      case 'error': return 'bg-red-100 border-red-400 text-red-700'
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700'
      case 'appointment_reminder': return 'bg-blue-100 border-blue-400 text-blue-700'
      default: return 'bg-gray-100 border-gray-400 text-gray-700'
    }
  }

  if (loading) {
    return <div className="p-4">Loading notifications...</div>
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No notifications</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${getTypeColor(notification.type)} ${
                !notification.is_read ? 'font-semibold' : ''
              }`}
            >
              <div className="flex justify-between">
                <h3 className="text-sm">{notification.title}</h3>
                {!notification.is_read && (
                  <button 
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <p className="text-sm mt-1">{notification.message}</p>
              <p className="text-xs mt-2 opacity-70">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}