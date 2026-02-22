import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Tags } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Boutique Admin</h2>
                    <p>{user.name}</p>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-item active"><LayoutDashboard size={18} /> Dashboard</Link>
                    <Link to="/admin/products" className="admin-nav-item"><ShoppingBag size={18} /> Products</Link>
                    <Link to="/admin/orders" className="admin-nav-item"><Tags size={18} /> Orders</Link>
                    <Link to="/admin/customers" className="admin-nav-item"><Users size={18} /> Customers</Link>
                    <Link to="/admin/settings" className="admin-nav-item"><Settings size={18} /> Settings</Link>
                </nav>

                <div className="admin-logout">
                    <button onClick={handleLogout} className="admin-nav-item logout-btn">
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
