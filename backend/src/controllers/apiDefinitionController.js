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
    console.error('Server error:', err);
    res.status(500).json({ error: 'Failed to list API definitions' });
  }
};
