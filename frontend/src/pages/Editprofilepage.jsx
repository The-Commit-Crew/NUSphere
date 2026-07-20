
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePhoto,
  deleteProfilePhoto,
} from '../services/Authservice'
import { Camera, X } from 'lucide-react'

function isSafeImageSrc(url) {
  if (!url) return false
  try {
    // blob: URLs from URL.createObjectURL(), and same-origin/https URLs, are fine
    if (url.startsWith('blob:')) return true
    const parsed = new URL(url, window.location.origin)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function Editprofilepage() {
  const navigate = useNavigate()
  const { token, user } = useAuth()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    bio: '',
    githubLink: '',
    linkedinLink: '',
    skills: '',
  })

  // Photo state
  const [profilePic, setProfilePic] = useState('')   // currently saved photo (from server)
  const [previewUrl, setPreviewUrl] = useState('')    // local blob preview of a pending file
  const [pendingFile, setPendingFile] = useState(null)
  const [photoError, setPhotoError] = useState(null)  // { message, categories }
  const [photoBusy, setPhotoBusy] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      setLoading(true)
      setError('')
      try {
        const profile = await getUserProfile(user.username, token)
        setFormData({
          bio: profile.bio || '',
          githubLink: profile.githubLink || '',
          linkedinLink: profile.linkedinLink || '',
          skills: profile.skills?.map((skill) => skill.name).join(', ') || '',
        })
        setProfilePic(profile.profilePic || '')
      } catch (err) {
        setError('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user, token])

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError(null)

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setPhotoError({ message: 'Please choose a JPG, PNG, or WEBP image.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError({ message: 'Image must be under 5MB.' })
      return
    }

    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUploadPhoto() {
    if (!pendingFile) return
    setPhotoBusy(true)
    setPhotoError(null)
    try {
      const result = await uploadProfilePhoto(pendingFile)
      setProfilePic(result.profilePic)
      setPendingFile(null)
      setPreviewUrl('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setPhotoError({ message: err.message, categories: err.categories })
    } finally {
      setPhotoBusy(false)
    }
  }

  function handleCancelPreview() {
    setPendingFile(null)
    setPreviewUrl('')
    setPhotoError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleRemovePhoto() {
    setPhotoBusy(true)
    setPhotoError(null)
    try {
      await deleteProfilePhoto()
      setProfilePic('')
    } catch (err) {
      setPhotoError({ message: err.message })
    } finally {
      setPhotoBusy(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      await updateUserProfile(
        {
          bio: formData.bio,
          githubLink: formData.githubLink,
          linkedinLink: formData.linkedinLink,
          skills: skillsArray,
        },
        token
      )
      navigate(`/u/${user.username}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p style={{ color: '#9A8880' }}>Loading profile...</p>
      </div>
    )
  }

  const displayedPhoto = previewUrl || profilePic

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 style={{ color: '#1A1512' }} className="text-2xl font-bold mb-1">
        Edit profile
      </h1>
      <p style={{ color: '#9A8880' }} className="text-sm mb-6">
        Update your public profile
      </p>

      {error && (
        <div
          style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
          className="text-sm px-4 py-3 rounded-lg mb-4"
        >
          {error}
        </div>
      )}

      {/* Profile photo */}

{/* Profile photo */}
      <div className="flex flex-col gap-2 mb-6">
        <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
          Profile photo
        </label>

        <div className="flex items-center gap-4">
          {/* Wrapper — position:relative so the badge can sit on the circle's edge */}
          <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
            {/* Avatar circle — clips the photo/placeholder into a circle */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                cursor: 'pointer',
                border: '2px solid #E8E0D8',
                overflow: 'hidden',
              }}
            >
             {displayedPhoto && isSafeImageSrc(displayedPhoto) ? (
  <img
    src={displayedPhoto}
    alt="Profile"
    style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '1px solid #E8E0D8',
    }}
  />
) : (
  <div
    style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      backgroundColor: '#F5F0EB',
      border: '1px solid #E8E0D8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9A8880',
      fontSize: '12px',
    }}
  >
    No photo
  </div>
)}
            </div>

            {/* Badge — sibling of the circle, NOT nested inside it, so it isn't clipped by overflow:hidden */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#1A1512',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #F5F0EB',
                cursor: 'pointer',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#F5F0EB" viewBox="0 0 256 256">
                <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208v77.38l-24.69-24.7a16,16,0,0,0-22.62,0L53.37,208H48ZM208,208H76l96-96,36,36v60ZM96,120A24,24,0,1,0,72,96,24,24,0,0,0,96,120Zm0-32a8,8,0,1,1-8,8A8,8,0,0,1,96,88Z"></path>
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-2">

      {/* Upload badge, bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: 28,
          height: 28,
          borderRadius: '50%',
          backgroundColor: '#1A1512',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #F5F0EB',
        }}
      >
        <Camera size={14} color="#F5F0EB" />
      </div>
    </div>

    {/* Hidden native input, triggered by the circle above */}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      onChange={handleFileSelect}
      style={{ display: 'none' }}
    />

    <div className="flex flex-col gap-2">
      

      <span style={{ color: '#9A8880', fontSize: '11px' }}>
        JPG, PNG or WEBP. Max 5MB.
      </span>

      {pendingFile && (
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={handleUploadPhoto}
            disabled={photoBusy}
            style={{ backgroundColor: '#C4552A', color: '#fff' }}
            className="px-4 py-1.5 rounded-full text-xs font-medium hover:opacity-90"
          >
            {photoBusy ? 'Uploading...' : 'Save photo'}
          </button>
          <button
            type="button"
            onClick={handleCancelPreview}
            disabled={photoBusy}
            style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
            className="px-4 py-1.5 rounded-full text-xs hover:opacity-70"
          >
            Cancel
          </button>
        </div>
      )}

      {!pendingFile && profilePic && (
        <button
          type="button"
          onClick={handleRemovePhoto}
          disabled={photoBusy}
          style={{ color: '#C4552A', fontSize: '12px', textAlign: 'left' }}
          className="hover:opacity-70 flex items-center gap-1 w-fit"
        >
          <X size={12} />
          {photoBusy ? 'Removing...' : 'Remove photo'}
        </button>
      )}
    </div>
  </div>

  {photoError && (
    <div
      style={{ backgroundColor: '#FFF0EB', border: '1px solid #C4552A', color: '#C4552A' }}
      className="text-xs px-3 py-2 rounded-lg"
    >
      {photoError.message}
      {photoError.categories?.length > 0 && (
        <div style={{ marginTop: 4, color: '#9A8880' }}>
          Flagged for: {photoError.categories.join(', ')}
        </div>
      )}
    </div>
  )}
</div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Bio */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Bio
          </label>
          <textarea
            name="bio"
            placeholder="Tell people a bit about yourself..."
            value={formData.bio}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            style={{
              border: '1px solid #E8E0D8',
              color: '#1A1512',
              backgroundColor: '#FAFAF8',
              resize: 'vertical',
            }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* GitHub */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            GitHub link
          </label>
          <input
            name="githubLink"
            type="text"
            placeholder="https://github.com/yourusername"
            value={formData.githubLink}
            onChange={handleChange}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* LinkedIn */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            LinkedIn link
          </label>
          <input
            name="linkedinLink"
            type="text"
            placeholder="https://linkedin.com/in/yourusername"
            value={formData.linkedinLink}
            onChange={handleChange}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-1">
          <label style={{ color: '#1A1512', fontSize: '13px' }} className="font-medium">
            Skills
          </label>
          <input
            name="skills"
            type="text"
            placeholder="e.g. Python, React, Figma (comma-separated)"
            value={formData.skills}
            onChange={handleChange}
            style={{ border: '1px solid #E8E0D8', color: '#1A1512', backgroundColor: '#FAFAF8' }}
            className="px-3 py-2 rounded-lg text-sm outline-none"
          />
          <span style={{ color: '#9A8880', fontSize: '12px' }}>
            Separate each skill with a comma
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={() => navigate(`/u/${user.username}`)}
            style={{ border: '1px solid #E8E0D8', color: '#9A8880' }}
            className="px-6 py-2.5 rounded-full text-sm hover:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: submitting ? '#9A8880' : '#C4552A', color: '#fff' }}
            className="px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90"
          >
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Editprofilepage