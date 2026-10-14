import express from 'express';
import {
  getAgents,
  getAgentById,
  createAgent,
  updateAgent,
  deleteAgent,
  duplicateAgent,
  generateAgentConfig,
  getSupportedModels,
} from '../controllers/agentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyCsrf } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Enforce session authentication for all agent endpoints
router.use(protect);

// Safe read routes (CSRF not required for idempotent GETs)
router.get('/', getAgents);
router.get('/models', getSupportedModels);
router.get('/:id', getAgentById);

// State-mutating routes (Strictly protected with CSRF token verification)
router.post('/', verifyCsrf, createAgent);
router.post('/generate-config', verifyCsrf, generateAgentConfig);
router.patch('/:id', verifyCsrf, updateAgent);
router.delete('/:id', verifyCsrf, deleteAgent);
router.post('/:id/duplicate', verifyCsrf, duplicateAgent);

export default router;
