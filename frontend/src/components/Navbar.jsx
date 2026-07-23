import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import Modal from './Modal'

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" />
    </svg>
  )
}
function CollaborateIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="9" rx="1.5" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  )
}

function Navbar() {
  const { user, logout, logoutAll } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogoutThisDevice() {
    setLoggingOut(true)
    await logout()
    setLoggingOut(false)
    setShowLogoutModal(false)
    navigate('/')
  }

  async function handleLogoutAllDevices() {
    setLoggingOut(true)
    await logoutAll()
    setLoggingOut(false)
    setShowLogoutModal(false)
    navigate('/')
  }

  const isHome = location.pathname === '/'
  const isCollaborate = location.pathname.startsWith('/collaborate')
  const isProfile = user && location.pathname === `/u/${user.username}`

  const navLinkStyle = (active) => ({
    color: active ? '#F0EAE4' : '#B8ADA4',
    backgroundColor: active ? '#2C2420' : 'transparent',
    fontWeight: active ? 600 : 400,
  })

  return (
    <nav style={{ backgroundColor: '#1A1512' }} className="px-6 py-4">
      <div className="max-w-6xl mx-auto grid items-center" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

        <Link to="/" style={{ color: '#F0EAE4', fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold tracking-tight justify-self-start">
          NUSphere
        </Link>

        <div className="flex items-center gap-1 justify-self-center">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:opacity-80"
            style={navLinkStyle(isHome)}
          >
            <HomeIcon /> Home
          </Link>
          <Link
            to="/collaborate"
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:opacity-80"
            style={navLinkStyle(isCollaborate)}
          >
            <CollaborateIcon /> Collaborate
          </Link>
          {user && (
            <Link
              to={`/u/${user.username}`}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:opacity-80"
              style={navLinkStyle(isProfile)}
            >
              <UserIcon /> My Profile
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3 justify-self-end">
          {user ? (
            <>
              <NotificationBell />
              <span style={{ color: '#F5F0EB' }} className="text-sm font-medium">
                {user.username}
              </span>
              <button
                onClick={() => setShowLogoutModal(true)}
                style={{ border: '1px solid #4A423C', color: '#B8ADA4' }}
                className="px-4 py-2 rounded-full text-sm hover:opacity-70"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: '#F5F0EB' }} className="text-sm hover:opacity-70">
                Login
              </Link>
              <Link
                to="/register"
                style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
                className="px-5 py-2 rounded-full text-sm font-medium hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

      </div>

      <Modal
        open={showLogoutModal}
        onClose={() => !loggingOut && setShowLogoutModal(false)}
        title="Log out"
      >
        <p style={{ color: '#6B5B52' }} className="mb-6 text-sm">
          Choose whether to log out of just this device, or end every active session everywhere.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogoutThisDevice}
            disabled={loggingOut}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512' }}
            className="w-full px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-80 disabled:opacity-50"
          >
            {loggingOut ? 'Logging out…' : 'Log out of this device'}
          </button>
          <button
            onClick={handleLogoutAllDevices}
            disabled={loggingOut}
            style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }}
            className="w-full px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loggingOut ? 'Logging out…' : 'Log out of all devices'}
          </button>
          <button
            onClick={() => setShowLogoutModal(false)}
            disabled={loggingOut}
            style={{ color: '#9A8880' }}
            className="w-full px-4 py-2 text-sm hover:opacity-70 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </nav>
  )
}

export default Navbar