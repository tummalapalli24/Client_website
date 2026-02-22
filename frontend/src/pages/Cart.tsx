import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import './Cart.css';
import { useCart } from '../context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, loading } = useCart();
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const shipping = subtotal > 0 ? 15.00 : 0; // Flat rate dummy
    const total = subtotal + tax + shipping;

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading cart...</div>;

    return (
        <div className="cart-page container animate-fade-in">
            <h1 className="cart-title">Your Bag ({cartItems.length})</h1>

            {cartItems.length === 0 ? (
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

                        {cartItems.map((item, idx) => (
                            <div key={item.cart_id || `${item.id}-${idx}`} className="cart-item">
                                <div className="cart-item-product">
                                    <img src={item.image} alt={item.name} className="cart-item-img" />
                                    <div className="cart-item-info">
                                        <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                                        <p className="cart-item-size">Size: {item.size} {item.color ? `| Color: ${item.color}` : ''}</p>
                                        <button
                                            className="remove-btn"
                                            onClick={() => removeFromCart(item.cart_id, item.id)}
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-item-quantity">
                                    <div className="qty-controls-small">
                                        <button onClick={() => updateQuantity(item.cart_id, item.id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.cart_id, item.id, item.quantity + 1)}>+</button>
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
