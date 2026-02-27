import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">
                    <div className="logo-icon">P</div>
                    <span>PaperFormatter</span>
                </div>
                <div className="nav-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn btn-primary" onClick={() => navigate('/register')}>Sign Up</button>
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-content fade-in">
                    <span className="badge badge-primary slide-up"></span>
                    <h1 className="hero-title slide-up" style={{ animationDelay: '0.1s' }}>
                        Create Professional <br />
                        <span>Exam Papers</span> in minutes
                    </h1>
                    <p className="hero-description slide-up" style={{ animationDelay: '0.2s' }}>
                        The ultimate tool for educators. Extract questions from your documents using AI,
                        organize them into sections, and generate perfectly formatted Institute-style PDFs.
                    </p>
                    <div className="hero-btns slide-up" style={{ animationDelay: '0.3s' }}>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
                            Get Started for Free
                        </button>
                        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                    </div>
                </div>

                <div className="hero-visual fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="preview-card card">
                        <div className="preview-header">
                            <div className="dots"><span></span><span></span><span></span></div>
                        </div>
                        <div className="preview-body">
                            <div className="line title"></div>
                            <div className="line meta"></div>
                            <div className="preview-sections">
                                <div className="p-section">
                                    <div className="p-label">Section A</div>
                                    <div className="p-q"></div>
                                    <div className="p-q"></div>
                                </div>
                                <div className="p-section">
                                    <div className="p-label">Section B</div>
                                    <div className="p-q"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>




        </div>
    );
}
