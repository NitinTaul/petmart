import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// ── Lazy loaded pages — reduces initial JS bundle size ────────
const HomePage          = lazy(() => import('./pages/HomePage'));
const ProductsPage      = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage          = lazy(() => import('./pages/CartPage'));
const AuthCallback      = lazy(() => import('./pages/AuthCallback'));
const LoginPage         = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage      = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const OrdersPage        = lazy(() => import('./pages/OrderPages').then(m => ({ default: m.OrdersPage })));
const OrderDetailPage   = lazy(() => import('./pages/OrderPages').then(m => ({ default: m.OrderDetailPage })));

// Loading spinner
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-3 animate-pulse">🐾</div>
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  </div>
);

// Protected route
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Guest-only route (redirect logged in users)
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageLoader />;
  return !isAuthenticated ? children : <Navigate to="/" replace />;
};

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />

        <Route path="/cart" element={<ProtectedRoute><Layout><CartPage /></Layout></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><Layout><OrderDetailPage /></Layout></ProtectedRoute>} />

        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="*" element={
          <Layout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
              <div className="text-6xl mb-4">🐾</div>
              <h1 className="font-display text-3xl font-bold mb-2">Page Not Found</h1>
              <a href="/" className="btn-primary mt-4 inline-block">Go Home</a>
            </div>
          </Layout>
        } />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#FF6B35', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
