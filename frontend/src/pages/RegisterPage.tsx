import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password2: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
        await register(form)
        navigate('/home')  // buyers only — admins are created manually
    } catch (err: any) {
      const data = err?.response?.data || {}
      const mapped: Record<string, string> = {}
      for (const [k, v] of Object.entries(data)) {
        mapped[k] = Array.isArray(v) ? (v as string[])[0] : String(v)
    }
    setErrors(mapped)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-panel auth-panel--left">
        <div className="auth-brand">
          <div className="auth-logo-mark">K</div>
          <h1 className="auth-logo-text">KARIKTAN</h1>
          <p className="auth-tagline">Philippine Leather Crafts</p>
        </div>
        <div className="auth-panel-body">
          <blockquote className="auth-quote">
            "Every stitch,<br />a story."
          </blockquote>
          <p className="auth-sub">
            Join our growing community and discover the finest Filipino leather goods,
            made by skilled artisans.
          </p>
          <div className="auth-ornament">
            <span /><span /><span />
          </div>
        </div>
        <div className="auth-panel-footer">
          <span>Bags</span><span className="sep">·</span>
          <span>Shoes</span><span className="sep">·</span>
          <span>Wallets</span><span className="sep">·</span>
          <span>Pouches</span><span className="sep">·</span>
          <span>Jackets</span>
        </div>
      </div>

      <div className="auth-panel auth-panel--right">
        <div className="auth-form-wrap">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Start your Kariktan journey today</p>
          </div>

          {errors.non_field_errors && <div className="auth-error">{errors.non_field_errors}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-row">
              <div className="auth-field">
                <label>First Name</label>
                <input type="text" placeholder="Juan" value={form.first_name} onChange={set('first_name')} required />
                {errors.first_name && <span className="field-error">{errors.first_name}</span>}
              </div>
              <div className="auth-field">
                <label>Last Name</label>
                <input type="text" placeholder="dela Cruz" value={form.last_name} onChange={set('last_name')} required />
                {errors.last_name && <span className="field-error">{errors.last_name}</span>}
              </div>
            </div>

            <div className="auth-field">
              <label>Username</label>
              <input type="text" autoComplete="username" placeholder="juandelacruz" value={form.username} onChange={set('username')} required />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="auth-field">
              <label>Email Address</label>
              <input type="email" autoComplete="email" placeholder="juan@email.com" value={form.email} onChange={set('email')} required />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label>Password</label>
                <input type="password" autoComplete="new-password" placeholder="min. 6 characters" value={form.password} onChange={set('password')} required />
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>
              <div className="auth-field">
                <label>Confirm Password</label>
                <input type="password" autoComplete="new-password" placeholder="repeat password" value={form.password2} onChange={set('password2')} required />
              </div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

        <div className="auth-right-deco" aria-hidden="true">
          <div className="deco-circle deco-circle--1" />
          <div className="deco-circle deco-circle--2" />
          <div className="deco-line" />
        </div>
      </div>
    </div>
  )
}