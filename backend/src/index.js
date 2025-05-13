const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API Workflow Builder Backend is running!');
});

// API definition routes
const apiDefinitionRoutes = require('./routes/apiDefinitionRoutes'); // Corrected path
app.use('/api/definitions', apiDefinitionRoutes);

// Placeholder for workflow routes
// const workflowRoutes = require('./routes/workflowRoutes');
// app.use('/api/workflows', workflowRoutes);

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
