import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/Authservice'
import PasswordInput from '../components/PasswordInput'

function Registerpage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
  })
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
      const result = await registerUser(formData)
      if (result.action === 'otp_required') {
        // Pass email to OTP page so it knows who to verify
        navigate('/verify-otp', { state: { email: formData.email } })
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
        style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E0D8', width: '100%', maxWidth: '440px' }}
        className="rounded-xl p-8"
      >
        {/* Header */}
        <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
          Create your account
        </h1>
        <p style={{ color: '#9A8880' }} className="text-sm mb-6">
          NUS email required for verification
        </p>

        {/* Error message */}
        {error && (
          <div
            style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
            className="text-sm px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* First + Last name row */}
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1">
              <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
                First name
              </label>
              <input
                name="firstName"
                type="text"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
                className="px-3 py-2 rounded-lg text-sm outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
                Last name
              </label>
              <input
                name="lastName"
                type="text"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
              NUS Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="e0123456@u.nus.edu"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
              className="px-3 py-2 rounded-lg text-sm outline-none"
            />
          </div>

          {/* Username */}
          <div className="flex flex-col gap-1">
            <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
              Username
            </label>
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
              className="px-3 py-2 rounded-lg text-sm outline-none"
            />
          </div>
          {/* Password */}
          <PasswordInput name="password" value={formData.password} onChange={handleChange} />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? '#9A8880' : '#C4552A', color: '#fff' }}
            className="py-2.5 rounded-full text-sm font-medium mt-1 hover:opacity-90"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

        </form>

        {/* Footer */}
        <p style={{ color: '#9A8880' }} className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#C4552A' }} className="font-medium hover:underline">
            Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Registerpage