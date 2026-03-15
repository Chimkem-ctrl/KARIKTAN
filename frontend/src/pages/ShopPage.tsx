import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api'
import type { Product } from '../product'
import ProductCard from '../components/ProductCard'
import './ShopPage.css'

const CATEGORIES = [
  { key: '', label: 'All Products' },
  { key: 'bags', label: 'Bags' },
  { key: 'shoes', label: 'Shoes' },
  { key: 'wallets', label: 'Wallets' },
  { key: 'pouch', label: 'Pouches' },
  { key: 'jackets', label: 'Jackets' },
]

const SORT_OPTIONS = [
  { key: 'newest', label: 'Newest First' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A–Z' },
]

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [sort, setSort] = useState('newest')

  const activeCategory = searchParams.get('category') || ''

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (activeCategory) params.category = activeCategory
      if (search.trim()) params.search = search.trim()
      const res = await api.get('/products/', { params })
      let data: Product[] = res.data.results ?? res.data

      // Client-side sort
      if (sort === 'price_asc') data = [...data].sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
      else if (sort === 'price_desc') data = [...data].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
      else if (sort === 'name') data = [...data].sort((a, b) => a.name.localeCompare(b.name))

      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [activeCategory, search, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const setCategory = (cat: string) => {
    const next: Record<string, string> = {}
    if (cat) next.category = cat
    if (search) next.search = search
    setSearchParams(next)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (activeCategory) next.category = activeCategory
    if (search.trim()) next.search = search.trim()
    setSearchParams(next)
  }

  const activeCatLabel = CATEGORIES.find(c => c.key === activeCategory)?.label || 'All Products'

  return (
    <div className="shop-root">
      {/* Page header */}
      <div className="shop-header">
        <p className="shop-header-eye">Our Collection</p>
        <h1 className="shop-header-title">{activeCatLabel}</h1>
        <p className="shop-breadcrumb">
          <span>Home</span> / <span>Shop</span>
          {activeCategory && <> / <span>{activeCatLabel}</span></>}
        </p>
      </div>

      <div className="shop-layout">
        {/* ── SIDEBAR ──────────────────── */}
        <aside className="shop-sidebar">
          <div className="sidebar-block">
            <h3 className="sidebar-heading">Categories</h3>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`sidebar-cat-btn${activeCategory === cat.key ? ' active' : ''}`}
                onClick={() => setCategory(cat.key)}
              >
                <span>{cat.label}</span>
                {activeCategory === cat.key && <span className="sidebar-active-dot" />}
              </button>
            ))}
          </div>

          <div className="sidebar-block">
            <h3 className="sidebar-heading">Sort By</h3>
            <div className="sidebar-sort-list">
              {SORT_OPTIONS.map(s => (
                <button
                  key={s.key}
                  className={`sidebar-sort-btn${sort === s.key ? ' active' : ''}`}
                  onClick={() => setSort(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-block">
            <h3 className="sidebar-heading">Availability</h3>
            <p className="sidebar-avail">Showing {loading ? '…' : products.length} item{products.length !== 1 ? 's' : ''}</p>
          </div>
        </aside>

        {/* ── MAIN CONTENT ─────────────── */}
        <main className="shop-main">
          {/* Search + top bar */}
          <div className="shop-topbar">
            <form className="shop-search" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Search leather goods…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button type="submit" aria-label="Search">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>

            <p className="shop-count">
              {loading ? 'Loading…' : `${products.length} result${products.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Active filter chips */}
          {(activeCategory || search) && (
            <div className="shop-chips">
              {activeCategory && (
                <span className="chip">
                  {activeCatLabel}
                  <button onClick={() => setCategory('')}>×</button>
                </span>
              )}
              {search && (
                <span className="chip">
                  "{search}"
                  <button onClick={() => { setSearch(''); setSearchParams(activeCategory ? { category: activeCategory } : {}) }}>×</button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="products-skeleton">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="shop-empty">
              <div className="shop-empty-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try a different category or search term.</p>
              <button className="hero-btn hero-btn--ghost" onClick={() => { setSearch(''); setSearchParams({}) }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}