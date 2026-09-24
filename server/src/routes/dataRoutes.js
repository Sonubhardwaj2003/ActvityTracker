import express from 'express';
import {
  exportBackup,
  importBackup,
  exportCSV,
} from '../controllers/dataController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/export/backup', exportBackup);
router.get('/export/csv', exportCSV);
router.post('/import/backup', importBackup);

export default router;
