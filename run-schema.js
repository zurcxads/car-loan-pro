const fs = require('fs');
const https = require('https');

const SUPABASE_URL = 'https://pgvpqaqvrnmcxpeyknrt.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndnBxYXF2cm5tY3hwZXlrbnJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzExMTEyNiwiZXhwIjoyMDg4Njg3MTI2fQ.YhK5QvO21x_XvQczmmPILHZo7SxS5XqDQ2rocUdMaUs';

const sql = fs.readFileSync('supabase-schema.sql', 'utf8');

console.log('Setting up database schema via Supabase REST API...\n');

// Supabase provides a query endpoint for raw SQL
const options = {
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

const postData = JSON.stringify({ query: sql });

const req = https.request(`${SUPABASE_URL}/rest/v1/rpc/query`, options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ Schema setup complete!');
    } else {
      console.log('\n❌ Error - you may need to run this manually in Supabase SQL Editor');
      console.log('Visit: https://supabase.com/dashboard/project/pgvpqaqvrnmcxpeyknrt/sql/new');
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
  console.log('\n⚠️ Could not auto-setup. Please run supabase-schema.sql manually in Supabase SQL Editor:');
  console.log('https://supabase.com/dashboard/project/pgvpqaqvrnmcxpeyknrt/sql/new');
});

req.write(postData);
req.end();
