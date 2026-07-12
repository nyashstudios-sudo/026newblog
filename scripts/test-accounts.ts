import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

const accounts = [
  'admin@026news.com',
  'ada@026news.com',
  'alan@026news.com',
  'grace@026news.com',
  'mia@026news.com',
  'leo@026news.com',
];

async function testAccounts() {
  for (const email of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Password123!',
    });
    console.log(email, error ? `FAIL: ${error.message}` : `OK - ${data.user?.id}`);
  }
}

testAccounts();