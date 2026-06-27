import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'

function timeAgo(dateString) {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleNotificationClick(notification) {
    if (!notification.isRead) {
      markAsRead(notification.id)
    }
    if (notification.postId) {
      navigate(`/posts/${notification.postId}`)
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
    onClick={() => setIsOpen((prev) => !prev)}
    style={{ color: '#C4552A' }}
    className="relative hover:opacity-70 flex items-center justify-center"
    >
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
    {unreadCount > 0 && (
        <span
        style={{ backgroundColor: '#C4552A', color: '#FFFFFF', fontSize: '10px' }}
        className="absolute -top-1 -right-1 rounded-full w-4 h-4 flex items-center justify-center font-bold"
        >
        {unreadCount > 9 ? '9+' : unreadCount}
        </span>
    )}
    </button>

      {isOpen && (
        <div
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8' }}
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          <div style={{ borderBottom: '1px solid #E8E0D8' }} className="px-4 py-3">
            <span style={{ color: '#1A1512' }} className="text-sm font-semibold">
              Notifications
            </span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ color: '#9A8880' }} className="text-sm px-4 py-6 text-center">
              No notifications yet
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  backgroundColor: notification.isRead ? '#FFFFFF' : '#FFF8F4',
                  borderBottom: '1px solid #E8E0D8',
                  cursor: notification.postId ? 'pointer' : 'default',
                }}
                className="px-4 py-3 hover:opacity-90"
              >
                <p style={{ color: '#1A1512' }} className="text-sm leading-snug">
                  {notification.message}
                </p>
                <span style={{ color: '#9A8880', fontSize: '11px' }}>
                  {timeAgo(notification.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationBell