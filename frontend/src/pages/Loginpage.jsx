import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../services/Authservice'
import { useAuth } from '../context/AuthContext'
import PasswordInput from '../components/PasswordInput'

function Loginpage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
     try {
    // detect if user typed an email or a username
    const isEmail = formData.email.includes('@')
    
    const payload = isEmail
      ? { email: formData.email, password: formData.password }
      : { username: formData.email, password: formData.password }

    const result = await loginUser(payload)

    if (result.action === 'otp_required') {
      navigate('/verify-otp', { state: { email: result.email } })
    } else if (result.action === 'login') {
      login(result.user)
      navigate('/')
    }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8', width: '100%', maxWidth: '400px' }}
        className="rounded-xl p-8"
      >
        {/* Header */}
        <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
          Welcome back
        </h1>
        <p style={{ color: '#9A8880' }} className="text-sm mb-6">
          Login with your NUS email or username
        </p>

        {/* Error */}
        {error && (
          <div
            style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
            className="text-sm px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
              Email or username
            </label>
            <input
              name="email"
              type="text"
              placeholder="e0123456@u.nus.edu or username"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
              className="px-3 py-2 rounded-lg text-sm outline-none"
            />
          </div>

          {/* Password */}
          <PasswordInput name="password" value={formData.password} onChange={handleChange} />
          <div className="text-right -mt-2">
            <Link to="/forgot-password" style={{ color: '#C4552A' }} className="text-xs hover:underline">
              Forgot password?
            </Link>
          </div>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? '#9A8880' : '#C4552A', color: '#fff' }}
            className="py-2.5 rounded-full text-sm font-medium mt-1 hover:opacity-90"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p style={{ color: '#9A8880' }} className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#C4552A' }} className="font-medium hover:underline">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Loginpage