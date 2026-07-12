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

  return (
    <nav style={{ backgroundColor: '#1A1512' }} className="px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center gap-6">

        <Link to="/" style={{ color: '#F0EAE4', fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold tracking-tight">
          NUSphere
        </Link>

        <div className="flex items-center gap-8">
          <Link to="/" style={{ color: '#F5F0EB' }} className="text-sm font-medium hover:opacity-70">
            Home
          </Link>
          <Link to="/topics" style={{ color: '#B8ADA4' }} className="text-sm hover:opacity-70">
            Topics
          </Link>
          <Link to="/collaborate" style={{ color: '#B8ADA4' }} className="text-sm hover:opacity-70">
            Collaborate
          </Link>
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
              <Link
                to={`/u/${user.username}`}
                style={{ backgroundColor: '#F5F0EB', color: '#9A8880' }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold hover:opacity-80"
              >
                {user.firstName?.[0]?.toUpperCase()}
              </Link>
              <Link to={`/u/${user.username}`} style={{ color: '#F5F0EB' }} className="text-sm font-medium hover:opacity-70">
                {user.username}
              </Link>
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