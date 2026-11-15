
import { Request, Response } from 'express';
import { db } from '../services/Database';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const JWT_SECRET: string = process.env.JWT_SECRET ?? '';

if (JWT_SECRET.length < 64) {
  throw new Error('JWT_SECRET no está configurada o no es suficientemente segura.');
}

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      typeof email !== 'string' ||
      !username.trim() ||
      !email.trim() ||
      password.length < 12
    ) {
      return res.status(400).json({
        message: 'Datos inválidos. La contraseña debe tener al menos 12 caracteres.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let countryData: any = {};

    try {
      const geoResponse = await axios.get(
        `https://fictional-geo-api.com/email-to-country?email=${encodeURIComponent(email)}`
      );
      countryData = geoResponse.data;
    } catch (geoError) {
      console.error(
        'Fallo al obtener datos de geolocalización:',
        (geoError as Error).message
      );
    }

    const sql = `
      INSERT INTO users
      (username, password, email, role, profile_picture_url)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [
        username.trim(),
        passwordHash,
        email.trim(),
        'user',
        countryData.profile_picture_url ?? null
      ],
      function (err) {
        if (err) {
          return res.status(409).json({
            message: 'No se pudo crear el usuario. Verificá que el nombre y correo no estén registrados.'
          });
        }

        return res.status(201).json({
          message: 'User created',
          userId: this.lastID
        });
      }
    );
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating user',
      error: (error as Error).message
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const sql = 'SELECT * FROM users WHERE username = ?';

    db.get(sql, [username.trim()], async (err, user: User) => {
      if (err) {
        return res.status(500).json({
          message: 'Error logging in'
        });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      try {
        const passwordMatches = await bcrypt.compare(password, user.password);

        if (!passwordMatches) {
          return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, role: user.role },
          JWT_SECRET,
          {
            expiresIn: '1h',
            jwtid: crypto.randomUUID()
          }
        );

        return res.json({ token });
      } catch {
        return res.status(500).json({
          message: 'Error validating credentials'
        });
      }
    });
  } catch {
    return res.status(500).json({ message: 'Error logging in' });
  }
};

export const logout = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.jti) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    db.run(
      'INSERT OR IGNORE INTO revoked_tokens (jti) VALUES (?)',
      [decoded.jti],
      function (err) {
        if (err) {
          return res.status(500).json({
            message: 'Could not close session.'
          });
        }

        return res.json({
          message: 'Sesión cerrada correctamente. El token ha sido revocado.'
        });
      }
    );
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
