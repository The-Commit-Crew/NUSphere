import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell' 

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8E0D8' }} className="px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Brand */}
        <Link to="/" style={{ color: '#1A1512' }} className="text-xl font-bold tracking-tight">
          NUSphere
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-8">
          <Link to="/" style={{ color: '#1A1512' }} className="text-sm hover:opacity-70">
            Home
          </Link>
          <Link to="/topics" style={{ color: '#1A1512' }} className="text-sm hover:opacity-70">
            Topics
          </Link>
          <Link to="/collaborate" style={{ color: '#1A1512' }} className="text-sm hover:opacity-70">
            Collaborate
          </Link>
        </div>

        {/* Right side — changes based on login state */}
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
          <Link
          to={`/u/${user.username}`}
          style={{ color: '#1A1512' }}
          className="text-sm font-medium hover:opacity-70"
        >
          {user.username}
        </Link>
          <button
            onClick={handleLogout}
            style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
            className="px-4 py-2 rounded-full text-sm hover:opacity-70"
          >
            Logout
          </button>
          
        </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ color: '#1A1512' }}
                className="text-sm hover:opacity-70"
              >
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