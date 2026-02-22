import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { LogOut, Package, MapPin, Heart, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Account.css';

const Account = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'orders';
    const [activeTab, setActiveTab] = useState(initialTab);

    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    // Addresses State
    const [addresses, setAddresses] = useState<any[]>([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', country: '' });
    const [addressError, setAddressError] = useState('');
    const [addressSuccess, setAddressSuccess] = useState('');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'addresses' && token) {
            fetchAddresses();
        }
    }, [activeTab, token]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSearchParams({ tab });
    };

    const fetchAddresses = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.data) {
                setAddresses(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch addresses', error);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddressError('');
        setAddressSuccess('');
        try {
            const res = await fetch('http://localhost:5001/api/addresses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newAddress)
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setAddresses([data.address, ...addresses]);
                setShowAddressForm(false);
                setNewAddress({ name: '', street: '', city: '', state: '', zip: '', country: '' });
                setAddressSuccess('Address saved successfully!');
                setTimeout(() => setAddressSuccess(''), 3000);
            } else {
                setAddressError(data.error || 'Failed to save address.');
            }
        } catch (error) {
            setAddressError('Network error occurred while saving address.');
            console.error('Failed to add address', error);
        }
    };

    const handleDeleteAddress = async (id: number) => {
        try {
            const res = await fetch(`http://localhost:5001/api/addresses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setAddresses(addresses.filter(addr => addr.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete address', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return null; // or navigate to login gracefully if not handled by a protected route wrapper
    }

    return (
        <div className="account-page container animate-fade-in">
            <div className="account-header">
                <h1>My Account</h1>
                <p>Welcome back, {user.name}</p>
            </div>

            <div className="account-layout">
                <aside className="account-sidebar lux-card">
                    <nav className="account-nav">
                        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => handleTabChange('orders')}><Package size={18} /> Orders</button>
                        <button className={activeTab === 'wishlist' ? 'active' : ''} onClick={() => handleTabChange('wishlist')}><Heart size={18} /> Wishlist</button>
                        <button className={activeTab === 'addresses' ? 'active' : ''} onClick={() => handleTabChange('addresses')}><MapPin size={18} /> Addresses</button>
                        <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Sign Out</button>
                    </nav>
                </aside>

                <main className="account-content">
                    {activeTab === 'orders' && (
                        <div className="lux-card">
                            <h2>Recent Orders</h2>
                            <div className="empty-state">
                                <Package size={40} className="empty-icon" />
                                <p>You haven't placed any orders yet.</p>
                                <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wishlist' && (
                        <div className="lux-card">
                            <h2>My Wishlist</h2>
                            {wishlistItems.length === 0 ? (
                                <div className="empty-state">
                                    <Heart size={40} className="empty-icon" />
                                    <p>No items in your wishlist yet.</p>
                                    <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
                                </div>
                            ) : (
                                <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                                    {wishlistItems.map((item) => (
                                        <div key={item.product_id} className="product-card" style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Link to={`/product/${item.product_id}`} className="product-image-container">
                                                <img src={item.image} alt={item.name} className="product-image" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                                            </Link>
                                            <div className="product-info" style={{ padding: '1rem 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{item.name}</h3>
                                                <p className="price" style={{ marginBottom: '1rem' }}>${item.price.toFixed(2)}</p>

                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                                    <button
                                                        className="btn-primary"
                                                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
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
                                                        <ShoppingBag size={14} style={{ display: 'inline', marginRight: '4px' }} /> Add
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
                    )}

                    {activeTab === 'addresses' && (
                        <div className="lux-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2>Saved Addresses</h2>
                                {!showAddressForm && (
                                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setShowAddressForm(true)}>
                                        <Plus size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Add Address
                                    </button>
                                )}
                            </div>

                            {showAddressForm ? (
                                <form onSubmit={handleAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', padding: '1rem', border: '1px solid #eaeaea' }}>
                                    {addressError && <div style={{ color: '#ff4d4f', padding: '0.5rem', backgroundColor: '#fff2f0', border: '1px solid #ffccc7' }}>{addressError}</div>}
                                    <input type="text" placeholder="Full Name" required value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} style={{ padding: '0.8rem', border: '1px solid #ccc' }} />
                                    <input type="text" placeholder="Street Address" required value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} style={{ padding: '0.8rem', border: '1px solid #ccc' }} />
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input type="text" placeholder="City" required value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc' }} />
                                        <input type="text" placeholder="State/Province" required value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input type="text" placeholder="Postal Code" required value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc' }} />
                                        <input type="text" placeholder="Country" required value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} style={{ flex: 1, padding: '0.8rem', border: '1px solid #ccc' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                        <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Address</button>
                                        <button type="button" className="icon-btn" style={{ flex: 1, border: '1px solid #ccc' }} onClick={() => { setShowAddressForm(false); setAddressError(''); }}>Cancel</button>
                                    </div>
                                </form>
                            ) : null}

                            {addressSuccess && <div style={{ color: '#52c41a', padding: '1rem', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', marginBottom: '1rem' }}>{addressSuccess}</div>}

                            {!showAddressForm && addresses.length === 0 ? (
                                <div className="empty-state">
                                    <MapPin size={40} className="empty-icon" />
                                    <p>No addresses found. Please add a new address.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {addresses.map((addr) => (
                                        <div key={addr.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid #eaeaea' }}>
                                            <div>
                                                <strong style={{ fontSize: '1.1rem', display: 'block', marginBottom: '0.5rem' }}>{addr.name}</strong>
                                                <span style={{ color: 'var(--color-text-muted)' }}>{addr.street}</span><br />
                                                <span style={{ color: 'var(--color-text-muted)' }}>{addr.city}, {addr.state} {addr.zip}</span><br />
                                                <span style={{ color: 'var(--color-text-muted)' }}>{addr.country}</span>
                                            </div>
                                            <button
                                                className="icon-btn"
                                                style={{ alignSelf: 'flex-start', color: '#ff4d4f' }}
                                                onClick={() => handleDeleteAddress(addr.id)}
                                                aria-label="Delete Address"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Account;
