const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Create/Save a new workflow
exports.saveWorkflow = async (req, res) => {
  const { name, description, nodes, edges } = req.body;

  if (!name || !nodes || !edges) {
    return res.status(400).json({ error: 'Missing required fields: name, nodes, edges' });
  }

  try {
    // For simplicity, this example always inserts. 
    // A more robust solution might check if a workflow with 'name' exists and offer to update (PUT).
    const { data, error } = await supabase
      .from('workflows')
      .insert([{ name, description, nodes, edges }])
      .select();

    if (error) {
      console.error('Supabase error saving workflow:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error saving workflow:', err);
    res.status(500).json({ error: 'Failed to save workflow' });
  }
};

// List all workflows
exports.listWorkflows = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('id, name, description, created_at'); // Select specific fields for listing

    if (error) {
      console.error('Supabase error listing workflows:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Server error listing workflows:', err);
    res.status(500).json({ error: 'Failed to list workflows' });
  }
};

// Get a specific workflow by ID (for loading) - Placeholder for now
exports.getWorkflowById = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', id)
      .single(); // Expects a single row

    if (error) {
      if (error.code === 'PGRST116') { // PostgREST error for "No rows found"
        return res.status(404).json({ error: 'Workflow not found' });
      }
      console.error('Supabase error fetching workflow by ID:', error);
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
        return res.status(404).json({ error: 'Workflow not found' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Server error fetching workflow by ID:', err);
    res.status(500).json({ error: 'Failed to fetch workflow' });
  }
};
