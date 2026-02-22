import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, X, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

const Navbar = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
            setSearchOpen(false);
        }
    };

    return (
        <>
            <header className="navbar">
                <div className="container nav-content">
                    <div className="nav-left">
                        <button className="menu-btn" aria-label="Menu" onClick={() => setMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="nav-links hidden-mobile">
                            <Link to="/shop">Shop</Link>
                            <Link to="/about">About</Link>
                        </div>
                    </div>

                    <div className="nav-center">
                        <Link to="/" className="brand-logo">
                            <h1>BOUTIQUE</h1>
                        </Link>
                    </div>

                    <div className="nav-right">
                        <button className="icon-btn" aria-label="Search" onClick={() => setSearchOpen(true)}>
                            <Search size={20} />
                        </button>
                        <Link to={user && user.role !== 'admin' ? '/account?tab=wishlist' : '/wishlist'} className="icon-btn hidden-mobile" aria-label="Wishlist">
                            <Heart size={20} />
                            {wishlistItems.length > 0 && <span className="cart-badge">{wishlistItems.length}</span>}
                        </Link>
                        <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} className="icon-btn hidden-mobile" aria-label="Account">
                            <User size={20} />
                        </Link>
                        <Link to="/cart" className="icon-btn" aria-label="Cart">
                            <ShoppingBag size={20} />
                            {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
                        </Link>
                    </div>
                </div>
            </header>

            {/* Advanced Full Screen Search Overlay */}
            {searchOpen && (
                <div className="search-overlay">
                    <button className="close-search-btn" onClick={() => setSearchOpen(false)}>
                        <X size={32} />
                    </button>

                    <div className="search-container container animate-fade-in">
                        <h2>What are you looking for?</h2>
                        <form className="search-form" onSubmit={handleSearch}>
                            <Search size={24} className="search-form-icon" />
                            <input
                                type="text"
                                placeholder="Search for dresses, silk, new arrivals..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="btn-primary search-submit">Search</button>
                        </form>

                        <div className="search-suggestions">
                            <span>Popular:</span>
                            <button onClick={() => { setSearchTerm('Silk'); navigate('/shop?search=Silk'); setSearchOpen(false); }}>Silk</button>
                            <button onClick={() => { setSearchTerm('Velvet'); navigate('/shop?search=Velvet'); setSearchOpen(false); }}>Velvet</button>
                            <button onClick={() => { navigate('/shop?category=Dresses'); setSearchOpen(false); }}>Dresses</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="search-overlay mobile-menu-overlay">
                    <button className="close-search-btn" onClick={() => setMobileMenuOpen(false)}>
                        <X size={32} />
                    </button>
                    <div className="mobile-menu-content animate-fade-in">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                        <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
                        <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
                        <Link to={user ? (user.role === 'admin' ? '/admin' : '/account') : '/login'} onClick={() => setMobileMenuOpen(false)}>
                            {user ? 'My Account' : 'Sign In'}
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
