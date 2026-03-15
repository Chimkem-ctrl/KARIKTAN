import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api'
import { useCart } from '../context/CartContext'
import type { Product } from '../product'
import './ProductDetailPage.css'

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23E8D5BC" width="400" height="400"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="80" fill="%23C4956A">K</text></svg>'

export default function ProductDetailPage() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const { addToCart, items } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty]         = useState(1)
  const [added, setAdded]     = useState(false)

  const inCart = items.some(i => i.id === product?.id)

  useEffect(() => {
    api.get(`/products/${id}/`)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleAdd = () => {
    if (!product) return
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image_url: product.image_url,
        category: product.category,
        stock: product.stock,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div className="pd-loading">
      <div className="pd-skeleton-img" />
      <div className="pd-skeleton-info">
        <div className="pd-skeleton-line" style={{ width: '60%' }} />
        <div className="pd-skeleton-line" style={{ width: '30%' }} />
        <div className="pd-skeleton-line" style={{ width: '80%' }} />
      </div>
    </div>
  )

  if (!product) return null

  return (
    <div className="pd-root">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`}>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <div className="pd-content">
        {/* Image */}
        <div className="pd-image-wrap">
          <img
            src={product.image_url || FALLBACK}
            alt={product.name}
            className="pd-image"
            onError={e => { (e.target as HTMLImageElement).src = FALLBACK }}
          />
          <span className="pd-cat-badge">{product.category}</span>
        </div>

        {/* Info */}
        <div className="pd-info">
          <p className="pd-eyebrow">Philippine Leather Craft</p>
          <h1 className="pd-name">{product.name}</h1>
          <p className="pd-price">₱{parseFloat(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>

          <div className="pd-divider" />

          <p className="pd-desc">{product.description}</p>

          <div className="pd-divider" />

          {/* Stock */}
          <div className="pd-stock">
            {product.stock === 0 ? (
              <span className="pd-stock-out">Out of Stock</span>
            ) : (
              <span className="pd-stock-in">
                <span className="stock-dot" /> {product.stock} in stock
              </span>
            )}
          </div>

          {/* Qty + Add to Cart */}
          {product.stock > 0 && (
            <div className="pd-actions">
              <div className="pd-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}>+</button>
              </div>
              <button
                className={`pd-add-btn${added ? ' added' : ''}`}
                onClick={handleAdd}
                disabled={added}
              >
                {added ? '✓ Added to Cart' : inCart ? 'Add More' : 'Add to Cart'}
              </button>
            </div>
          )}

          <div className="pd-meta">
            <div className="pd-meta-row"><span>Category</span><span>{product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span></div>
            <div className="pd-meta-row"><span>Availability</span><span>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
            <div className="pd-meta-row"><span>Origin</span><span>Philippines</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}