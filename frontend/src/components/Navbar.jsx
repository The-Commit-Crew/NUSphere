import { Link } from 'react-router-dom'

function Navbar() {
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link to="/login" 
            style={{ backgroundColor: '#C4552A', color: '#FFFFFF' }} 
            className="px-5 py-2 rounded-full text-sm font-medium hover:opacity-90">
            Login
          </Link>
        </div>

      </div>
    </nav>
  )
}

export default Navbar