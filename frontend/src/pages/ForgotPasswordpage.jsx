import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../services/Authservice'

function ForgotPasswordpage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset({ email })
      setSent(true) // backend always returns same message regardless of whether account exists
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
        <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
          Reset your password
        </h1>
        <p style={{ color: '#9A8880' }} className="text-sm mb-6">
          Enter your NUS email and we'll send you a reset link
        </p>

        {error && (
          <div
            style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
            className="text-sm px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </div>
        )}

        {sent ? (
          <div
            style={{ backgroundColor: '#F5F0EB', color: '#1A1512' }}
            className="text-sm px-4 py-3 rounded-lg"
          >
            If an account exists for that email, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
                NUS Email
              </label>
              <input
                type="email"
                placeholder="e0123456@u.nus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
                className="px-3 py-2 rounded-lg text-sm outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#9A8880' : '#C4552A', color: '#fff' }}
              className="py-2.5 rounded-full text-sm font-medium mt-1 hover:opacity-90"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p style={{ color: '#9A8880' }} className="text-sm text-center mt-4">
          <Link to="/login" style={{ color: '#C4552A' }} className="font-medium hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPasswordpage