async function testAuth() {
  const url = 'https://glmrranchflzuxvjthli.supabase.co/auth/v1/token?grant_type=password';
  const headers = {
    'Content-Type': 'application/json',
    'apikey': 'sb_publishable_SbztgiJnkqGjlsv63eVv7g__suxnfL_',
  };
  
  const body = JSON.stringify({
    email: 'admin@026news.com',
    password: 'Password123!',
  });
  
  try {
    const res = await fetch(url, { method: 'POST', headers, body });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

testAuth();