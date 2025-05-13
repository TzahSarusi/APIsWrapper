const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Import a new API definition
exports.importApiDefinition = async (req, res) => {
  const { name, method, endpoint, description, schema } = req.body;

  if (!name || !method || !endpoint || !schema) {
    return res.status(400).json({ error: 'Missing required fields: name, method, endpoint, schema' });
  }

  try {
    const { data, error } = await supabase
      .from('api_definitions')
      .insert([{ name, method, endpoint, description, schema }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Failed to import API definition' });
  }
};

// List all API definitions (Placeholder for now)
exports.listApiDefinitions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('api_definitions')
      .select('*');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: error.message });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Server error listing API definitions:', err);
    res.status(500).json({ error: 'Failed to list API definitions' });
  }
};

// Delete an API definition
exports.deleteApiDefinition = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'API Definition ID is required' });
  }

  try {
    const { error } = await supabase
      .from('api_definitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting API definition:', error);
      // Check for specific errors, e.g., if the ID doesn't exist, Supabase might not error but return 0 rows affected.
      // However, a simple delete operation usually returns an error if the ID format is wrong or a DB constraint is violated.
      return res.status(500).json({ error: error.message });
    }

    // If no error, the delete was successful (even if 0 rows were deleted because ID didn't exist)
    res.status(200).json({ message: 'API definition deleted successfully' }); 
    // Or use 204 No Content if you prefer not to send a body for successful deletes: res.status(204).send();
  } catch (err) {
    console.error('Server error deleting API definition:', err);
    res.status(500).json({ error: 'Failed to delete API definition' });
  }
};
