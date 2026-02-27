import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { features } from '../utils/authData';
import './LoginPage.css';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-root">
            <div className="bg-circle-1" />
            <div className="bg-circle-2" />
            <div className="bg-dots" />

            {/* Left decorative panel */}
            <div className="panel-left">
                <div className="left-logo">
                    <div className="left-logo-mark">PF</div>
                    <span className="left-logo-name">Paper Formatter</span>
                </div>
                <h1 className="left-headline">
                    Examination Papers,<br /><em>professionally </em> formatted.
                </h1>
                <p className="left-sub">
                    Prepare board-standard question papers with correct structure, formatting, and layout — we handle the formatting so you can focus on setting quality questions.
                </p>
                <div className="feature-list">
                    {features.map((f, i) => (
                        <div className="feature-item" key={i}>
                            <div className="feature-dot">{f.icon}</div>
                            <span className="feature-text">{f.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right form panel */}
            <div className="panel-right">
                <p className="form-eyebrow">Welcome back</p>
                <h2 className="form-title">Sign in to your account</h2>
                <p className="form-subtitle">Enter your credentials to access your workspace</p>

                <form onSubmit={handleSubmit}>
                    <div className="field-group">
                        <label className="field-label" htmlFor="email">Email Address</label>
                        <div className="field-wrap">
                            <span className="field-icon">✉</span>
                            <input
                                type="email" id="email" className="field-input"
                                placeholder="teacher@school.com"
                                value={email} onChange={e => setEmail(e.target.value)} required
                            />
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="password">Password</label>
                        <div className="field-wrap">
                            <span className="field-icon">🔒</span>
                            <input
                                type="password" id="password" className="field-input"
                                placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)} required
                            />
                        </div>
                        <div className="row-forgot">
                            <a className="forgot-link" href="#">Forgot password?</a>
                        </div>
                    </div>

                    {error && (
                        <div className="error-box">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading && <span className="spinner" />}
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line" />
                    <span className="divider-text">no account yet?</span>
                    <div className="divider-line" />
                </div>

                <p className="register-row">
                    Don't have an account? <Link to="/register">Create one free</Link>
                </p>

                <div className="trust-row">
                    <span className="trust-icon">🔒</span>
                    Secured with 256-bit SSL encryption
                </div>
            </div>
        </div>
    );
}