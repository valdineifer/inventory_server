import { type Request, type Response, Router, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import inventory from './controllers/inventory';
import * as computerController from './controllers/computerController';
import { signin } from './controllers/authController';

const router = Router();

router.post('/inventory', inventory);

// Auth
router.post('/login', signin);

const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization as string|undefined;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({error: 'Token required'});
  }

  try {
    jwt.verify(token, process.env.SECRET_KEY!, { maxAge: '7d' });
  } catch (error) {
    return res.status(403).json({error: 'Invalid token'});
  }

  next();
};

router.use(authenticateToken);

// Computers
router.get('/computers', computerController.getAll);
router.get('/computers/count', computerController.countComputers);
router.get('/computers/:id(\\d+)', computerController.getComputer);

export default router;