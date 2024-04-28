import { Router } from 'express';
import inventory from './controllers/inventory';
import * as computerController from './controllers/computerController';

const router = Router();

router.post('/inventory', inventory);

// Computers
router.get('/computers', computerController.getAll);
router.get('/computers/count', computerController.countComputers);

export default router;