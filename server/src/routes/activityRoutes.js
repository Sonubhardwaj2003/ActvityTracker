import express from 'express';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  archiveActivity,
  reorderActivities,
  duplicateActivity,
  deleteActivity,
} from '../controllers/activityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getActivities)
  .post(createActivity);

router.post('/reorder', reorderActivities);

router.route('/:id')
  .get(getActivityById)
  .put(updateActivity)
  .delete(deleteActivity);

router.patch('/:id/archive', archiveActivity);
router.post('/:id/duplicate', duplicateActivity);

export default router;
