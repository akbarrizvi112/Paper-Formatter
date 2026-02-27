import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @route   POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, role, adminSecretKey } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Secure admin creation
        let finalRole = 'teacher';
        if (role === 'admin') {
            const secret = process.env.ADMIN_SECRET_KEY || 'ADMIN123';
            if (adminSecretKey === secret) {
                finalRole = 'admin';
            } else {
                return res.status(403).json({ message: 'Invalid Admin Secret Key' });
            }
        }

        const user = await User.create({ name, email, password, role: finalRole });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
    res.json(req.user);
};
