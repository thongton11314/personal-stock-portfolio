import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getSettings } from '../services/dataService';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const settings = await getSettings();
    if (username !== settings.auth.username) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!settings.auth.passwordHash) {
      res.status(500).json({ error: 'Admin account not configured. Run setup.' });
      return;
    }

    const valid = await bcrypt.compare(password, settings.auth.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Server configuration error' });
      return;
    }

    const token = jwt.sign({ username }, secret, { expiresIn: '24h' });
    res.json({ token, expiresIn: 86400 });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/verify', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ valid: true, username: req.user?.username });
});

export default router;
