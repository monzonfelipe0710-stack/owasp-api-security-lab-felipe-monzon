import { Request, Response } from 'express';
import { db } from '../services/Database';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import axios from 'axios';

export const JWT_SECRET = 'tu_secreto_super_secreto_y_debil';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    let countryData: any = {};
    try {
      const geoResponse = await axios.get(`https://fictional-geo-api.com/email-to-country?email=${email}`);
      countryData = geoResponse.data;
    } catch (geoError) {
      console.error('Fallo al obtener datos de la API de geolocalización:', (geoError as Error).message);
    }

    const sql = 'INSERT INTO users (username, password, email, role, profile_picture_url) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [username, password, email, 'user', countryData.profile_picture_url], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error creating user', error: err.message });
      }
      res.status(201).json({ message: 'User created', userId: this.lastID, data: countryData });
    });

  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user: User) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging in', error: err.message });
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
};

export const logout = (req: Request, res: Response) => {
  // VULNERABILIDAD A02: El logout es solo cosmético. No invalida el token JWT en el servidor
  // (no existe lista de revocación ni expiración forzada), permitiendo que el token siga activo.
  res.json({ message: 'Sesión cerrada con éxito. El token debe ser descartado por el cliente.' });
};