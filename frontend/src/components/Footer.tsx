import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-content">
                <div className="footer-section brand-section">
                    <h2>BOUTIQUE</h2>
                    <p className="brand-tagline">Elevating your everyday style with curated luxury pieces.</p>
                    <div className="social-links">
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="TikTok">
                            {/* Using Twitter icon as placeholder for TikTok if no Tiktok icon in lucide-react */}
                            <Twitter size={20} />
                        </a>
                    </div>
                </div>

                <div className="footer-section links-section">
                    <h3>Shop</h3>
                    <Link to="/shop?category=new">New Arrivals</Link>
                    <Link to="/shop?category=dresses">Dresses</Link>
                    <Link to="/shop?category=tops">Tops</Link>
                    <Link to="/shop?category=accessories">Accessories</Link>
                    <Link to="/shop?category=sale" className="highlight-sale">Sale</Link>
                </div>

                <div className="footer-section links-section">
                    <h3>Company</h3>
                    <Link to="/about">About Us</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms & Conditions</Link>
                </div>

                <div className="footer-section newsletter-section">
                    <h3>Newsletter</h3>
                    <p>Join our exclusive list for 10% off your first order.</p>
                    <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                        <input type="email" placeholder="Your email address" required />
                        <button type="submit" className="btn-secondary">Subscribe</button>
                    </form>
                </div>
            </div>

            <div className="footer-bottom container">
                <p>&copy; {new Date().getFullYear()} Boutique Name. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
