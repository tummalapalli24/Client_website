import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('http://localhost:5001/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    subject: 'Boutique Contact Form Inquiry',
                    message: formData.message
                })
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setFormData({ firstName: '', lastName: '', email: '', message: '' });
            } else {
                setStatus('error');
                setErrorMessage(data.error || 'Failed to send message.');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Network error. Please try again later.');
        }
    };
    return (
        <div className="contact-page container animate-fade-in">
            <div className="contact-header">
                <h1>Get in Touch</h1>
                <p>We're here to assist you with any inquiries regarding styling, sizing, or orders.</p>
            </div>

            <div className="contact-layout">
                <div className="contact-info-column">
                    <div className="info-block">
                        <Mail className="info-icon" size={24} />
                        <h3>Email</h3>
                        <p>hello@boutique.com</p>
                        <p>support@boutique.com</p>
                    </div>

                    <div className="info-block">
                        <Phone className="info-icon" size={24} />
                        <h3>Phone</h3>
                        <p>+55 11 99999-9999</p>
                        <p>Mon-Fri, 9am - 6pm BRT</p>
                    </div>

                    <div className="info-block">
                        <MapPin className="info-icon" size={24} />
                        <h3>Store Location</h3>
                        <p>123 Luxury Avenue</p>
                        <p>São Paulo, SP 01000-000</p>
                        <p>Brazil</p>
                    </div>
                </div>

                <div className="contact-form-column">
                    <form className="lux-card contact-form" onSubmit={handleSubmit}>
                        <h2>Send a Message</h2>

                        {status === 'success' && (
                            <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle size={18} /> Message sent successfully! We will get back to you soon.
                            </div>
                        )}

                        {status === 'error' && (
                            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                                {errorMessage}
                            </div>
                        )}

                        <div className="form-row">
                            <div className="input-group">
                                <label>First Name</label>
                                <input type="text" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} disabled={status === 'loading'} />
                            </div>
                            <div className="input-group">
                                <label>Last Name</label>
                                <input type="text" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} disabled={status === 'loading'} />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Email Address</label>
                            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={status === 'loading'} />
                        </div>
                        <div className="input-group">
                            <label>Message</label>
                            <textarea rows={5} required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} disabled={status === 'loading'}></textarea>
                        </div>
                        <button type="submit" className="btn-primary w-100" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="map-container" style={{ marginTop: '4rem', width: '100%', height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sPaulista%20Avenue%2C%20S%C3%A3o%20Paulo%20-%20State%20of%20S%C3%A3o%20Paulo%2C%20Brazil!5e0!3m2!1sen!2sus!4v1714596303251!5m2!1sen!2sus"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Boutique Location"
                ></iframe>
            </div>
        </div>
    );
};

export default Contact;
