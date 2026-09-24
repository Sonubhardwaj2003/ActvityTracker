import express from 'express';
import {
  getDashboardSummary,
  getRangeAnalytics,
  getHeatmap,
  getActivityAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardSummary);
router.get('/range', getRangeAnalytics);
router.get('/heatmap', getHeatmap);
router.get('/activity/:id', getActivityAnalytics);

export default router;
