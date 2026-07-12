import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function testAccounts() {
  const accounts = [
    'admin@026news.com',
    'ada@026news.com',
    'alan@026news.com',
    'grace@026news.com',
    'mia@026news.com',
    'leo@026news.com',
  ];
  
  for (const email of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'Password123!',
    });
    
    if (error) {
      console.log(email, 'ERROR:', JSON.stringify(error, null, 2));
    } else {
      console.log(email, 'OK - User:', data.user?.id, 'Session:', !!data.session);
    }
  }
}

testAccounts();