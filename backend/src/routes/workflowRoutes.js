const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

// POST /api/workflows - Save a new workflow
router.post('/', workflowController.saveWorkflow);

// GET /api/workflows - List all workflows
router.get('/', workflowController.listWorkflows);

// GET /api/workflows/:id - Get a specific workflow by ID
router.get('/:id', workflowController.getWorkflowById);

// DELETE /api/workflows/:id - Delete a workflow
router.delete('/:id', workflowController.deleteWorkflow);

// Placeholder for PUT /api/workflows/:id (update)

module.exports = router;
