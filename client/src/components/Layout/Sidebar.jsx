import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const { user, logout } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon">PF</div>
                <h2>Paper Formatter</h2>
            </div>

            <nav className="sidebar-nav">
                {user?.role === 'admin' ? (
                    <NavLink to="/admin">
                        <span className="nav-icon">🛡️</span>
                        Admin Portal
                    </NavLink>
                ) : (
                    <>
                        <NavLink to="/dashboard" end>
                            <span className="nav-icon">📊</span>
                            Dashboard
                        </NavLink>
                        <NavLink to="/upload">
                            <span className="nav-icon">📤</span>
                            Upload Documents
                        </NavLink>
                        <NavLink to="/questions">
                            <span className="nav-icon">❓</span>
                            Question Bank
                        </NavLink>
                        <NavLink to="/builder">
                            <span className="nav-icon">📝</span>
                            Paper Builder
                        </NavLink>
                    </>
                )}

                <div style={{ flex: 1 }} />

                <button onClick={logout}>
                    <span className="nav-icon">🚪</span>
                    Logout
                </button>
            </nav>

            {user && (
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-role">{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}</div>
                    </div>
                </div>
            )}
        </aside>
    );
}
