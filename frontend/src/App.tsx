import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import UserProfilePage from './pages/UserProfilePage'
import InvoicePage from './pages/InvoicePage'
import AdminDashboard from './pages/AdminDashboard'
import './index.css'

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', height: '100vh',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Cormorant Garamond, serif',
      fontSize: '1.5rem', color: '#8B4A2B', background: '#FBF7F2'
    }}>
      Loading…
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />

  return (
    <Routes>

      {/* ── Guest only ── */}
      <Route path="/login"    element={!user ? <LoginPage />    : <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />} />

      {/* ── Admin dashboard (no navbar) ── */}
      <Route path="/admin" element={
        !user                    ? <Navigate to="/login" replace />
        : user.role !== 'admin'  ? <Navigate to="/" replace />
        : <AdminDashboard />
      } />

      {/* ── Invoice — standalone, no navbar, buyer + admin ── */}
      <Route path="/invoice/:id" element={
        !user ? <Navigate to="/login" replace /> : <InvoicePage />
      } />

      {/* ── Main pages with navbar ── */}
      <Route element={!user ? <Navigate to="/login" replace /> : <Layout />}>
        <Route path="/"            element={<HomePage />} />
        <Route path="/shop"        element={<ShopPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart"        element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <CartPage />} />
        <Route path="/checkout"    element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <CheckoutPage />} />
        <Route path="/profile"     element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <UserProfilePage />} />
      </Route>

      {/* ── Catch all ── */}
      <Route path="*" element={
        <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/') : '/login'} replace />
      } />

    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}