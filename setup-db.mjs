import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://pgvpqaqvrnmcxpeyknrt.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBndnBxYXF2cm5tY3hwZXlrbnJ0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzExMTEyNiwiZXhwIjoyMDg4Njg3MTI2fQ.YhK5QvO21x_XvQczmmPILHZo7SxS5XqDQ2rocUdMaUs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sql = readFileSync('supabase-schema.sql', 'utf8');

console.log('Running database setup...\n');

// Split by semicolons and execute each statement
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s && !s.startsWith('--'));

for (const statement of statements) {
  if (!statement) continue;
  
  console.log(`Executing: ${statement.substring(0, 60)}...`);
  
  const { data, error } = await supabase.rpc('exec', { 
    query: statement + ';' 
  });
  
  if (error && !error.message.includes('already exists')) {
    console.error('Error:', error.message);
  } else {
    console.log('✓ Success');
  }
}

console.log('\nDatabase setup complete!');
