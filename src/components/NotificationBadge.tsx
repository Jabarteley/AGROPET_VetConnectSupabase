'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

type Notification = {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | 'appointment_reminder'
  is_read: boolean
  created_at: string
}

export default function NotificationBadge() {
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (showDropdown) {
      fetchNotifications()
    }
  }, [showDropdown])

  useEffect(() => {
    fetchUnreadCount()

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes-full')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          // Only update if it belongs to the current user
          supabase.auth.getUser().then(({ data }) => {
            const userId = data.user?.id
            if (payload.new.user_id === userId) {
              setUnreadCount(prev => prev + 1)
              // If dropdown is open, also add to notifications list
              if (showDropdown) {
                setNotifications(prev => [payload.new as Notification, ...prev])
              }
            }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, showDropdown])

  const fetchUnreadCount = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('is_read', false)

    if (error) {
      console.error('Error fetching unread notification count:', error)
    } else {
      setUnreadCount(count || 0)
    }
  }

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10) // Limit to last 10 notifications

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
      setUnreadCount(prev => prev - 1)
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
      setUnreadCount(0)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700'
      case 'error': return 'bg-red-100 border-red-400 text-red-700'
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700'
      case 'appointment_reminder': return 'bg-blue-100 border-blue-400 text-blue-700'
      default: return 'bg-gray-100 border-gray-400 text-gray-700'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 rounded-full hover:bg-gray-100 relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${getTypeColor(notification.type)} ${
                    !notification.is_read ? 'font-semibold' : ''
                  }`}
                >
                  <div className="flex justify-between">
                    <h4 className="text-sm">{notification.title}</h4>
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
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}