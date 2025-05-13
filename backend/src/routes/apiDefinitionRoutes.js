const express = require('express');
const router = express.Router();
const apiDefinitionController = require('../controllers/apiDefinitionController');

// POST /api/definitions - Import a new API definition
router.post('/', apiDefinitionController.importApiDefinition);

// GET /api/definitions - List all API definitions
router.get('/', apiDefinitionController.listApiDefinitions);

// DELETE /api/definitions/:id - Delete an API definition
router.delete('/:id', apiDefinitionController.deleteApiDefinition);

// Placeholder for other routes like GET /api/definitions/:id

module.exports = router;
