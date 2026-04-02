export const protect = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!userRole) return res.status(401).json({ success: false, message: 'Authentication required' });
    next();
};

export const authorize = (role) => (req, res, next) => {
    if (req.headers['x-user-role'] !== role) {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }
    next();
};
