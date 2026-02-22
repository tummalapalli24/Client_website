import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (!authLoading && user) {
            navigate(user.role === 'admin' ? '/admin' : '/account', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        const payload = isRegister ? { name, email, password } : { email, password };

        try {
            const res = await fetch(`http://localhost:5001${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            login(data.token, data.user);
            navigate(data.user.role === 'admin' ? '/admin' : '/account');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page container animate-fade-in">
            <div className="login-box lux-card">
                <h2>{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                <p className="login-subtitle">
                    {isRegister
                        ? 'Join our boutique members club.'
                        : 'Sign in to access your orders and wishlist.'}
                </p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {isRegister && (
                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {!isRegister && (
                            <div className="forgot-password">
                                <Link to="#">Forgot Password?</Link>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary w-100" disabled={loading}>
                        {loading ? 'Processing...' : (isRegister ? 'Register' : 'Sign In')}
                    </button>
                </form>

                <div className="login-toggle">
                    {isRegister ? (
                        <p>Already have an account? <button onClick={() => setIsRegister(false)}>Sign In</button></p>
                    ) : (
                        <p>New to our boutique? <button onClick={() => setIsRegister(true)}>Create an Account</button></p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
