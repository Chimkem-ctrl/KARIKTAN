import { useState, useEffect, FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import AvatarUpload from '../components/AvatarUpload'
import api from '../api'
import './UserProfilePage.css'
import { Link } from 'react-router-dom'

interface Order {
  id: number
  status: string
  total_price: string
  items: { id: number; name: string; quantity: number; price: string }[]
  created_at: string
}

interface Inquiry {
  id: number
  subject: string
  message: string
  reply: string
  status: string
  order_id: number | null
  created_at: string
}

type ProfileTab = 'profile' | 'orders' | 'inquiries'

const STATUS_COLORS: Record<string, string> = {
  pending: '#C4956A', processing: '#3B82F6',
  shipped: '#8B5CF6', delivered: '#22C55E',
  open: '#EF4444', replied: '#3B82F6', closed: '#888'
}

export default function UserProfilePage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<ProfileTab>('profile')

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    phone:      user?.phone      || '',
    address:    user?.address    || '',
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg]       = useState('')

  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [cardSaved, setCardSaved] = useState(false)

  const [orders, setOrders]             = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  const [inquiries, setInquiries]       = useState<Inquiry[]>([])
  const [inqLoading, setInqLoading]     = useState(false)
  const [showInqForm, setShowInqForm]   = useState(false)
  const [inqForm, setInqForm]           = useState({ subject: '', message: '', order: '' })
  const [inqSending, setInqSending]     = useState(false)

  useEffect(() => {
    if (user) setProfileForm({ first_name: user.first_name, last_name: user.last_name, phone: user.phone, address: user.address })
  }, [user])

  useEffect(() => {
    if (tab === 'orders') {
      setOrdersLoading(true)
      api.get('/orders/').then(r => setOrders(r.data)).catch(() => {}).finally(() => setOrdersLoading(false))
    }
    if (tab === 'inquiries') {
      setInqLoading(true)
      api.get('/inquiries/').then(r => setInquiries(r.data)).catch(() => {}).finally(() => setInqLoading(false))
    }
  }, [tab])

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setProfileSaving(true); setProfileMsg('')
    try {
      await api.patch('/auth/me/', profileForm)
      setProfileMsg('Profile updated successfully.')
    } catch { setProfileMsg('Failed to update profile.') }
    finally { setProfileSaving(false) }
  }

  const formatCard   = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => v.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/')

  const saveCard = (e: FormEvent) => {
    e.preventDefault()
    setCardSaved(true)
    setTimeout(() => setCardSaved(false), 2500)
  }

  const sendInquiry = async (e: FormEvent) => {
    e.preventDefault(); setInqSending(true)
    try {
      const payload: any = { subject: inqForm.subject, message: inqForm.message }
      if (inqForm.order) payload.order = parseInt(inqForm.order)
      const r = await api.post('/inquiries/', payload)
      setInquiries(prev => [r.data, ...prev])
      setInqForm({ subject: '', message: '', order: '' })
      setShowInqForm(false)
    } catch {} finally { setInqSending(false) }
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  const fmt     = (n: string) => `₱${parseFloat(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  return (
    <div className="profile-root">
      <div className="profile-sidebar">
        <div className="profile-user-card">
          {/* Avatar with upload */}
          <AvatarUpload size={72} editable />
          <h3 className="profile-user-name">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}</h3>
          <p className="profile-user-email">{user?.email}</p>
          <span className="profile-role-badge">Buyer</span>
        </div>
        <nav className="profile-nav">
          {(['profile', 'orders', 'inquiries'] as ProfileTab[]).map(t => (
            <button key={t} className={`profile-nav-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'profile' ? '◈ My Profile' : t === 'orders' ? '◎ My Orders' : '◌ Inquiries'}
            </button>
          ))}
        </nav>
      </div>

      <div className="profile-main">

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="profile-section">
            <h2 className="profile-section-title">Personal Information</h2>
            <form className="profile-form" onSubmit={saveProfile}>
              <div className="profile-form-row">
                <div className="profile-field">
                  <label>First Name</label>
                  <input value={profileForm.first_name} onChange={e => setProfileForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Juan" />
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <input value={profileForm.last_name} onChange={e => setProfileForm(f => ({ ...f, last_name: e.target.value }))} placeholder="dela Cruz" />
                </div>
              </div>
              <div className="profile-field">
                <label>Phone Number</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="+63 9XX XXX XXXX" />
              </div>
              <div className="profile-field">
                <label>Delivery Address</label>
                <textarea value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} rows={3} placeholder="Street, Barangay, City, Province, ZIP" />
              </div>
              {profileMsg && <p className={`profile-msg${profileMsg.includes('success') ? ' success' : ' error'}`}>{profileMsg}</p>}
              <button type="submit" className="profile-save-btn" disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save Changes'}</button>
            </form>

            <div className="profile-divider" />

            <h2 className="profile-section-title">Card Details</h2>
            <p className="profile-card-note">Your card details are stored locally and never sent to our servers.</p>
            <form className="profile-form" onSubmit={saveCard}>
              <div className="profile-field">
                <label>Card Number</label>
                <input value={cardForm.number} onChange={e => setCardForm(f => ({ ...f, number: formatCard(e.target.value) }))} placeholder="0000 0000 0000 0000" maxLength={19} />
              </div>
              <div className="profile-field">
                <label>Cardholder Name</label>
                <input value={cardForm.name} onChange={e => setCardForm(f => ({ ...f, name: e.target.value }))} placeholder="JUAN DELA CRUZ" />
              </div>
              <div className="profile-form-row">
                <div className="profile-field">
                  <label>Expiry Date</label>
                  <input value={cardForm.expiry} onChange={e => setCardForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))} placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="profile-field">
                  <label>CVV</label>
                  <input value={cardForm.cvv} onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="•••" maxLength={3} type="password" />
                </div>
              </div>
              <button type="submit" className="profile-save-btn">{cardSaved ? '✓ Card Saved' : 'Save Card'}</button>
            </form>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div className="profile-section">
            <h2 className="profile-section-title">My Orders</h2>
            {ordersLoading ? <p className="profile-loading">Loading…</p> : orders.length === 0 ? (
              <div className="profile-empty"><p>No orders yet.</p></div>
            ) : (
              <div className="orders-list">
                {orders.map(o => (
                  <div key={o.id} className="order-card">
                    <div className="order-card-header">
                      <div><p className="order-id">Order #{o.id}</p><p className="order-date">{fmtDate(o.created_at)}</p></div>
                      <span className="status-pill" style={{ background: STATUS_COLORS[o.status] || '#888' }}>{o.status}</span>
                    </div>
                    <div className="order-items-list">
                      {o.items.map(item => (
                        <div key={item.id} className="order-item-row">
                          <span>{item.name} × {item.quantity}</span>
                          <span>{fmt(item.price)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-card-footer">
                      <span>Total</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span className="order-total">{fmt(o.total_price)}</span>
                        <Link
                          to={`/invoice/${o.id}`}
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 500,
                            color: 'var(--sienna)',
                            textDecoration: 'none',
                            letterSpacing: '0.06em',
                          }}
                        > 
                          View Invoice →
                        </Link>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── INQUIRIES ── */}
        {tab === 'inquiries' && (
          <div className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">My Inquiries</h2>
              <button className="profile-add-btn" onClick={() => setShowInqForm(v => !v)}>{showInqForm ? 'Cancel' : '+ New Inquiry'}</button>
            </div>
            {showInqForm && (
              <form className="inquiry-form" onSubmit={sendInquiry}>
                <div className="profile-field">
                  <label>Subject</label>
                  <input value={inqForm.subject} onChange={e => setInqForm(f => ({ ...f, subject: e.target.value }))} required placeholder="e.g. Question about my order" />
                </div>
                <div className="profile-field">
                  <label>Order # (optional)</label>
                  <input value={inqForm.order} onChange={e => setInqForm(f => ({ ...f, order: e.target.value }))} placeholder="Leave blank if not order-related" type="number" />
                </div>
                <div className="profile-field">
                  <label>Message</label>
                  <textarea value={inqForm.message} onChange={e => setInqForm(f => ({ ...f, message: e.target.value }))} required rows={4} placeholder="Describe your concern…" />
                </div>
                <button type="submit" className="profile-save-btn" disabled={inqSending}>{inqSending ? 'Sending…' : 'Submit Inquiry'}</button>
              </form>
            )}
            {inqLoading ? <p className="profile-loading">Loading…</p> : inquiries.length === 0 ? (
              <div className="profile-empty"><p>No inquiries yet.</p></div>
            ) : (
              <div className="inquiries-list">
                {inquiries.map(i => (
                  <div key={i.id} className="inquiry-card">
                    <div className="inquiry-card-header">
                      <div>
                        <p className="inquiry-subject">{i.subject}</p>
                        <p className="inquiry-date">{fmtDate(i.created_at)}{i.order_id ? ` · Order #${i.order_id}` : ''}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="status-pill" style={{ background: STATUS_COLORS[i.status] || '#888' }}>{i.status}</span>
                            {i.status !== 'closed' && (
                                <button
                                    className="inquiry-close-btn"
                                    onClick={async () => {
                                        await api.patch(`/inquiries/${i.id}/`, { status: 'closed' })
                                        setInquiries(prev => prev.map(x => x.id === i.id ? { ...x, status: 'closed' } : x))
                                    }}
                                    title='Close Inquiry'
                                    >×
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="inquiry-message">{i.message}</p>
                    {i.reply && (
                      <div className="inquiry-reply-box">
                        <p className="inquiry-reply-label">Admin Reply</p>
                        <p className="inquiry-reply-text">{i.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}