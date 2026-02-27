import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PaperProvider } from './context/PaperContext';

import Sidebar from './components/Layout/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import QuestionBankPage from './pages/QuestionBankPage';
import PaperBuilderPage from './pages/PaperBuilderPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function ProtectedLayout() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;

    return (
        <PaperProvider>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </PaperProvider>
    );
}

function AdminRoute({ children }) {
    const { user } = useAuth();
    if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;
    return children;
}

function PublicRoute({ children }) {
    const { user } = useAuth();
    if (user) {
        return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
    }
    return children;
}

function RootRoute() {
    const { user } = useAuth();
    if (!user) return <LandingPage />;
    return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public or Protected logic */}
                    <Route path="/" element={<RootRoute />} />

                    {/* Auth */}
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                    {/* Protected */}
                    <Route element={<ProtectedLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/upload" element={<UploadPage />} />
                        <Route path="/questions" element={<QuestionBankPage />} />
                        <Route path="/builder" element={<PaperBuilderPage />} />
                        <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}
