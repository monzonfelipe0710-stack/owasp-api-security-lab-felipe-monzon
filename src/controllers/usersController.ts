
import { Request, Response } from 'express';
import { db } from '../services/Database';
import { User } from '../models/user';
import axios from 'axios';

interface CustomRequest extends Request {
    user?: User;
}

export const getUserById = async (req: CustomRequest, res: Response) => {
  try {
    const requestedId = Number(req.params.id);

    if (!Number.isInteger(requestedId) || requestedId <= 0) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.id !== requestedId && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied: you cannot access this user'
      });
    }

    const sql = 'SELECT id, username, email, role, profile_picture_url FROM users WHERE id = ?';

    db.get(sql, [requestedId], (err, user: User) => {
      if (err) {
        return res.status(500).json({ message: 'Server error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    const sql = `UPDATE users SET ${fields} WHERE id = ?`;
    db.run(sql, [...values, id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found or no changes made.' });
      }
      res.json({ message: 'User updated successfully', changes: this.changes });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    let sql = 'SELECT id, username, email, role, profile_picture_url FROM users';
    const params: any[] = [];

    if (limit) {
      sql += ' LIMIT ?';
      params.push(limit);
    }

    db.all(sql, params, (err, users: User[]) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      res.json(users);
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sql = 'DELETE FROM users WHERE id = ?';
    db.run(sql, [id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({ message: 'User deleted' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const setProfilePictureFromUrl = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });

    console.log(`Fetched image from ${url}, size: ${response.data.length} bytes.`);

    res.status(200).json({ message: 'Profile picture updated from URL.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch image from URL.', error: (error as Error).message });
  }
};

export const searchUsers = (req: Request, res: Response) => {
    const query = req.query.q as string;

    const sql = `SELECT id, username, role FROM users WHERE username LIKE '%${query}%'`;

    db.all(sql, [], (err, rows: User[]) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ users: rows });
    });
};

export const updateEmail = (req: CustomRequest, res: Response) => {
    const { new_email } = req.body;
    const loggedInUser = req.user!;

    const sql = 'UPDATE users SET email = ? WHERE id = ?';
    db.run(sql, [new_email, loggedInUser.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).send('User not found or email not changed.');
        }
        res.json({ message: 'Email updated successfully.' });
    });
};

export const getAccountInfo = (req: Request, res: Response) => {
    const accountId = req.params.id;

    const sql = 'SELECT id, username, role FROM users WHERE id = ?';

    db.get(sql, [accountId], (err, row: User) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }
        res.json({ account: row });
    });
};

export const recoverPassword = (req: Request, res: Response) => {
    const { username, security_answer } = req.body;

    res.status(501).json({ message: 'Función no implementada.' });
};

export const getSystemLogs = (req: Request, res: Response) => {
    res.json({ logs: "Mostrando logs del sistema... Acceso concedido.", user: (req as any).user });
};

export const exportAllUsers = (req: CustomRequest, res: Response) => {

    const sql = 'SELECT id, username, email, role FROM users';
    db.all(sql, [], (err, rows: User[]) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json({
            total_users: rows.length,
            user_list: rows.map(u => ({ userId: u.id, username: u.username, role: u.role }))
        });
    });
};
