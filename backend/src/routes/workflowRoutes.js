const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// POST /api/workflows - Save a new workflow
router.post('/', workflowController.saveWorkflow);

// GET /api/workflows - List all workflows
router.get('/', workflowController.listWorkflows);

// GET /api/workflows/:id - Get a specific workflow by ID
router.get('/:id', workflowController.getWorkflowById);

// Placeholder for PUT /api/workflows/:id (update) and DELETE /api/workflows/:id

module.exports = router;
