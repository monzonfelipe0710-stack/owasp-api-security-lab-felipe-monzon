
import { Request, Response } from 'express';
import { CustomRequest } from '../middlewares/auth';

let totalCoupons = 100;

const userClaims = new Map<number, { count: number; windowStart: number }>();

const MAX_CLAIMS = 3;
const WINDOW_MS = 60 * 60 * 1000;

export const claimCoupon = (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: 'Authentication required.'
    });
  }

  const now = Date.now();
  let userLimit = userClaims.get(userId);

  if (!userLimit || now - userLimit.windowStart >= WINDOW_MS) {
    userLimit = {
      count: 0,
      windowStart: now
    };
  }

  if (userLimit.count >= MAX_CLAIMS) {
    return res.status(429).json({
      message: 'Rate limit exceeded. Try again later.'
    });
  }

  if (totalCoupons <= 0) {
    return res.status(400).json({
      message: 'No more coupons left!'
    });
  }

  userLimit.count++;
  userClaims.set(userId, userLimit);
  totalCoupons--;

  return res.status(200).json({
    message: 'Coupon claimed!',
    coupons_left: totalCoupons,
    claims_remaining: MAX_CLAIMS - userLimit.count
  });
};
