import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './InvoicePage.css'

interface OrderItem {
  id: number
  name: string
  price: string
  quantity: number
  subtotal: number
}

interface Order {
  id: number
  buyer_name: string
  buyer_email: string
  status: string
  total_price: string
  full_name: string
  address: string
  phone: string
  notes: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

const fmt     = (n: number | string) => `₱${parseFloat(String(n)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })

const STATUS_COLORS: Record<string, string> = {
  pending: '#C4956A', processing: '#3B82F6',
  shipped: '#8B5CF6', delivered: '#22C55E',
}

export default function InvoicePage() {
  const { id }   = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const printRef = useRef<HTMLDivElement>(null)

  const [order, setOrder]     = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get(`/orders/${id}/`)
      .then(r => setOrder(r.data))
      .catch(() => setError('Invoice not found or access denied.'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePrint = () => window.print()

  const shipping = order
    ? (parseFloat(order.total_price) >= 2000 ? 0 : 150)
    : 0
  const grandTotal = order
    ? parseFloat(order.total_price) + shipping
    : 0

  if (loading) return (
    <div className="invoice-loading">
      <div className="invoice-loading-spinner" />
      <p>Loading invoice…</p>
    </div>
  )

  if (error || !order) return (
    <div className="invoice-error">
      <h2>Invoice Not Found</h2>
      <p>{error || 'This invoice does not exist.'}</p>
      <button onClick={() => navigate(-1)} className="invoice-back-btn">Go Back</button>
    </div>
  )

  return (
    <div className="invoice-page">
      {/* Actions — hidden on print */}
      <div className="invoice-actions no-print">
        <button className="invoice-back-btn" 
        onClick={() => {
            if (window.history.length > 1) {
                navigate(-1)
            } else {
                navigate(user?.role === 'admin' ? '/admin' : '/profile')
            }
        }}
        >
        ← Back
        </button>


        <button className="invoice-print-btn" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="16" height="16">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / Save as PDF
        </button>
      </div>

      {/* Invoice document */}
      <div className="invoice-doc" ref={printRef}>

        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-logo-mark">K</div>
            <div>
              <h1 className="invoice-brand-name">KARIKTAN</h1>
              <p className="invoice-brand-sub">Philippine Leather Crafts</p>
            </div>
          </div>
          <div className="invoice-meta">
            <h2 className="invoice-title">INVOICE</h2>
            <table className="invoice-meta-table">
              <tbody>
                <tr>
                  <td className="meta-label">Invoice No.</td>
                  <td className="meta-value">INV-{String(order.id).padStart(5, '0')}</td>
                </tr>
                <tr>
                  <td className="meta-label">Order No.</td>
                  <td className="meta-value">#{order.id}</td>
                </tr>
                <tr>
                  <td className="meta-label">Date Issued</td>
                  <td className="meta-value">{fmtDate(order.created_at)}</td>
                </tr>
                <tr>
                  <td className="meta-label">Time</td>
                  <td className="meta-value">{fmtTime(order.created_at)}</td>
                </tr>
                <tr>
                  <td className="meta-label">Status</td>
                  <td className="meta-value">
                    <span
                      className="invoice-status"
                      style={{ color: STATUS_COLORS[order.status] || '#888' }}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* From / To */}
        <div className="invoice-parties">
          <div className="invoice-party">
            <p className="party-label">From</p>
            <p className="party-name">KARIKTAN</p>
            <p className="party-detail">Philippine Leather Crafts</p>
            <p className="party-detail">Cagayan de Oro City, Philippines</p>
            <p className="party-detail">support@kariktan.ph</p>
          </div>
          <div className="invoice-party">
            <p className="party-label">Bill To</p>
            <p className="party-name">{order.full_name}</p>
            <p className="party-detail">{order.buyer_email}</p>
            <p className="party-detail">{order.phone}</p>
            <p className="party-detail">{order.address}</p>
          </div>
        </div>

        <div className="invoice-divider" />

        {/* Items table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="col-no">#</th>
              <th className="col-item">Item Description</th>
              <th className="col-qty">Qty</th>
              <th className="col-unit">Unit Price</th>
              <th className="col-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id}>
                <td className="col-no">{i + 1}</td>
                <td className="col-item">
                  <p className="item-name">{item.name}</p>
                  <p className="item-cat">Handcrafted Philippine Leather</p>
                </td>
                <td className="col-qty">{item.quantity}</td>
                <td className="col-unit">{fmt(item.price)}</td>
                <td className="col-total">{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="totals-spacer" />
          <div className="totals-block">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>{fmt(order.total_price)}</span>
            </div>
            <div className="totals-row">
              <span>Shipping Fee</span>
              <span>{shipping === 0 ? 'Free' : fmt(shipping)}</span>
            </div>
            <div className="totals-row totals-row--discount">
              <span>Tax</span>
              <span>Included</span>
            </div>
            <div className="totals-divider" />
            <div className="totals-row totals-row--grand">
              <span>Grand Total</span>
              <span>{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="invoice-notes">
            <p className="notes-label">Order Notes</p>
            <p className="notes-text">{order.notes}</p>
          </div>
        )}

        <div className="invoice-divider" />

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-left">
            <p className="footer-thanks">Thank you for supporting Filipino artisans!</p>
            <p className="footer-note">
              This invoice serves as your official receipt for Order #{order.id}.
              For questions or concerns, please contact us at support@kariktan.ph or
              submit an inquiry through your profile.
            </p>
          </div>
          <div className="footer-right">
            <div className="footer-stamp">
              <p className="stamp-text">KARIKTAN</p>
              <p className="stamp-sub">Verified Purchase</p>
            </div>
          </div>
        </div>

        <p className="invoice-generated">
          Generated on {fmtDate(new Date().toISOString())} · {fmtTime(new Date().toISOString())}
        </p>
      </div>
    </div>
  )
}