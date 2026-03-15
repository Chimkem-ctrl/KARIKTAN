import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import './CheckoutPage.css'

type Step = 'shipping' | 'payment' | 'review'

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23E8D5BC" width="80" height="80"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="28" fill="%23C4956A">K</text></svg>'

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('shipping')
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState<number | null>(null)

  // Shipping form
  const [shipping, setShipping] = useState({
    full_name: user?.first_name ? `${user.first_name} ${user.last_name}`.trim() : '',
    address:   user?.address || '',
    phone:     user?.phone   || '',
    notes:     '',
  })

  // Payment form (UI only — Stripe test mode)
  const [payment, setPayment] = useState({
    card_number: '',
    card_name:   '',
    expiry:      '',
    cvv:         '',
  })

  const fmt = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const formatCard   = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const formatExpiry = (v: string) => v.replace(/\D/g, '').slice(0, 4).replace(/(.{2})/, '$1/')

  const shippingValid = shipping.full_name && shipping.address && shipping.phone
  const paymentValid  = payment.card_number.replace(/\s/g, '').length === 16 && payment.card_name && payment.expiry.length === 5 && payment.cvv.length === 3

  const placeOrder = async () => {
    setPlacing(true); setError('')
    try {
      const orderItems = items.map(i => ({
        product_id: i.id,
        name:       i.name,
        price:      i.price,
        quantity:   i.quantity,
      }))
      const res = await api.post('/orders/', {
        full_name: shipping.full_name,
        address:   shipping.address,
        phone:     shipping.phone,
        notes:     shipping.notes,
        items:     orderItems,
      })
      setOrderId(res.data.id)
      clearCart()
      setStep('review') // reuse review step as success
    } catch {
      setError('Failed to place order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // ── Order success screen ──────────────────────────────────────
  if (orderId) {
    return (
      <div className="checkout-success">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Order Placed!</h1>
        <p className="success-sub">
          Thank you, {user?.first_name || user?.username}.
          Your order <strong>#{orderId}</strong> has been received.
        </p>
        <p className="success-note">
          You can track your order status in your profile under <em>My Orders</em>.
        </p>
        <div className="success-actions">
          <Link to={`/invoice/${orderId}`} className="success-btn success-btn--primary">
            View Invoice
          </Link>
          <Link to="/profile" className="success-btn success-btn--ghost">
            My Orders
          </Link>
          <Link to="/shop" className="success-btn success-btn--ghost">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  } 

  // ── Empty cart guard ──────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="success-btn success-btn--primary">Browse Products</Link>
      </div>
    )
  }

  const STEPS: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment',  label: 'Payment'  },
    { key: 'review',   label: 'Review'   },
  ]

  return (
    <div className="checkout-root">
      {/* Step indicator */}
      <div className="checkout-steps">
        {STEPS.map((s, i) => (
          <div key={s.key} className={`checkout-step${step === s.key ? ' active' : ''}${STEPS.indexOf(STEPS.find(x => x.key === step)!) > i ? ' done' : ''}`}>
            <div className="step-circle">{STEPS.indexOf(STEPS.find(x => x.key === step)!) > i ? '✓' : i + 1}</div>
            <span className="step-label">{s.label}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        {/* Left — form */}
        <div className="checkout-form-col">

          {/* ── SHIPPING ── */}
          {step === 'shipping' && (
            <div className="checkout-card">
              <h2 className="checkout-card-title">Shipping Information</h2>
              <div className="checkout-form">
                <div className="checkout-field">
                  <label>Full Name</label>
                  <input
                    value={shipping.full_name}
                    onChange={e => setShipping(s => ({ ...s, full_name: e.target.value }))}
                    placeholder="Juan dela Cruz" required
                  />
                </div>
                <div className="checkout-field">
                  <label>Delivery Address</label>
                  <textarea
                    value={shipping.address}
                    onChange={e => setShipping(s => ({ ...s, address: e.target.value }))}
                    rows={3} placeholder="Street, Barangay, City, Province, ZIP" required
                  />
                </div>
                <div className="checkout-field">
                  <label>Phone Number</label>
                  <input
                    value={shipping.phone}
                    onChange={e => setShipping(s => ({ ...s, phone: e.target.value }))}
                    placeholder="+63 9XX XXX XXXX" required
                  />
                </div>
                <div className="checkout-field">
                  <label>Order Notes <span className="optional">(optional)</span></label>
                  <textarea
                    value={shipping.notes}
                    onChange={e => setShipping(s => ({ ...s, notes: e.target.value }))}
                    rows={2} placeholder="Special instructions for your order…"
                  />
                </div>
                <button
                  className="checkout-next-btn"
                  onClick={() => setStep('payment')}
                  disabled={!shippingValid}
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {step === 'payment' && (
            <div className="checkout-card">
              <h2 className="checkout-card-title">Payment Details</h2>
              <div className="checkout-test-notice">
                <span>🔒</span>
                <span>Test mode — use card number <strong>4242 4242 4242 4242</strong>, any future expiry, any 3-digit CVV.</span>
              </div>
              <div className="checkout-form">
                <div className="checkout-field">
                  <label>Card Number</label>
                  <div className="card-input-wrap">
                    <input
                      value={payment.card_number}
                      onChange={e => setPayment(p => ({ ...p, card_number: formatCard(e.target.value) }))}
                      placeholder="0000 0000 0000 0000" maxLength={19}
                    />
                    <div className="card-brand-icons">
                      <span>VISA</span><span>MC</span>
                    </div>
                  </div>
                </div>
                <div className="checkout-field">
                  <label>Cardholder Name</label>
                  <input
                    value={payment.card_name}
                    onChange={e => setPayment(p => ({ ...p, card_name: e.target.value }))}
                    placeholder="JUAN DELA CRUZ"
                  />
                </div>
                <div className="checkout-row">
                  <div className="checkout-field">
                    <label>Expiry Date</label>
                    <input
                      value={payment.expiry}
                      onChange={e => setPayment(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                      placeholder="MM/YY" maxLength={5}
                    />
                  </div>
                  <div className="checkout-field">
                    <label>CVV</label>
                    <input
                      value={payment.cvv}
                      onChange={e => setPayment(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                      placeholder="•••" maxLength={3} type="password"
                    />
                  </div>
                </div>
                <div className="checkout-btn-row">
                  <button className="checkout-back-btn" onClick={() => setStep('shipping')}>← Back</button>
                  <button className="checkout-next-btn" onClick={() => setStep('review')} disabled={!paymentValid}>Review Order →</button>
                </div>
              </div>
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === 'review' && (
            <div className="checkout-card">
              <h2 className="checkout-card-title">Review Your Order</h2>

              <div className="review-section">
                <div className="review-section-header">
                  <h3>Shipping to</h3>
                  <button className="review-edit-btn" onClick={() => setStep('shipping')}>Edit</button>
                </div>
                <p className="review-text">{shipping.full_name}</p>
                <p className="review-text">{shipping.address}</p>
                <p className="review-text">{shipping.phone}</p>
                {shipping.notes && <p className="review-text review-text--note">{shipping.notes}</p>}
              </div>

              <div className="review-divider" />

              <div className="review-section">
                <div className="review-section-header">
                  <h3>Payment</h3>
                  <button className="review-edit-btn" onClick={() => setStep('payment')}>Edit</button>
                </div>
                <p className="review-text">•••• •••• •••• {payment.card_number.slice(-4)}</p>
                <p className="review-text">{payment.card_name}</p>
              </div>

              <div className="review-divider" />

              <div className="review-section">
                <h3>Items ({items.length})</h3>
                <div className="review-items">
                  {items.map(item => (
                    <div key={item.id} className="review-item">
                      <img
                        src={item.image_url || FALLBACK}
                        alt={item.name}
                        onError={e => { (e.target as HTMLImageElement).src = FALLBACK }}
                      />
                      <div className="review-item-info">
                        <p className="review-item-name">{item.name}</p>
                        <p className="review-item-qty">Qty: {item.quantity}</p>
                      </div>
                      <p className="review-item-price">{fmt(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="checkout-error">{error}</div>}

              <div className="checkout-btn-row">
                <button className="checkout-back-btn" onClick={() => setStep('payment')}>← Back</button>
                <button className="checkout-place-btn" onClick={placeOrder} disabled={placing}>
                  {placing ? <><span className="checkout-spinner" /> Placing Order…</> : `Place Order · ${fmt(totalPrice)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — order summary */}
        <div className="checkout-summary">
          <h3 className="checkout-summary-title">Order Summary</h3>
          <div className="checkout-summary-items">
            {items.map(item => (
              <div key={item.id} className="checkout-summary-item">
                <div className="csi-img">
                  <img
                    src={item.image_url || FALLBACK}
                    alt={item.name}
                    onError={e => { (e.target as HTMLImageElement).src = FALLBACK }}
                  />
                  <span className="csi-qty">{item.quantity}</span>
                </div>
                <span className="csi-name">{item.name}</span>
                <span className="csi-price">{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-divider" />
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{fmt(totalPrice)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Shipping</span>
            <span>{totalPrice >= 2000 ? 'Free' : fmt(150)}</span>
          </div>
          <div className="checkout-summary-divider" />
          <div className="checkout-summary-total">
            <span>Total</span>
            <span>{fmt(totalPrice >= 2000 ? totalPrice : totalPrice + 150)}</span>
          </div>
          <p className="checkout-summary-note">Free shipping on orders ₱2,000+</p>
        </div>
      </div>
    </div>
  )
}