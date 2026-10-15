import express from 'express';
import { getExecutionById, getExecutions } from '../controllers/executionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce session authentication on all execution routes
router.use(protect);

// Retrieve paginated execution history with filtering and search (EXEC-01, EXEC-03)
router.get('/', getExecutions);

// Retrieve specific execution by ID with strict ownership validation (EXEC-08)
router.get('/:id', getExecutionById);

export default router;
