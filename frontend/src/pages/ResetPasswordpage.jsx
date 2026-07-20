import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { resetPassword } from '../services/Authservice'
import PasswordInput from '../components/PasswordInput'

function ResetPasswordpage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(token, { newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
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
          Set a new password
        </h1>

        {error && (
          <div
            style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
            className="text-sm px-4 py-3 rounded-lg mb-4 mt-4"
          >
            {error}
          </div>
        )}

        {done ? (
          <div
            style={{ backgroundColor: '#F5F0EB', color: '#1A1512' }}
            className="text-sm px-4 py-3 rounded-lg mt-4"
          >
            Password updated. Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <PasswordInput
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              label="New password"
            />
            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: loading ? '#9A8880' : '#C4552A', color: '#fff' }}
              className="py-2.5 rounded-full text-sm font-medium mt-1 hover:opacity-90"
            >
              {loading ? 'Updating...' : 'Update password'}
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

export default ResetPasswordpage