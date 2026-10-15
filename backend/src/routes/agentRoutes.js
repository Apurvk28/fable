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
import {
  runTask,
  chatWithAgent,
  getAgentExecutions,
} from '../controllers/executionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { verifyCsrf } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Enforce session authentication for all agent endpoints
router.use(protect);

// Safe read routes (CSRF not required for idempotent GETs)
router.get('/', getAgents);
router.get('/models', getSupportedModels);
router.get('/:id', getAgentById);
router.get('/:id/executions', getAgentExecutions);

// State-mutating routes (Strictly protected with CSRF token verification)
router.post('/', verifyCsrf, createAgent);
router.post('/generate-config', verifyCsrf, generateAgentConfig);
router.patch('/:id', verifyCsrf, updateAgent);
router.delete('/:id', verifyCsrf, deleteAgent);
router.post('/:id/duplicate', verifyCsrf, duplicateAgent);

// Agent Execution Engine endpoints (PRD: RUN-02, RUN-03)
router.post('/:id/run', verifyCsrf, runTask);
router.post('/:id/chat', verifyCsrf, chatWithAgent);

export default router;
