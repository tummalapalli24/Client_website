import React from 'react';
import './Legal.css';

const Legal = () => {
    return (
        <div className="legal-page container animate-fade-in">
            <div className="legal-header">
                <h1>Terms & Policies</h1>
                <p>Effective Date: October 2025</p>
            </div>

            <div className="legal-content">
                <section className="legal-section">
                    <h2>1. Privacy Policy</h2>
                    <p>Your privacy is important to us. This policy details how we handle your personal data when you use our website or services.</p>

                    <h3>Data Collection</h3>
                    <p>We may collect personal details such as your name, email, shipping address, and payment information during checkout to process your orders securely.</p>

                    <h3>Data Usage</h3>
                    <p>We use your information solely to fulfill orders, improve our boutique's user experience, and occasionally send promotional emails if you have opted in to our newsletter.</p>
                </section>

                <section className="legal-section">
                    <h2>2. Terms & Conditions</h2>
                    <p>By using this website, you agree to comply with and be bound by the following terms.</p>

                    <h3>Purchases</h3>
                    <p>All items are subject to availability. Prices and item descriptions may change without notice. We reserve the right to cancel any orders if a pricing error occurs or if fraud is suspected.</p>

                    <h3>Returns and Exchanges</h3>
                    <p>Unworn, unwashed merchandise can be returned within 14 days of delivery. Custom or final sale items are not eligible for refunds or exchanges.</p>
                </section>

                <section className="legal-section">
                    <h2>3. Shipping Policy</h2>
                    <p>Orders typically process within 1-2 business days. Express shipping options are available at checkout. We are not responsible for delays caused by couriers once the item has been dispatched.</p>
                </section>
            </div>
        </div>
    );
};

export default Legal;
