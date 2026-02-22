import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminProducts = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '', price: 0, description: '', category: 'Dresses', gender: 'Women',
        sizes: '', colors: '', stock_quantity: 0, in_stock: true, is_visible: true, image: ''
    });

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5001/api/products');
            const data = await res.json();
            setProducts(data.data || []);
        } catch (err) {
            console.error('Failed to fetch admin products', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openModal = (product: any = null) => {
        if (product) {
            setEditingId(product.id);
            setFormData({
                name: product.name,
                price: product.price,
                description: product.description,
                category: product.category,
                gender: product.gender,
                sizes: product.sizes ? product.sizes.join(', ') : '',
                colors: product.colors ? product.colors.join(', ') : '',
                stock_quantity: product.stock_quantity,
                in_stock: product.in_stock === 1 || product.in_stock === true,
                is_visible: product.is_visible !== 0 && product.is_visible !== false, // Default true if undefined
                image: product.image // Note: We are keeping the database field named 'image' but it now contains stringified JSON arrays
            });
        } else {
            setEditingId(null);
            setFormData({
                name: '', price: 0, description: '', category: 'Dresses', gender: 'Women',
                sizes: '', colors: '', stock_quantity: 0, in_stock: true, is_visible: true, image: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`http://localhost:5001/api/admin/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchProducts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure images are formatted as a JSON array string before sending to backend
        let imgArray = [];
        if (typeof formData.image === 'string') {
            imgArray = formData.image.split(',').map(s => s.trim()).filter(Boolean);
        } else {
            imgArray = [formData.image];
        }

        const payload = {
            ...formData,
            sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
            colors: formData.colors.split(',').map(c => c.trim()).filter(Boolean),
            image: JSON.stringify(imgArray) // Store exactly as array format
        };

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `http://localhost:5001/api/admin/products/${editingId}` : 'http://localhost:5001/api/admin/products';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchProducts();
            } else {
                alert('Failed to save product');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-page animate-fade-in relative">
            <div className="admin-page-header">
                <h1>Product Management</h1>
                <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="admin-card">
                {loading ? (
                    <p>Loading inventory...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eaeaea' }}>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Product</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Price</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Stock</th>
                                <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                let primaryImage = p.image;
                                try {
                                    const parsed = JSON.parse(p.image);
                                    if (Array.isArray(parsed) && parsed.length > 0) {
                                        primaryImage = parsed[0];
                                    }
                                } catch (e) {
                                    // It's a regular string, leave it alone
                                }

                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eaeaea' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={primaryImage} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#666' }}>{p.category}</td>
                                        <td style={{ padding: '1rem' }}>${p.price.toFixed(2)}</td>
                                        <td style={{ padding: '1rem' }}>{p.stock_quantity}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                backgroundColor: p.in_stock ? '#dcfce7' : '#fee2e2',
                                                color: p.in_stock ? '#166534' : '#991b1b'
                                            }}>
                                                {p.in_stock ? 'Active' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', gap: '10px' }}>
                                            <button className="icon-btn" onClick={() => openModal(p)} style={{ marginRight: '10px' }}><Edit2 size={16} /></button>
                                            <button className="icon-btn" onClick={() => handleDelete(p.id)} style={{ color: '#dc2626' }}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="lux-card animate-fade-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
                        <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>

                        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="input-group">
                                <label>Product Name</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Price ($)</label>
                                    <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Stock Quantity</label>
                                    <input type="number" required value={formData.stock_quantity} onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #eaeaea', borderRadius: '4px' }}>
                                        <option value="Dresses">Dresses</option>
                                        <option value="Tops">Tops</option>
                                        <option value="Bottoms">Bottoms</option>
                                        <option value="Accessories">Accessories</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Gender</label>
                                    <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #eaeaea', borderRadius: '4px' }}>
                                        <option value="Women">Women</option>
                                        <option value="Men">Men</option>
                                        <option value="Unisex">Unisex</option>
                                    </select>
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Description</label>
                                <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '0.75rem', border: '1px solid #eaeaea', borderRadius: '4px', resize: 'vertical' }} />
                            </div>

                            <div className="input-group">
                                <label>Image URLs (comma separated for gallery, first is primary)</label>
                                <input type="text" placeholder="https://img1.jpg, https://img2.jpg" required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Sizes (comma separated)</label>
                                    <input type="text" placeholder="XS, S, M, L" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                    <label>Colors (comma separated)</label>
                                    <input type="text" placeholder="Black, White, Red" value={formData.colors} onChange={e => setFormData({ ...formData, colors: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input type="checkbox" id="in_stock" checked={formData.in_stock} onChange={e => setFormData({ ...formData, in_stock: e.target.checked })} style={{ width: 'auto' }} />
                                <label htmlFor="in_stock" style={{ marginBottom: 0 }}>Item is in stock</label>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <input type="checkbox" id="is_visible" checked={formData.is_visible} onChange={e => setFormData({ ...formData, is_visible: e.target.checked })} style={{ width: 'auto' }} />
                                <label htmlFor="is_visible" style={{ marginBottom: 0 }}>Visible to customers in store</label>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                                {editingId ? 'Save Changes' : 'Create Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
