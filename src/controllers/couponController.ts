import { Request, Response } from 'express';

let totalCoupons = 100; // Recurso limitado

export const claimCoupon = (req: Request, res: Response) => {
  if (totalCoupons > 0) {
    totalCoupons--;
    res.status(200).json({ message: 'Coupon claimed!', coupons_left: totalCoupons });
  } else {
    res.status(400).json({ message: 'No more coupons left!' });
  }
};