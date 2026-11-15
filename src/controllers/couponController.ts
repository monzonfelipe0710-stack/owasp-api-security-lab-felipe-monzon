
import { Response } from 'express';
import { CustomRequest } from '../middlewares/auth';
import { db } from '../services/Database';

const MAX_CLAIMS = 3;
const MAX_TOTAL_COUPONS = 100;

export const claimCoupon = (req: CustomRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: 'Authentication required.'
    });
  }

  // Consultar los reclamos de esta cuenta durante la última hora
  db.get(
    `SELECT COUNT(*) AS total
     FROM coupon_claims
     WHERE user_id = ?
     AND claimed_at >= datetime('now', '-1 hour')`,
    [userId],
    (err, userRow: { total: number }) => {
      if (err) {
        console.error('Error al consultar reclamos del usuario:', err.message);
        return res.status(500).json({
          message: 'Could not verify coupon claims.'
        });
      }

      if (userRow.total >= MAX_CLAIMS) {
        return res.status(429).json({
          message: 'Rate limit exceeded. Try again later.'
        });
      }

      // Consultar el total de cupones entregados
      db.get(
        'SELECT COUNT(*) AS total FROM coupon_claims',
        [],
        (totalErr, totalRow: { total: number }) => {
          if (totalErr) {
            console.error('Error al consultar cupones:', totalErr.message);
            return res.status(500).json({
              message: 'Could not verify coupon availability.'
            });
          }

          if (totalRow.total >= MAX_TOTAL_COUPONS) {
            return res.status(400).json({
              message: 'No more coupons left!'
            });
          }

          // Registrar el reclamo de forma persistente
          db.run(
            'INSERT INTO coupon_claims (user_id) VALUES (?)',
            [userId],
            function (insertErr) {
              if (insertErr) {
                console.error('Error al registrar el cupón:', insertErr.message);
                return res.status(500).json({
                  message: 'Could not register coupon claim.'
                });
              }

              const claimsUsed = userRow.total + 1;

              return res.status(200).json({
                message: 'Coupon claimed!',
                coupons_left: MAX_TOTAL_COUPONS - totalRow.total - 1,
                claims_remaining: MAX_CLAIMS - claimsUsed
              });
            }
          );
        }
      );
    }
  );
};
