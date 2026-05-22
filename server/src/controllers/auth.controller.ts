import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../database/db';
import { User, AuthPayload } from '../types';

export function login(req: Request, res: Response): void {
  const { username, password } = req.body as { username: string; password: string };

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const payload: AuthPayload = { id: user.id, username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '24h' });

  res.json({ token, user: payload });
}

export function logout(req: Request, res: Response): void {
  // JWT is stateless — client is responsible for discarding the token
  res.json({ message: 'Logged out successfully' });
}
