import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Tags, Menu, X, ChevronLeft } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user || user.role !== 'admin') return null;

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
        { path: '/admin/products', label: 'Products', icon: <ShoppingBag size={18} /> },
        { path: '/admin/orders', label: 'Orders', icon: <Tags size={18} /> },
        { path: '/admin/customers', label: 'Customers', icon: <Users size={18} /> },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
    ];

    const isActive = (path: string, exact?: boolean) => {
        if (exact) return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="admin-sidebar-header">
                    {sidebarOpen && (
                        <div className="admin-brand">
                            <h2>Boutique Admin</h2>
                            <p>{user.name}</p>
                        </div>
                    )}
                    <button
                        className="sidebar-toggle"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                    >
                        {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`admin-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
                            title={!sidebarOpen ? item.label : undefined}
                        >
                            {item.icon}
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="admin-logout">
                    <button onClick={handleLogout} className="admin-nav-item logout-btn" title={!sidebarOpen ? 'Sign Out' : undefined}>
                        <LogOut size={18} />
                        {sidebarOpen && <span>Sign Out</span>}
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
