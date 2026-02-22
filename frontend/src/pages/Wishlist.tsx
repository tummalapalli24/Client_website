import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    return (
        <div className="wishlist-page container animate-fade-in" style={{ padding: '4rem 2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>My Wishlist</h1>

            {wishlistItems.length === 0 ? (
                <div className="empty-state">
                    <Heart size={40} className="empty-icon" />
                    <p>No items in your wishlist yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
                </div>
            ) : (
                <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                    {wishlistItems.map((item) => (
                        <div key={item.product_id} className="product-card">
                            <Link to={`/product/${item.product_id}`} className="product-image-container">
                                <img src={item.image} alt={item.name} className="product-image" style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
                            </Link>
                            <div className="product-info" style={{ padding: '1rem 0' }}>
                                <h3>{item.name}</h3>
                                <p className="price">${item.price.toFixed(2)}</p>

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button
                                        className="btn-primary"
                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
                                        onClick={() => {
                                            addToCart({
                                                id: item.product_id,
                                                name: item.name,
                                                price: item.price,
                                                image: item.image,
                                                category: item.category || 'General',
                                                size: '',
                                                color: '',
                                                quantity: 1
                                            });
                                        }}
                                    >
                                        <ShoppingBag size={16} /> Add
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={() => removeFromWishlist(item.product_id)}
                                        style={{ border: '1px solid #ccc', padding: '0.5rem' }}
                                        aria-label="Remove from Wishlist"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
