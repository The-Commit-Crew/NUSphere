import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyOtp, resendOtp } from '../services/Authservice'
import { useAuth } from '../context/AuthContext'

function Verifyotppage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  // Get email passed from register or login page
  const email = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await verifyOtp({ email, otp })
      if (result.action === 'verified') {
        login(result.user, result.token)
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setMessage('')
    setResending(true)
    try {
      const result = await resendOtp({ email })
      setMessage(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
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
          Check your email
        </h1>
        <p style={{ color: '#9A8880' }} className="text-sm mb-1">
          We sent a 6-digit code to
        </p>
        <p style={{ color: '#C4552A' }} className="text-sm font-medium mb-6">
          {email}
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

        {/* Success message for resend */}
        {message && (
          <div
            style={{ backgroundColor: '#F0FAF5', border: '1px solid #00A86B', color: '#00A86B' }}
            className="text-sm px-4 py-3 rounded-lg mb-4"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
              Verification code
            </label>
            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8', letterSpacing: '0.2em', textAlign: 'center', fontSize: '18px' }}
              className="px-3 py-3 rounded-lg outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: loading ? '#9A8880' : '#C4552A', color: '#fff' }}
            className="py-2.5 rounded-full text-sm font-medium hover:opacity-90"
          >
            {loading ? 'Verifying...' : 'Verify email'}
          </button>
        </form>

        {/* Resend */}
        <p style={{ color: '#9A8880' }} className="text-sm text-center mt-4">
          Didn't receive it?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ color: '#C4552A' }}
            className="font-medium hover:underline"
          >
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </p>

      </div>
    </div>
  )
}

export default Verifyotppage