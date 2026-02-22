import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import './Cart.css';

// Dummy cart items
const CART_ITEMS = [
    {
        id: 1,
        name: 'Silk Velvet Midi Dress',
        size: 'M',
        price: 245.00,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1515347619362-73fc365313f8?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 4,
        name: 'Cashmere Blend Sweater',
        size: 'S',
        price: 185.00,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1434389678232-0678a514d8cd?q=80&w=800&auto=format&fit=crop'
    }
];

const Cart = () => {
    const subtotal = CART_ITEMS.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = 15.00; // Flat rate dummy
    const total = subtotal + tax + shipping;

    return (
        <div className="cart-page container animate-fade-in">
            <h1 className="cart-title">Your Bag ({CART_ITEMS.length})</h1>

            {CART_ITEMS.length === 0 ? (
                <div className="empty-cart">
                    <p>Your bag is currently empty.</p>
                    <Link to="/shop" className="btn-primary">Continue Shopping</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items-column">
                        <div className="cart-header hidden-mobile">
                            <span className="col-product">Product</span>
                            <span className="col-quantity">Quantity</span>
                            <span className="col-total">Total</span>
                        </div>

                        {CART_ITEMS.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-product">
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-info">
                                        <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                                        <p className="cart-item-size">Size: {item.size}</p>
                                        <button className="remove-btn"><Trash2 size={14} /> Remove</button>
                                    </div>
                                </div>

                                <div className="cart-item-quantity">
                                    <div className="qty-controls-small">
                                        <button>-</button>
                                        <span>{item.quantity}</span>
                                        <button>+</button>
                                    </div>
                                </div>

                                <div className="cart-item-price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary-column">
                        <div className="lux-card summary-card">
                            <h2>Order Summary</h2>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Estimated Tax (8%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>${shipping.toFixed(2)}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="btn-primary checkout-btn">
                                Proceed to Checkout <ArrowRight size={18} />
                            </Link>

                            <div className="payment-icons">
                                {/* Visual SVGs for Stripe/Pix can be placed here */}
                                <span className="payment-note">Secure Checkout with Stripe & Pix</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
