import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await authAPI.login({ email, password });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role, adminSecretKey) => {
        setLoading(true);
        try {
            const { data } = await authAPI.register({ name, email, password, role, adminSecretKey });
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
