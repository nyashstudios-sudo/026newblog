import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

async function resetPasswords() {
  const accounts = [
    'admin@026news.com',
    'ada@026news.com',
    'alan@026news.com',
    'grace@026news.com',
    'mia@026news.com',
    'leo@026news.com',
  ];
  
  for (const email of accounts) {
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList.users.find(u => u.email === email);
    
    if (user) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password: 'Password123!' });
      console.log(email, error ? 'FAIL: ' + error.message : 'OK');
    } else {
      console.log(email, 'NOT FOUND');
    }
  }
}

resetPasswords();