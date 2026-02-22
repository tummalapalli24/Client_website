import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCheckout = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Dummy checkout wait
        setTimeout(() => {
            alert(`Order placed using ${paymentMethod === 'pix' ? 'Pix (Awaiting manual transfer)' : 'Stripe'}!`);
            setIsProcessing(false);
        }, 1500);
    };

    return (
        <div className="checkout-page container animate-fade-in">
            <h1 className="checkout-title">Secure Checkout</h1>

            <div className="checkout-layout">
                <div className="checkout-form-column">
                    <form className="checkout-form" onSubmit={handleCheckout}>

                        <section className="checkout-section">
                            <h2>Contact Information</h2>
                            <input type="email" placeholder="Email" required className="form-input" />
                            <label className="checkbox-label">
                                <input type="checkbox" /> Email me with news and offers
                            </label>
                        </section>

                        <section className="checkout-section">
                            <h2>Shipping Address</h2>
                            <div className="form-row">
                                <input type="text" placeholder="First Name" required className="form-input" />
                                <input type="text" placeholder="Last Name" required className="form-input" />
                            </div>
                            <input type="text" placeholder="Address" required className="form-input" />
                            <input type="text" placeholder="Apartment, suite, etc. (optional)" className="form-input" />
                            <div className="form-row">
                                <input type="text" placeholder="City" required className="form-input" />
                                <select className="form-input" required>
                                    <option value="">State / Province</option>
                                    <option value="SP">São Paulo</option>
                                    <option value="RJ">Rio de Janeiro</option>
                                    <option value="NY">New York</option>
                                </select>
                                <input type="text" placeholder="ZIP / Postal Code" required className="form-input" />
                            </div>
                            <input type="tel" placeholder="Phone" required className="form-input" />
                        </section>

                        <section className="checkout-section payment-section">
                            <h2>Payment</h2>
                            <p className="secure-note"><Lock size={14} /> All transactions are secure and encrypted.</p>

                            <div className="payment-options">
                                <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                    <div className="radio-content">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <span>Credit / Debit Card (Stripe)</span>
                                    </div>
                                </label>

                                {paymentMethod === 'card' && (
                                    <div className="payment-details-panel">
                                        <div className="card-input-dummy">
                                            <input type="text" placeholder="Card number" className="form-input" required={paymentMethod === 'card'} />
                                            <div className="form-row">
                                                <input type="text" placeholder="Expiration date (MM / YY)" className="form-input" required={paymentMethod === 'card'} />
                                                <input type="text" placeholder="Security code" className="form-input" required={paymentMethod === 'card'} />
                                            </div>
                                            <input type="text" placeholder="Name on card" className="form-input" required={paymentMethod === 'card'} />
                                        </div>
                                    </div>
                                )}

                                <label className={`payment-option ${paymentMethod === 'pix' ? 'selected' : ''}`}>
                                    <div className="radio-content">
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            checked={paymentMethod === 'pix'}
                                            onChange={() => setPaymentMethod('pix')}
                                        />
                                        <span>Pix (Direct Transfer - Brazil)</span>
                                    </div>
                                </label>

                                {paymentMethod === 'pix' && (
                                    <div className="payment-details-panel pix-panel">
                                        <p>After clicking "Complete Order", you will be provided with a Pix Key / QR Code to scan and transfer the payment directly via your banking app.</p>
                                        <div className="pix-key-box">
                                            <strong>Pix Key (Phone):</strong> +55 11 99999-9999
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <button type="submit" className="btn-primary checkout-submit-btn" disabled={isProcessing}>
                            {isProcessing ? 'Processing...' : 'Complete Order'}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-column">
                    <div className="order-summary-sidebar lux-card">
                        <h2 className="summary-title">Order Summary</h2>
                        <div className="summary-item">
                            <div className="summary-item-img">
                                {/* Placeholder for item image */}
                            </div>
                            <div className="summary-item-info">
                                <p className="summary-item-name">Silk Velvet Midi Dress <span>x1</span></p>
                                <p className="summary-item-price">$245.00</p>
                            </div>
                        </div>

                        <div className="summary-item">
                            <div className="summary-item-img"></div>
                            <div className="summary-item-info">
                                <p className="summary-item-name">Cashmere Blend Sweater <span>x2</span></p>
                                <p className="summary-item-price">$370.00</p>
                            </div>
                        </div>

                        <div className="summary-totals">
                            <div className="s-row"><span>Subtotal</span><span>$615.00</span></div>
                            <div className="s-row"><span>Shipping</span><span>$15.00</span></div>
                            <div className="s-row"><span>Taxes</span><span>$49.20</span></div>
                            <div className="s-row s-total"><span>Total</span><span>$679.20</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
