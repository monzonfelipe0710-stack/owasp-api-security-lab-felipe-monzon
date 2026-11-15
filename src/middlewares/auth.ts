import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../services/Database';
import { User } from '../models/user';
import { JWT_SECRET } from '../controllers/authController';

interface CustomRequest extends Request {
    user?: User;
}

const authenticate = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
        return res.status(401).json({ message: 'Invalid token format. Expected: Bearer <token>' });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as { id: number; role: string };
        const sql = 'SELECT id, username, email, role, profile_picture_url FROM users WHERE id = ?';
        db.get(sql, [decoded.id], (err, row: User) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(401).json({ message: 'Invalid or expired token.' });
            }
            req.user = row;
            next();
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token.', error: (err as Error).message });
    }
};

const checkAdminRole = (req: CustomRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user && user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador para esta acción.' });
    }
};

export { authenticate, checkAdminRole };
export type { CustomRequest };
