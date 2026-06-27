import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { getUserNotifications, markNotificationAsRead } from '../services/Authservice'

const NotificationContext = createContext(null)

const SOCKET_URL = import.meta.env.VITE_API_URL.replace('/api', '')

export function NotificationProvider({ children }) {
  const { user, token } = useAuth()
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
  if (!user || !token) {
    return
  }

  let isMounted = true

  async function fetchInitialNotifications() {
    try {
      const data = await getUserNotifications(token)
      if (isMounted) setNotifications(data)
    } catch (err) {
      console.error('Failed to load notifications:', err)
    }
  }
  fetchInitialNotifications()

  const socket = io(SOCKET_URL, {
    auth: { token },
  })

  socket.on('newNotification', (notification) => {
    setNotifications((prev) => [notification, ...prev])
  })

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message)
  })

  return () => {
    isMounted = false
    socket.disconnect()
    setNotifications([])
  }
}, [user, token])
  async function markAsRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId, token)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationContext)
}