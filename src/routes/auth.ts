
import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router: Router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);

export default router;
