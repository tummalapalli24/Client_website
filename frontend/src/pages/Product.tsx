import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, Star, ArrowLeft } from 'lucide-react';
import './Product.css';

const Product = () => {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5001/api/products/${id}`)
            .then(r => r.json())
            .then(res => {
                const data = res.data;
                if (data) {
                    // Inject dummy details and reviews as they aren't in the DB schema yet
                    data.details = [
                        '100% Luxury blend',
                        'Exquisite craftsmanship',
                        'Clean finish'
                    ];
                    data.reviews = [
                        { id: 1, author: 'Emma L.', rating: 5, date: 'October 12, 2025', text: 'Absolutely gorgeous!' }
                    ];
                }
                setProduct(data);
                if (data?.sizes?.length > 0) setSelectedSize(data.sizes[0]);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading Luxury...</div>;
    }

    if (!product) {
        return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Product not found.</div>;
    }

    const images = product.images || [product.image];

    return (
        <div className="product-page container animate-fade-in">
            <Link to="/shop" className="back-link">
                <ArrowLeft size={16} /> Back to Shop
            </Link>

            <div className="product-details-layout">
                <div className="product-gallery">
                    {images.map((img: string, idx: number) => (
                        <img key={idx} src={img} alt={`${product.name} ${idx + 1}`} className="product-gallery-img" />
                    ))}
                </div>

                <div className="product-info-panel">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-price">${product.price.toFixed(2)}</p>

                    <div className="product-rating">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= 4 ? "var(--color-accent)" : "none"} color="var(--color-accent)" />)}
                        </div>
                        <span className="reviews-count">{product.reviews.length} Reviews</span>
                    </div>

                    <div className="product-description">
                        <p>{product.description}</p>
                    </div>

                    <div className="product-options">
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="size-selector">
                                <div className="size-header">
                                    <h3>Size</h3>
                                    <button className="size-guide-btn">Size Guide</button>
                                </div>
                                <div className="size-grid">
                                    {product.sizes.map((size: string) => (
                                        <button
                                            key={size}
                                            className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.colors && product.colors.length > 0 && (
                            <div className="size-selector" style={{ marginTop: '1.5rem' }}>
                                <div className="size-header">
                                    <h3>Colors</h3>
                                </div>
                                <div className="size-grid">
                                    {product.colors.map((color: string) => (
                                        <button
                                            key={color}
                                            className="size-btn"
                                            onClick={(e) => {
                                                const btns = (e.target as HTMLElement).parentElement?.querySelectorAll('.size-btn');
                                                btns?.forEach(b => b.classList.remove('active'));
                                                (e.target as HTMLElement).classList.add('active');
                                            }}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="quantity-selector">
                            <h3>Quantity</h3>
                            <div className="quantity-controls">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="qty-btn"><Minus size={16} /></button>
                                <span className="qty-display">{quantity}</span>
                                <button onClick={() => setQuantity(q => q + 1)} className="qty-btn"><Plus size={16} /></button>
                            </div>
                        </div>
                    </div>

                    {!product.in_stock ? (
                        <button className="btn-primary add-to-cart-large" disabled style={{ background: '#ccc', borderColor: '#ccc', cursor: 'not-allowed' }}>
                            Out of Stock
                        </button>
                    ) : (
                        <button className="btn-primary add-to-cart-large">
                            Add to Bag - ${(product.price * quantity).toFixed(2)}
                        </button>
                    )}

                    <div className="product-accordion">
                        <details open>
                            <summary>Details & Care</summary>
                            <ul>
                                {product.details.map((detail: string, i: number) => (
                                    <li key={i}>{detail}</li>
                                ))}
                            </ul>
                        </details>
                        <details>
                            <summary>Shipping & Returns</summary>
                            <p>Free standard shipping on orders over $200. Returns accepted within 14 days of delivery.</p>
                        </details>
                    </div>
                </div>
            </div>

            <div className="reviews-section">
                <h2>Customer Reviews</h2>
                <div className="reviews-list">
                    {product.reviews.map((review: any) => (
                        <div key={review.id} className="review-card">
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= review.rating ? "var(--color-accent)" : "none"} color="var(--color-accent)" />)}
                            </div>
                            <h4 className="review-author">{review.author} <span>- {review.date}</span></h4>
                            <p className="review-text">{review.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Product;
