import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Login from './pages/Login';
import Account from './pages/Account';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';

import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// ... (other imports remain unchanged)

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="app-container">
              <Navbar />
              <main style={{ minHeight: '80vh', paddingTop: '80px' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/privacy" element={<Legal />} />
                  <Route path="/terms" element={<Legal />} />
                  <Route path="/login" element={<Login />} />

                  {/* Protected Customer Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/account" element={<Account />} />
                  </Route>

                  {/* Protected Admin Routes */}
                  <Route element={<ProtectedRoute requireAdmin={true} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<div className="admin-page"><div className="admin-card"><h2>Welcome to the Admin Dashboard</h2><p>Select an option from the sidebar to manage your boutique.</p></div></div>} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="orders" element={<div className="admin-page"><div className="admin-card"><h2>Order Management</h2></div></div>} />
                      <Route path="customers" element={<div className="admin-page"><div className="admin-card"><h2>Customer List</h2></div></div>} />
                      <Route path="settings" element={<div className="admin-page"><div className="admin-card"><h2>Store Settings</h2></div></div>} />
                    </Route>
                  </Route>

                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
