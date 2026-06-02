/**
 * Check if resource_reports table exists in Supabase
 * Usage: node scripts/add-reports-table.js
 *
 * Note: This script verifies the table. To create it, run the SQL in:
 * supabase/add-reports-table.sql
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import ws from 'ws';

// Load environment variables
config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please set PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

// Create Supabase client with service key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  global: {
    fetch: fetch,
  },
  realtime: {
    transport: ws,
  }
});

async function checkTable() {
  console.log('\n🔍 Checking resource_reports table...\n');

  // Try to query the table
  const { data, error } = await supabase
    .from('resource_reports')
    .select('*')
    .limit(1);

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Table does not exist yet.\n');
      console.log('To create the table, run this SQL in Supabase SQL Editor:');
      console.log('📄 File: supabase/add-reports-table.sql\n');
      console.log('Or copy this URL to your Supabase project SQL Editor:');
      console.log(`${supabaseUrl.replace('.supabase.co', '.supabase.co/project/_/sql')}\n`);
      process.exit(1);
    } else {
      console.error('❌ Error checking table:', error);
      process.exit(1);
    }
  }

  console.log('✅ Table exists and is ready!\n');
  console.log(`Found ${data?.length || 0} existing reports.\n`);
}

checkTable()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
