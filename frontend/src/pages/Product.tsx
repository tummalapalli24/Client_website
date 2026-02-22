import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, Star, ArrowLeft, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductReviews from '../components/ProductReviews';
import './Product.css';

const Product = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

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
                if (data?.colors?.length > 0) setSelectedColor(data.colors[0]);
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1 className="product-title">{product.name}</h1>
                        <button
                            className="icon-btn"
                            onClick={() => isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)}
                            aria-label="Add to Wishlist"
                        >
                            <Heart size={24} fill={isInWishlist(product.id) ? "var(--color-accent)" : "none"} color={isInWishlist(product.id) ? "var(--color-accent)" : "var(--color-black)"} style={{ transition: 'all 0.3s ease' }} />
                        </button>
                    </div>
                    <p className="product-price">${product.price.toFixed(2)}</p>

                    <div className="product-rating">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill={s <= 4 ? "var(--color-accent)" : "none"} color="var(--color-accent)" />)}
                        </div>
                        <a href="#reviews" className="reviews-count" onClick={(e) => {
                            e.preventDefault();
                            document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' });
                        }} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                            {product.reviews?.length || 0} Reviews
                        </a>
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
                                            className={`size-btn ${selectedColor === color ? 'active' : ''}`}
                                            onClick={() => setSelectedColor(color)}
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
                        <button
                            className="btn-primary add-to-cart-large"
                            disabled={isAdding}
                            onClick={async () => {
                                setIsAdding(true);
                                await addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    image: images[0],
                                    category: product.category,
                                    quantity,
                                    size: selectedSize,
                                    color: selectedColor
                                });
                                setTimeout(() => setIsAdding(false), 500); // UI feedback
                            }}
                        >
                            {isAdding ? 'Adding...' : `Add to Bag - $${(product.price * quantity).toFixed(2)}`}
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

            <ProductReviews reviews={product.reviews} />
        </div>
    );
};

export default Product;
