import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const vars = env.split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k) acc[k.trim()] = v ? v.trim().replace(/^\"|\"$/g, '') : '';
  return acc;
}, {});

const supabaseUrl = vars.VITE_SUPABASE_URL || '';
const supabaseKey = vars.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  console.log('Testing RPC get_jury_evaluations_count...');
  const { data, error } = await supabase.rpc('get_jury_evaluations_count');
  console.log('RPC Error:', error);
  console.log('RPC Data:', data);
}

testRpc();
