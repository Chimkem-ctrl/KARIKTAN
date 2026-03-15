import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import type { Product } from '../product'
import './ProductCard.css'

interface Props {
  product: Product
}

const FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="380" viewBox="0 0 300 380"><rect fill="%23E8D5BC" width="300" height="380"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="48" fill="%23C4956A">K</text></svg>'

export default function ProductCard({ product }: Props) {
  const { addToCart, items } = useCart()
  const inCart = items.some(i => i.id === product.id)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url,
      category: product.category,
      stock: product.stock,
    })
  }

  return (
    <Link to={`/product/${product.id}`} className="pcard">
      <div className="pcard-img-wrap">
        <img
          src={product.image_url || FALLBACK}
          alt={product.name}
          className="pcard-img"
          onError={e => { (e.target as HTMLImageElement).src = FALLBACK }}
        />
        <span className="pcard-category">{product.category}</span>
        {product.stock === 0 && <div className="pcard-sold-out">Sold Out</div>}
        <button
          className={`pcard-add-btn${inCart ? ' in-cart' : ''}`}
          onClick={handleAdd}
          disabled={product.stock === 0}
          title={inCart ? 'In your cart' : 'Add to cart'}
        >
          {inCart ? '✓ In Cart' : '+ Add to Cart'}
        </button>
      </div>
      <div className="pcard-info">
        <p className="pcard-name">{product.name}</p>
        <p className="pcard-price">₱{parseFloat(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
      </div>
    </Link>
  )
}