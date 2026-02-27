import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { steps } from '../utils/authData';
import './RegisterPage.css';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('teacher');
    const [adminSecretKey, setAdminSecretKey] = useState('');
    const [showAdminFields, setShowAdminFields] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password, role, adminSecretKey);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reg-root">
            <div className="bg-circle-1" />
            <div className="bg-circle-2" />
            <div className="bg-dots" />

            {/* Left panel */}
            <div className="panel-left">
                <div className="left-logo">
                    <div className="left-logo-mark">PF</div>
                    <span className="left-logo-name">Paper Formatter</span>
                </div>
                <h1 className="left-headline">
                    Join thousands of<br /><em>educators</em> today.
                </h1>
                <p className="left-sub">
                    Get started for free. No credit card required. Your students will thank you.
                </p>
                <div className="steps-list">
                    {steps.map((s, i) => (
                        <div className="step-item" key={i}>
                            <div className="step-num">{i + 1}</div>
                            <div className="step-text">
                                <strong>{s.title}</strong>
                                {s.desc}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div className="panel-right">
                <p className="form-eyebrow">Get started free</p>
                <h2 className="form-title">Create your account</h2>
                <p className="form-subtitle">Set up your teacher workspace in seconds</p>

                <form onSubmit={handleSubmit}>
                    {/* Name + Email row */}
                    <div className="field-row">
                        <div className="field-group">
                            <label className="field-label" htmlFor="name">Full Name</label>
                            <div className="field-wrap">
                                <span className="field-icon">👤</span>
                                <input type="text" id="name" className="field-input"
                                    placeholder="Name"
                                    value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                        </div>
                        <div className="field-group">
                            <label className="field-label" htmlFor="email">Email Address</label>
                            <div className="field-wrap">
                                <span className="field-icon">✉</span>
                                <input type="email" id="email" className="field-input"
                                    placeholder="teacher@school.com"
                                    value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                        </div>
                    </div>

                    <div className="field-group">
                        <label className="field-label" htmlFor="password">Password</label>
                        <div className="field-wrap">
                            <span className="field-icon">🔒</span>
                            <input type="password" id="password" className="field-input"
                                placeholder="Minimum 6 characters"
                                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                        </div>
                    </div>

                    {showAdminFields && (
                        <div className="admin-box">
                            <div className="admin-box-header">
                                <span className="admin-badge">🛡️ Admin Access</span>
                            </div>
                            <label className="admin-box-label" htmlFor="adminSecretKey">Admin Secret Key</label>
                            <div className="field-wrap">
                                <span className="field-icon" style={{ color: '#c8a840' }}>🗝️</span>
                                <input type="password" id="adminSecretKey" className="admin-input"
                                    placeholder="Enter secret key to register as admin"
                                    value={adminSecretKey} onChange={e => setAdminSecretKey(e.target.value)} required />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-box">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`btn-submit${showAdminFields ? ' admin-mode' : ''}`}
                        disabled={loading}
                    >
                        {loading && <span className="spinner" />}
                        {loading
                            ? 'Creating account…'
                            : showAdminFields
                                ? '🛡️ Create Admin Account'
                                : 'Create Account →'}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line" />
                    <span className="divider-text">already registered?</span>
                    <div className="divider-line" />
                </div>

                <div className="footer-row">
                    <p className="signin-row">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                    {!showAdminFields && (
                        <button
                            className="btn-admin-toggle"
                            onClick={() => { setShowAdminFields(true); setRole('admin'); }}
                            type="button"
                        >
                            🛡️ Register as Admin
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}