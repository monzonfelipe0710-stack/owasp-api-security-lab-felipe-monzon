import { Router } from 'express';
import { db } from '../services/Database';
import { User } from '../models/user';

const router: Router = Router();

router.get('/:id', async (req, res) => {
  try {
    const sql = 'SELECT id, username FROM users WHERE id = ?';
    db.get(sql, [req.params.id], (err, user: User) => {
      if (err) {
        return res.status(500).send();
      }
      if (user) {
        res.json({ id: user.id, username: user.username });
      } else {
        res.status(404).send();
      }
    });
  } catch (error) {
    res.status(500).send();
  }
});

export default router;