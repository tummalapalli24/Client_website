import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div className="home-page animate-fade-in">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-image-container">
                    <img
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        alt="Luxury Fashion"
                        className="hero-image"
                    />
                    <div className="hero-overlay"></div>
                </div>
                <div className="hero-content container">
                    <h1 className="hero-title">Timeless Elegance</h1>
                    <p className="hero-subtitle">Discover the new season collection of meticulously curated luxury pieces.</p>
                    <Link to="/shop" className="btn-primary">
                        Explore Collection <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-section container">
                <div className="section-header">
                    <h2>Featured Pieces</h2>
                    <Link to="/shop" className="view-all-link">View All</Link>
                </div>

                <div className="product-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="product-card">
                            <div className="product-image-container">
                                <img
                                    src={`https://images.unsplash.com/photo-1515347619362-73fc365313f8?q=80&w=800&auto=format&fit=crop&text=Product${i}`}
                                    alt={`Featured Product ${i}`}
                                    className="product-image"
                                />
                                <div className="product-action">
                                    <button className="add-to-cart-btn">Quick Add</button>
                                </div>
                            </div>
                            <div className="product-info">
                                <h3>Silk Velvet Midi Dress</h3>
                                <p className="product-price">$245.00</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* New Arrivals Banner */}
            <section className="arrivals-banner">
                <div className="arrivals-content container">
                    <h2>The Summer Capsule</h2>
                    <p>Lightweight fabrics, effortless silhouettes, and sun-kissed shades.</p>
                    <Link to="/shop?collection=summer" className="btn-secondary">Shop Now</Link>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section container">
                <h2 className="section-title">What Our Clients Say</h2>
                <div className="testimonials-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="lux-card testimonial-card">
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} fill="var(--color-accent)" color="var(--color-accent)" />)}
                            </div>
                            <p className="testimonial-text">"Absolutely in love with the quality and fit. The unboxing experience felt incredibly premium. Will definitely be purchasing again."</p>
                            <p className="testimonial-author">&mdash; Elena M.</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
