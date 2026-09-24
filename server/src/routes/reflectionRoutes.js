import express from 'express';
import {
  getReflectionByDate,
  upsertReflection,
  getReflectionsHistory,
} from '../controllers/reflectionController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/history', getReflectionsHistory);
router.get('/:date', getReflectionByDate);
router.post('/', upsertReflection);

export default router;
