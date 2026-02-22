import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-page container animate-fade-in">
            <div className="about-header">
                <h1>Our Story</h1>
                <p>Redefining everyday luxury for the modern aesthetic.</p>
            </div>

            <div className="about-content">
                <div className="about-image-column">
                    <img
                        src="https://images.unsplash.com/photo-1573006828989-13833d7b322a?q=80&w=800&auto=format&fit=crop"
                        alt="Founder in fashion studio"
                        className="founder-image"
                    />
                </div>
                <div className="about-text-column">
                    <h2>The Vision</h2>
                    <p>Founded in 2023, our boutique was born out of a desire to create a wardrobe that feels as good as it looks. We believe in the power of minimalism, high-quality fabrics, and timeless silhouettes that transcend seasonal trends.</p>

                    <h2>Our Mission</h2>
                    <p>We are dedicated to sustainable practices and ethical sourcing. Our mission is to empower women aged 18-45 to express their unique elegance through thoughtfully crafted pieces that celebrate confidence and individuality.</p>

                    <div className="founder-signature">
                        <p className="founder-name">Amelia Rose</p>
                        <p className="founder-title">Founder & Creative Director</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
