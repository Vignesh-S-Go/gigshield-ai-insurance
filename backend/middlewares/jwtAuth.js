import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gigshield-secret-key-change-in-production';

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            phone: user.phone,
            role: user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
};

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }

        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }

        req.user = {
            id: user.id,
            phone: user.phone,
            role: user.role,
            name: user.name
        };

        next();
    } catch (err) {
        console.error('[authMiddleware]', err);
        return res.status(500).json({ success: false, error: 'Authentication error' });
    }
};

export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
};

export const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY || 'gigshield-api-key';

    if (apiKey && apiKey === validApiKey) {
        return next();
    }

    if (req.user) {
        return next();
    }

    return res.status(401).json({ success: false, error: 'API key or authentication required' });
};
