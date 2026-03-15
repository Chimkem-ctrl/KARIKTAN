import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import './Navbar.css'

const CATEGORIES = ['Bags', 'Shoes', 'Wallets', 'Pouch', 'Jackets']

function NavAvatar({ size = 30 }: { size?: number }) {
  const { user } = useAuth()
  const initials = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()
  const src      = user?.profile_picture_url || null

  return (
    <div className="nav-avatar" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        : <span style={{ fontSize: size * 0.42 }}>{initials}</span>
      }
    </div>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { totalItems }   = useCart()
  const navigate         = useNavigate()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar-topbar">
        <span>Free shipping on orders over ₱2,000</span>
        <span className="topbar-sep">·</span>
        <span>Authentic Filipino Leather Crafts</span>
      </div>

      <div className="navbar-main">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-mark">K</div>
          <div className="navbar-logo-text">
            <span className="logo-name">KARIKTAN</span>
            <span className="logo-sub">Philippine Leather</span>
          </div>
        </Link>

        <nav className={`navbar-nav${menuOpen ? ' navbar-nav--open' : ''}`}>
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>Home</NavLink>
          {CATEGORIES.map(cat => (
            <NavLink key={cat} to={`/shop?category=${cat.toLowerCase()}`}
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              onClick={() => setMenuOpen(false)}>{cat}</NavLink>
          ))}
          <NavLink to="/shop" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={() => setMenuOpen(false)}>All</NavLink>
        </nav>

        <div className="navbar-actions">
          {!isAdmin && (
            <Link to="/cart" className="navbar-icon-btn" aria-label="Cart">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          )}

          {user ? (
            <div className="navbar-profile" ref={profileRef}>
              <button className="navbar-icon-btn profile-trigger" onClick={() => setProfileOpen(v => !v)}>
                <NavAvatar size={30} />
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <NavAvatar size={36} />
                    <div>
                      <p className="pd-name">{user.first_name ? `${user.first_name} ${user.last_name}` : user.username}</p>
                      <p className="pd-role">{user.role}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-body">
                    {isAdmin ? (
                      <Link to="/admin" className="pd-link pd-link--admin" onClick={() => setProfileOpen(false)}>Admin Dashboard</Link>
                    ) : (
                      <>
                        <Link to="/profile" className="pd-link" onClick={() => setProfileOpen(false)}>My Profile</Link>
                        <Link to="/cart"    className="pd-link" onClick={() => setProfileOpen(false)}>My Cart {totalItems > 0 && `(${totalItems})`}</Link>
                        <Link to="/profile" className="pd-link" onClick={() => setProfileOpen(false)}>My Orders</Link>
                        <Link to="/profile" className="pd-link" onClick={() => setProfileOpen(false)}>My Inquiries</Link>
                      </>
                    )}
                    <button className="pd-link pd-link--logout" onClick={handleLogout}>Sign Out</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-signin-btn">Sign In</Link>
          )}

          <button className={`navbar-burger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(v => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  )
}