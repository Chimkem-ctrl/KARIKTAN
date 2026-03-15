import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './CartPage.css'

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23E8D5BC" width="100" height="100"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="32" fill="%23C4956A">K</text></svg>'

export default function CartPage() {
  const { items, totalItems, totalPrice, removeFromCart, updateQty, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const profileIncomplete = !user?.phone || !user?.address

  if (items.length === 0) return (
    <div className="cart-empty">
      <div className="cart-empty-icon">🛒</div>
      <h2>Your cart is empty</h2>
      <p>Discover our handcrafted leather goods and add your favourites.</p>
      <Link to="/shop" className="cart-shop-btn">Browse Products</Link>
    </div>
  )

  return (
    <div className="cart-root">
      <div className="cart-header">
        <p className="cart-eyebrow">Your Selection</p>
        <h1 className="cart-title">Shopping Cart</h1>
        <p className="cart-count">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          <div className="cart-items-header">
            <button className="cart-clear-btn" onClick={clearCart}>Clear Cart</button>
          </div>
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img">
                <img
                  src={item.image_url || FALLBACK}
                  alt={item.name}
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK }}
                />
              </div>
              <div className="cart-item-info">
                <p className="cart-item-cat">{item.category}</p>
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="cart-item-actions">
                <div className="cart-qty">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>+</button>
                </div>
                <p className="cart-item-subtotal">₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>×</button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3 className="cart-summary-title">Order Summary</h3>
          <div className="cart-summary-rows">
            {items.map(item => (
              <div key={item.id} className="summary-row">
                <span>{item.name} × {item.quantity}</span>
                <span>₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>₱{totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
          </div>
          <p className="cart-summary-note">Shipping calculated at checkout</p>

          {/* Profile incomplete warning */}
          {profileIncomplete ? (
            <div className="cart-profile-warning">
              <div className="cart-warning-icon">⚠</div>
              <div>
                <p className="cart-warning-title">Contact details required</p>
                <p className="cart-warning-text">
                  Please add your {!user?.phone && !user?.address ? 'phone number and delivery address' : !user?.phone ? 'phone number' : 'delivery address'} before proceeding to checkout.
                </p>
                <Link to="/profile" className="cart-warning-link">
                  Complete Profile →
                </Link>
              </div>
            </div>
          ) : (
            <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
          )}

          <Link to="/shop" className="cart-continue-link">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  )
}