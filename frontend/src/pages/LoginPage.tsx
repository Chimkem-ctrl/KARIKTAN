import { useState, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import api from '../api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
        const loggedInUser = await login(form.username, form.password)
        navigate(loggedInUser.role === 'admin' ? '/admin' : '/home')
    } catch (err: any) {
      const msg = err?.response?.data?.non_field_errors?.[0] || 'Login failed. Please try again.'
      setError(msg)
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
            "Crafted by hand.<br />Carried with pride."
          </blockquote>
          <p className="auth-sub">
            Supporting Filipino artisans from Marikina to Mindanao — one piece at a time.
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
            <h2>Welcome back</h2>
            <p>Sign in to your Kariktan account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="your_username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/register">Create one</Link>
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