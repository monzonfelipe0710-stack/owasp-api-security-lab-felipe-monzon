import { Router } from 'express';
import { claimCoupon } from '../controllers/couponController';
const router: Router = Router();
router.post('/claim', claimCoupon);
export default router;
