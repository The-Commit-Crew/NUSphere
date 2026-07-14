import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSearch } from '../context/SearchContext'
import NotificationBell from './NotificationBell'

const SORT_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'top', label: 'Top' },
  { value: 'hot', label: 'Hot' },
]

// ── Icons (inline SVG, matches the search-icon style already in this file — no new dependency) ──
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

function SortDropdown({ sortBy, setSortBy }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1 pl-3 pr-2.5 py-2 text-sm font-medium"
        style={{
          color: '#F0EAE4',
          borderRight: '1px solid #4A423C',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {currentLabel}
        <svg
          width="20" height="25" viewBox="0 0 24 24" fill="currentColor"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
        >
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 rounded-lg overflow-hidden z-20"
          style={{
            backgroundColor: '#1A1512',
            border: '1px solid #2C2420',
            minWidth: '140px',
          }}
        >
          {SORT_OPTIONS.map(option => (
            <button
              key={option.value}
              onClick={() => { setSortBy(option.value); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm hover:opacity-80"
              style={{
                color: option.value === sortBy ? '#F0EAE4' : '#B8ADA4',
                backgroundColor: option.value === sortBy ? '#2C2420' : 'transparent',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Navbar() {
  const { user, logout } = useAuth()
  const { setSearchQuery, sortBy, setSortBy } = useSearch()
  const navigate = useNavigate()
  const location = useLocation()

  const [searchInput, setSearchInput] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const trimmed = searchInput.trim()
      setSearchQuery(trimmed)
      if (trimmed && location.pathname !== '/') {
        navigate('/')
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  function handleLogout() {
    logout()
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
      <div className="max-w-6xl mx-auto flex items-center gap-6">

        <Link to="/" style={{ color: '#F0EAE4', fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold tracking-tight">
          NUSphere
        </Link>

        <div className="flex items-center gap-1">
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

        <div
          className="flex items-center flex-1 max-w-md ml-auto rounded-lg text-sm transition-all"
          style={{
            backgroundColor: '#2C2420',
            border: `1px solid ${searchFocused ? '#C4552A55' : '#2C2420'}`,
          }}
        >
          <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />

          <div className="flex items-center gap-2 flex-1 px-3 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8A7A72' }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search..."
              className="bg-transparent outline-none flex-1 text-sm"
              style={{ color: '#F0EAE4', fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NotificationBell />
              <span style={{ color: '#F5F0EB' }} className="text-sm font-medium">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
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
    </nav>
  )
}

export default Navbar