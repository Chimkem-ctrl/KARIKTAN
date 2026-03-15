import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import type { Product } from '../product'
import ProductCard from '../components/ProductCard'
import './HomePage.css'

const CATEGORIES = [
  { key: 'bags',    label: 'Bags',    icon: '👜', desc: 'Totes, crossbodies & more' },
  { key: 'shoes',   label: 'Shoes',   icon: '👞', desc: 'Handcrafted Marikina leather' },
  { key: 'wallets', label: 'Wallets', icon: '👛', desc: 'Slim, bifold & card holders' },
  { key: 'pouch',   label: 'Pouches', icon: '🎒', desc: 'Coin, makeup & travel pouches' },
  { key: 'jackets', label: 'Jackets', icon: '🧥', desc: 'Full-grain biker & moto styles' },
]

const FEATURES = [
  { icon: '✦', label: 'Authentic Artisan', desc: 'Every piece handmade by Filipino craftsmen' },
  { icon: '✦', label: 'Free Shipping',     desc: 'On all orders above ₱2,000 nationwide' },
  { icon: '✦', label: 'Secure Checkout',   desc: 'Stripe-secured payments, always safe' },
  { icon: '✦', label: 'Easy Returns',      desc: '14-day hassle-free return policy' },
]

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/products/')
      .then(res => setFeatured((res.data.results ?? res.data).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="home">

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-eyebrow">Philippine Leather Crafts</p>
          <h1 className="hero-title">
            Beauty in<br /><em>Every Stitch</em>
          </h1>
          <p className="hero-desc">
            Discover handcrafted leather goods from Filipino artisans — bags, shoes,
            wallets, pouches, and jackets made with generations of skill.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="hero-btn hero-btn--primary">Shop Collection</Link>
            <Link to="/shop?category=bags" className="hero-btn hero-btn--ghost">Explore Bags</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img-frame">
            <div className="hero-img-placeholder">
              <div className="hero-placeholder-text">
                <span className="hpt-k">K</span>
                <span>Artisan Leather</span>
              </div>
            </div>
            <div className="hero-badge">
              <span className="hb-num">20+</span>
              <span className="hb-label">Years of Craft</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <div className="categories-section">
        <div className="section">
          <div className="section-header">
            <p className="section-eyebrow">Browse by Category</p>
            <h2 className="section-title">Find Your Perfect Piece</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.key}
                className="cat-card"
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => navigate(`/shop?category=${cat.key}`)}
              >
                <div className="cat-icon">{cat.icon}</div>
                <h3 className="cat-label">{cat.label}</h3>
                <p className="cat-desc">{cat.desc}</p>
                <div className="cat-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <div className="section">
        <div className="section-header">
          <p className="section-eyebrow">Handpicked for You</p>
          <h2 className="section-title">Featured Products</h2>
          <Link to="/shop" className="section-link">View All →</Link>
        </div>

        {loading ? (
          <div className="products-skeleton">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton-card" />)}
          </div>
        ) : featured.length === 0 ? (
          <div className="empty-featured">
            <p>No products yet. Add products from the Admin Dashboard.</p>
          </div>
        ) : (
          <div className="products-grid">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      {/* ── FEATURES STRIP ── */}
      <div className="features-strip">
        {FEATURES.map(f => (
          <div key={f.label} className="feature-item">
            <span className="feature-icon">{f.icon}</span>
            <div>
              <h4 className="feature-label">{f.label}</h4>
              <p className="feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── HERITAGE ── */}
      <div className="heritage">
        <div className="heritage-content">
          <p className="section-eyebrow" style={{ color: 'var(--tan)' }}>Our Mission</p>
          <h2 className="heritage-title">Supporting Filipino<br />Leather Artisans</h2>
          <p className="heritage-body">
            KARIKTAN — meaning <em>beauty and elegance</em> in Filipino — exists to give
            Philippine leather craftsmen a dedicated digital home. From Marikina's storied
            shoemaking heritage to artisan communities across the archipelago,
            every purchase supports a local family and a centuries-old craft.
          </p>
          <Link to="/shop" className="hero-btn hero-btn--ghost" style={{ display: 'inline-block', marginTop: '1.75rem' }}>
            Shop & Support Local
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: 'var(--parchment)', borderTop: '1px solid var(--border)' }}>
        <div className="footer">
          <div className="footer-brand">
            <div className="footer-logo-mark">K</div>
            <div>
              <p className="footer-name">KARIKTAN</p>
              <p className="footer-sub">Philippine Leather Crafts</p>
            </div>
          </div>
          <div className="footer-links">
            {CATEGORIES.map(c => (
              <Link key={c.key} to={`/shop?category=${c.key}`} className="footer-link">{c.label}</Link>
            ))}
          </div>
          <p className="footer-copy">© 2026 Kariktan · USTP-CdO · IT323 Application Development</p>
        </div>
      </div>

    </main>
  )
}