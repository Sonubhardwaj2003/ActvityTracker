import express from 'express';
import {
  getLogs,
  upsertLog,
  batchUpsertLogs,
  deleteLog,
} from '../controllers/logController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getLogs)
  .post(upsertLog);

router.post('/batch', batchUpsertLogs);
router.delete('/:id', deleteLog);

export default router;
