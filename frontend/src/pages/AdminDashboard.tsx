import { useState, useEffect, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AvatarUpload from '../components/AvatarUpload'
import api from '../api'
import type { Product } from '../product'
import './AdminDashboard.css'

// ── Types ──────────────────────────────────────────────────────────────────────
interface Order {
  id: number
  buyer_name: string
  buyer_email: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  total_price: string
  full_name: string
  address: string
  phone: string
  items: { id: number; name: string; price: string; quantity: number; subtotal: number }[]
  created_at: string
}

interface Inquiry {
  id: number
  buyer_name: string
  buyer_email: string
  order_id: number | null
  subject: string
  message: string
  reply: string
  status: 'open' | 'replied' | 'closed'
  created_at: string
}

interface Analytics {
  total_revenue: number
  total_orders: number
  status_breakdown: { pending: number; processing: number; shipped: number; delivered: number }
  top_products: { name: string; total_sold: number }[]
  recent_orders: Order[]
}

interface RegisteredUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string
  created_at: string
}

type Tab = 'Overview' | 'Products' | 'Orders' | 'Inquiries' | 'Users'
type ProductCategory = 'bags' | 'shoes' | 'wallets' | 'pouch' | 'jackets'

const TABS: Tab[]         = ['Overview', 'Products', 'Orders', 'Inquiries', 'Users']
const CATEGORIES: ProductCategory[] = ['bags', 'shoes', 'wallets', 'pouch', 'jackets']
const STATUS_FLOW         = ['pending', 'processing', 'shipped', 'delivered'] as const

const EMPTY_FORM = { name: '', description: '', price: '', stock: '', category: 'bags' as ProductCategory }

const fmt      = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
const fmtDate  = (d: string) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
const mask     = (str: string, keep = 3) => str ? str.slice(0, keep) + '•'.repeat(Math.max(0, str.length - keep)) : '—'
const maskEmail = (email: string) => {
  const [local, domain] = email.split('@')
  return local ? `${local.slice(0, 2)}${'•'.repeat(Math.max(0, local.length - 2))}@${domain}` : '—'
}
const maskPhone = (phone: string) => phone ? phone.slice(0, 4) + '•'.repeat(Math.max(0, phone.length - 4)) : '—'
const statusColor = (s: string) => ({ pending: '#C4956A', processing: '#3B82F6', shipped: '#8B5CF6', delivered: '#22C55E' }[s] || '#888')
const inquiryColor = (s: string) => ({ open: '#EF4444', replied: '#3B82F6', closed: '#888' }[s] || '#888')

// ── Admin Profile Form ─────────────────────────────────────────────────────────
function AdminProfileForm({ onClose }: { onClose: () => void }) {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    phone:      user?.phone      || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState('')

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      await api.patch('/auth/me/', form)
      await refreshUser()
      setMsg('Profile updated.')
      setEditing(false)
    } catch {
      setMsg('Failed to update.')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="admin-profile-view">
        <div className="admin-profile-info">
          <div className="profile-info-row">
            <span className="profile-info-label">Full Name</span>
            <span className="profile-info-value">
              {user?.first_name || user?.last_name
                ? `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
                : <em style={{ color: 'var(--smoke)' }}>Not set</em>}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Username</span>
            <span className="profile-info-value">{user?.username}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Email</span>
            <span className="profile-info-value">{user?.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Phone</span>
            <span className="profile-info-value">
              {user?.phone || <em style={{ color: 'var(--smoke)' }}>Not set</em>}
            </span>
          </div>
          <div className="profile-info-row">
            <span className="profile-info-label">Role</span>
            <span className="profile-info-value">
              <span className="role-pill role-pill--admin">Administrator</span>
            </span>
          </div>
        </div>
        {msg && (
          <p style={{ fontSize: '0.8rem', color: '#166534', background: '#DCFCE7', padding: '0.5rem 0.75rem', borderRadius: '2px', width: '100%' }}>
            {msg}
          </p>
        )}
        <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', width: '100%' }}>
          <button type="button" className="admin-cancel-btn" onClick={onClose}>Close</button>
          <button type="button" className="admin-submit-btn" onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      </div>
    )
  }

  return (
    <form className="admin-profile-form" onSubmit={handleSave}>
      <div className="form-row">
        <div className="form-field">
          <label>First Name</label>
          <input
            value={form.first_name}
            onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
            placeholder="First name"
          />
        </div>
        <div className="form-field">
          <label>Last Name</label>
          <input
            value={form.last_name}
            onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
            placeholder="Last name"
          />
        </div>
      </div>
      <div className="form-field">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="admin@email.com"
        />
      </div>
      <div className="form-field">
        <label>Phone</label>
        <input
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="+63 9XX XXX XXXX"
        />
      </div>
      <div className="form-field">
        <label>Username</label>
        <input
          value={user?.username || ''}
          disabled
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
        />
      </div>
      {msg && (
        <p style={{ fontSize: '0.8rem', color: '#B91C1C', background: '#FEE2E2', padding: '0.5rem 0.75rem', borderRadius: '2px' }}>
          {msg}
        </p>
      )}
      <div className="form-actions" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <button type="button" className="admin-cancel-btn" onClick={() => { setEditing(false); setMsg('') }}>Cancel</button>
        <button type="submit" className="admin-submit-btn" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </form>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]             = useState<Tab>('Overview')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [products, setProducts]   = useState<Product[]>([])
  const [orders, setOrders]       = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [users, setUsers]         = useState<RegisteredUser[]>([])
  const [loading, setLoading]     = useState(false)

  const [showProfile, setShowProfile] = useState(false)

  // Product form
  const [showForm, setShowForm]       = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm]               = useState({ ...EMPTY_FORM })
  const [imageFile, setImageFile]     = useState<File | null>(null)
  const [formError, setFormError]     = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Order modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  // Inquiry modal
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [replyText, setReplyText]             = useState('')
  const [replyLoading, setReplyLoading]       = useState(false)

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    if (!user || user.role !== 'admin') return
    setLoading(true)
    const load = async () => {
      try {
        if (tab === 'Overview')  { const r = await api.get('/orders/analytics/'); setAnalytics(r.data) }
        if (tab === 'Products')  { const r = await api.get('/products/'); setProducts(r.data.results ?? r.data) }
        if (tab === 'Orders')    { const r = await api.get('/orders/'); setOrders(r.data) }
        if (tab === 'Inquiries') { const r = await api.get('/inquiries/'); setInquiries(r.data) }
        if (tab === 'Users')     { const r = await api.get('/auth/users/'); setUsers(r.data) }
      } catch { /* silent */ }
      setLoading(false)
    }
    load()
  }, [tab, user])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Product CRUD
  const openAdd = () => {
    setEditProduct(null); setForm({ ...EMPTY_FORM })
    setImageFile(null); setFormError(''); setShowForm(true)
  }
  const openEdit = (p: Product) => {
    setEditProduct(p)
    setForm({ name: p.name, description: p.description, price: p.price, stock: String(p.stock), category: p.category as ProductCategory })
    setImageFile(null); setFormError(''); setShowForm(true)
  }
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault(); setFormError(''); setFormLoading(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('description', form.description)
      fd.append('price', form.price)
      fd.append('stock', form.stock)
      fd.append('category', form.category)
      if (imageFile) fd.append('image', imageFile)
      if (editProduct) await api.patch(`/products/${editProduct.id}/`, fd)
      else await api.post('/products/', fd)
      const r = await api.get('/products/')
      setProducts(r.data.results ?? r.data)
      setShowForm(false)
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Failed to save product.')
    } finally {
      setFormLoading(false)
    }
  }
  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    await api.delete(`/products/${id}/`)
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  // Order status
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setStatusLoading(true)
    try {
      const r = await api.patch(`/orders/${orderId}/status/`, { status: newStatus })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: r.data.status } : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: r.data.status } : prev)
    } finally {
      setStatusLoading(false)
    }
  }

  // Inquiry reply
  const handleReply = async () => {
    if (!selectedInquiry) return
    setReplyLoading(true)
    try {
      const r = await api.patch(`/inquiries/${selectedInquiry.id}/`, { reply: replyText, status: 'replied' })
      setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? r.data : i))
      setSelectedInquiry(null); setReplyText('')
    } finally {
      setReplyLoading(false)
    }
  }

  return (
    <div className="admin-root">

      {/* ── SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div className="admin-logo-mark">K</div>
          <div>
            <p className="admin-logo-name">KARIKTAN</p>
            <p className="admin-logo-sub">Admin Panel</p>
          </div>
        </div>

        <nav className="admin-nav">
          {TABS.map(t => (
            <button
              key={t}
              className={`admin-nav-btn${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              <span className="admin-nav-icon">
                {t === 'Overview' ? '◈' : t === 'Products' ? '◉' : t === 'Orders' ? '◎' : t === 'Inquiries' ? '◌' : '◷'}
              </span>
              {t}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-action" onClick={() => setShowProfile(true)}>
            <div className="admin-avatar-wrap">
              {user?.profile_picture_url
                ? <img src={user.profile_picture_url} alt="avatar" className="admin-avatar-img" />
                : <div className="admin-avatar">{(user?.first_name?.[0] || user?.username?.[0] || 'A').toUpperCase()}</div>
              }
            </div>
            <div className="admin-user-info">
              <p className="admin-user-name">{user?.first_name || user?.username}</p>
              <p className="admin-user-role">Administrator</p>
            </div>
          </button>
          <button className="admin-logout-btn" onClick={handleLogout} title="Sign out">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-page-title">{tab}</h1>
          {tab === 'Products' && (
            <button className="admin-add-btn" onClick={openAdd}>+ Add Product</button>
          )}
        </div>

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div className="admin-overview">
            {loading ? (
              <div className="admin-loading">Loading analytics…</div>
            ) : analytics ? (
              <>
                <div className="stat-cards">
                  <div className="stat-card"><p className="stat-label">Total Revenue</p><p className="stat-value">{fmt(analytics.total_revenue)}</p><p className="stat-sub">From delivered orders</p></div>
                  <div className="stat-card"><p className="stat-label">Total Orders</p><p className="stat-value">{analytics.total_orders}</p><p className="stat-sub">All time</p></div>
                  <div className="stat-card"><p className="stat-label">Pending</p><p className="stat-value" style={{ color: '#C4956A' }}>{analytics.status_breakdown.pending}</p><p className="stat-sub">Awaiting processing</p></div>
                  <div className="stat-card"><p className="stat-label">Delivered</p><p className="stat-value" style={{ color: '#22C55E' }}>{analytics.status_breakdown.delivered}</p><p className="stat-sub">Completed</p></div>
                </div>
                <div className="overview-grid">
                  <div className="admin-card">
                    <h3 className="admin-card-title">Order Status</h3>
                    <div className="status-bars">
                      {STATUS_FLOW.map(s => {
                        const count = analytics.status_breakdown[s]
                        const pct   = analytics.total_orders ? Math.round((count / analytics.total_orders) * 100) : 0
                        return (
                          <div key={s} className="status-bar-row">
                            <div className="status-bar-label"><span className="status-dot" style={{ background: statusColor(s) }} /><span>{s.charAt(0).toUpperCase() + s.slice(1)}</span></div>
                            <div className="status-bar-track"><div className="status-bar-fill" style={{ width: `${pct}%`, background: statusColor(s) }} /></div>
                            <span className="status-bar-count">{count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="admin-card">
                    <h3 className="admin-card-title">Top Products</h3>
                    {analytics.top_products.length === 0 ? (
                      <p className="admin-empty-sm">No sales data yet.</p>
                    ) : (
                      <div className="top-products-list">
                        {analytics.top_products.map((p, i) => (
                          <div key={p.name} className="top-product-row">
                            <span className="tp-rank">#{i + 1}</span>
                            <span className="tp-name">{p.name}</span>
                            <span className="tp-sold">{p.total_sold} sold</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="admin-card" style={{ marginTop: '1rem' }}>
                  <h3 className="admin-card-title">Recent Orders</h3>
                  {analytics.recent_orders.length === 0 ? (
                    <p className="admin-empty-sm">No orders yet.</p>
                  ) : (
                    <table className="admin-table">
                      <thead><tr><th>Order #</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {analytics.recent_orders.map(o => (
                          <tr key={o.id}>
                            <td>#{o.id}</td>
                            <td>{o.buyer_name}</td>
                            <td>{fmt(parseFloat(o.total_price))}</td>
                            <td><span className="status-pill" style={{ background: statusColor(o.status) }}>{o.status}</span></td>
                            <td>{fmtDate(o.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : <p className="admin-empty-sm">No data available.</p>}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'Products' && (
          <div className="admin-products">
            {loading ? <div className="admin-loading">Loading…</div> : products.length === 0 ? (
              <div className="admin-empty">
                <p>No products yet.</p>
                <button className="admin-add-btn" onClick={openAdd}>Add your first product</button>
              </div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="admin-product-img">
                          {p.image_url ? <img src={p.image_url} alt={p.name} /> : <div className="admin-img-placeholder">K</div>}
                        </div>
                      </td>
                      <td className="product-name-cell">{p.name}</td>
                      <td><span className="cat-pill">{p.category}</span></td>
                      <td>{fmt(parseFloat(p.price))}</td>
                      <td><span className={`stock-badge${p.stock === 0 ? ' out' : p.stock < 5 ? ' low' : ''}`}>{p.stock === 0 ? 'Out' : p.stock}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit" onClick={() => openEdit(p)}>Edit</button>
                          <button className="action-btn delete" onClick={() => handleDelete(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'Orders' && (
          <div className="admin-orders">
            {loading ? <div className="admin-loading">Loading…</div> : orders.length === 0 ? (
              <div className="admin-empty"><p>No orders yet.</p></div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>Order #</th><th>Buyer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>
                        <p style={{ fontWeight: 500 }}>{o.buyer_name}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--smoke)' }}>{o.buyer_email}</p>
                      </td>
                      <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                      <td>{fmt(parseFloat(o.total_price))}</td>
                      <td><span className="status-pill" style={{ background: statusColor(o.status) }}>{o.status}</span></td>
                      <td>{fmtDate(o.created_at)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit" onClick={() => setSelectedOrder(o)}>View</button>
                          <button
                            className="action-btn"
                            style={{ background: '#F5EFE6', color: '#8B4A2B' }}
                            onClick={() => navigate(`/invoice/${o.id}`)}
                          >Invoice
                          </button>
                          {o.status !== 'delivered' && (
                            <button
                              className="action-btn approve"
                              disabled={statusLoading}
                              onClick={() => {
                                const next = STATUS_FLOW[STATUS_FLOW.indexOf(o.status as any) + 1]
                                if (next) handleStatusUpdate(o.id, next)
                              }}
                            >
                              → {STATUS_FLOW[STATUS_FLOW.indexOf(o.status as any) + 1] || ''}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* INQUIRIES */}
        {tab === 'Inquiries' && (
          <div className="admin-inquiries">
            {loading ? <div className="admin-loading">Loading…</div> : inquiries.length === 0 ? (
              <div className="admin-empty"><p>No inquiries yet.</p></div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Buyer</th><th>Subject</th><th>Order</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {inquiries.map(i => (
                    <tr key={i.id}>
                      <td>#{i.id}</td>
                      <td>
                        <p style={{ fontWeight: 500 }}>{i.buyer_name}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--smoke)' }}>{i.buyer_email}</p>
                      </td>
                      <td>{i.subject}</td>
                      <td>{i.order_id ? `#${i.order_id}` : '—'}</td>
                      <td><span className="status-pill" style={{ background: inquiryColor(i.status) }}>{i.status}</span></td>
                      <td>{fmtDate(i.created_at)}</td>
                      <td>
                        <button className="action-btn edit" onClick={() => { setSelectedInquiry(i); setReplyText(i.reply || '') }}>
                          {i.status === 'open' ? 'Reply' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* USERS */}
        {tab === 'Users' && (
          <div className="admin-users">
            {loading ? <div className="admin-loading">Loading…</div> : users.length === 0 ? (
              <div className="admin-empty"><p>No registered users yet.</p></div>
            ) : (
              <table className="admin-table">
                <thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : '—'}</td>
                      <td>{mask(u.username, 3)}</td>
                      <td>{maskEmail(u.email)}</td>
                      <td>{u.phone ? maskPhone(u.phone) : '—'}</td>
                      <td><span className={`role-pill role-pill--${u.role}`}>{u.role}</span></td>
                      <td>{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="privacy-note">⚠ Sensitive data is masked to protect user privacy.</p>
          </div>
        )}
      </main>

      {/* ── ADMIN PROFILE MODAL ── */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Admin Profile</h2>
              <button className="modal-close" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div className="admin-profile-body">
              <AvatarUpload size={80} editable />
              <AdminProfileForm onClose={() => setShowProfile(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ── PRODUCT FORM MODAL ── */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            {formError && <div className="admin-error">{formError}</div>}
            <form className="admin-form" onSubmit={handleFormSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label>Product Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Handcrafted Leather Tote" />
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} placeholder="Describe the product…" />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Price (₱)</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="0.00" />
                </div>
                <div className="form-field">
                  <label>Stock Quantity</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required placeholder="0" />
                </div>
              </div>
              <div className="form-field">
                <label>Product Image</label>
                <div className="file-upload-wrap" onClick={() => fileRef.current?.click()}>
                  {imageFile ? <span>{imageFile.name}</span> : editProduct?.image_url ? <span>Current image — click to replace</span> : <span>Click to upload image</span>}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="admin-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="admin-submit-btn" disabled={formLoading}>{formLoading ? 'Saving…' : editProduct ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="order-detail-grid">
              <div>
                <p className="detail-label">Buyer</p>
                <p className="detail-value">{selectedOrder.buyer_name} · {selectedOrder.buyer_email}</p>
                <p className="detail-label" style={{ marginTop: '1rem' }}>Ship To</p>
                <p className="detail-value">{selectedOrder.full_name}</p>
                <p className="detail-value">{selectedOrder.address}</p>
                <p className="detail-value">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="detail-label">Status</p>
                <span className="status-pill" style={{ background: statusColor(selectedOrder.status) }}>{selectedOrder.status}</span>
                <p className="detail-label" style={{ marginTop: '1rem' }}>Update Status</p>
                <div className="status-update-btns">
                  {STATUS_FLOW.map(s => (
                    <button
                      key={s}
                      className={`status-update-btn${selectedOrder.status === s ? ' current' : ''}`}
                      onClick={() => handleStatusUpdate(selectedOrder.id, s)}
                      disabled={statusLoading}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '0 1.5rem 1.5rem' }}>
              <p className="detail-label">Items</p>
              <table className="admin-table" style={{ marginTop: '0.5rem' }}>
                <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{fmt(parseFloat(item.price))}</td>
                      <td>{item.quantity}</td>
                      <td>{fmt(item.subtotal)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan={3}><strong>Total</strong></td>
                    <td><strong>{fmt(parseFloat(selectedOrder.total_price))}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="admin-submit-btn"
                onClick={() => navigate(`/invoice/${selectedOrder.id}`)}
              >
                View Full Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INQUIRY MODAL ── */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Inquiry #{selectedInquiry.id}</h2>
              <button className="modal-close" onClick={() => setSelectedInquiry(null)}>×</button>
            </div>
            <div className="inquiry-detail">
              <p className="detail-label">From</p>
              <p className="detail-value">{selectedInquiry.buyer_name} · {selectedInquiry.buyer_email}</p>
              <p className="detail-label" style={{ marginTop: '1rem' }}>Subject</p>
              <p className="detail-value">{selectedInquiry.subject}</p>
              <p className="detail-label" style={{ marginTop: '1rem' }}>Message</p>
              <div className="inquiry-message">{selectedInquiry.message}</div>
              {selectedInquiry.reply && (
                <>
                  <p className="detail-label" style={{ marginTop: '1rem' }}>Previous Reply</p>
                  <div className="inquiry-message inquiry-message--reply">{selectedInquiry.reply}</div>
                </>
              )}
              <p className="detail-label" style={{ marginTop: '1.25rem' }}>Your Reply</p>
              <textarea className="inquiry-reply-input" rows={4} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply…" />
            </div>
            <div className="form-actions">
              <button className="admin-cancel-btn" onClick={() => setSelectedInquiry(null)}>Cancel</button>
              {selectedInquiry.status !== 'closed' && (
                <button
                  className="admin-cancel-btn"
                  style={{ color: '#888', borderColor: '#ccc' }}
                  onClick={async () => {
                    await api.patch(`/inquiries/${selectedInquiry.id}/`, { status: 'closed' })
                    setInquiries(prev => prev.map(i => i.id === selectedInquiry.id ? { ...i, status: 'closed' } : i))
                    setSelectedInquiry(null)
                  }}
                > Close Inquiry
                </button>
              )}
              <button className="admin-submit-btn" onClick={handleReply} disabled={replyLoading || !replyText.trim()}>
                {replyLoading ? 'Sending…' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}