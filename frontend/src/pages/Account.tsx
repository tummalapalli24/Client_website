import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, MapPin, Heart } from 'lucide-react';
import './Account.css';

const Account = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

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
                        <button className="active"><Package size={18} /> Orders</button>
                        <button><Heart size={18} /> Wishlist</button>
                        <button><MapPin size={18} /> Addresses</button>
                        <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Sign Out</button>
                    </nav>
                </aside>

                <main className="account-content">
                    <div className="lux-card">
                        <h2>Recent Orders</h2>
                        <div className="empty-state">
                            <Package size={40} className="empty-icon" />
                            <p>You haven't placed any orders yet.</p>
                            <button className="btn-primary" onClick={() => navigate('/shop')}>Continue Shopping</button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Account;
