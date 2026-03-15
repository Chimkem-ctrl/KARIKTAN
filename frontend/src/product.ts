export interface Product {
  id: number
  name: string
  description: string
  price: string
  stock: number
  category: 'bags' | 'shoes' | 'wallets' | 'pouch' | 'jackets'
  image: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}