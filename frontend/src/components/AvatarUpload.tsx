import { useRef, useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import './AvatarUpload.css'

interface Props {
  size?: number
  editable?: boolean
}

export default function AvatarUpload({ size = 64, editable = true }: Props) {
  const { user, refreshUser } = useAuth()
  const fileRef   = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const initials = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()
  const src      = preview || user?.profile_picture_url || null

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview immediately
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('profile_picture', file)
      await api.patch('/auth/me/', fd)
      await refreshUser()
      setPreview(null) // use server URL now
    } catch {
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`avatar-wrap${editable ? ' avatar-wrap--editable' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      onClick={() => editable && fileRef.current?.click()}
      title={editable ? 'Click to change photo' : undefined}
    >
      {src ? (
        <img src={src} alt="Profile" className="avatar-img" />
      ) : (
        <div className="avatar-initials">{initials}</div>
      )}

      {editable && (
        <div className="avatar-overlay">
          {loading ? (
            <span className="avatar-spinner" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  )
}