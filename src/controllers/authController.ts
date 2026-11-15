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

// API10: valida los datos recibidos del servicio externo.
const validateExternalImageUrl = (value: unknown): string | null => {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== 'https:') {
      return null;
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    const blockedHosts = [
      'localhost',
      'localhost.localdomain',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '[::1]',
      '169.254.169.254'
    ];

    if (
      blockedHosts.includes(hostname) ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      !hostname.includes('.')
    ) {
      return null;
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
};

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

    let profilePictureUrl: string | null = null;

    // API10: consumo controlado y validación de la respuesta externa.
    try {
      const geoResponse = await axios.get(
        `https://fictional-geo-api.com/email-to-country?email=${encodeURIComponent(email.trim())}`,
        {
          timeout: 5000,
          maxRedirects: 0,
          maxContentLength: 1024 * 1024,
          maxBodyLength: 1024 * 1024,
          validateStatus: (status) => status >= 200 && status < 300,
          headers: {
            Accept: 'application/json'
          }
        }
      );

      if (
        geoResponse.data &&
        typeof geoResponse.data === 'object' &&
        !Array.isArray(geoResponse.data)
      ) {
        profilePictureUrl = validateExternalImageUrl(
          geoResponse.data.profile_picture_url
        );
      }
    } catch (geoError) {
      console.error(
        'Fallo al consultar el servicio externo:',
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
        profilePictureUrl
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
    console.error(
      'Error interno durante el registro:',
      (error as Error).message
    );

    return res.status(500).json({
      message: 'Ha ocurrido un error interno en el servidor.'
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