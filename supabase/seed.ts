import 'dotenv/config';

const PROJECT_REF = 'glmrranchflzuxvjthli';
const API_URL = `https://${PROJECT_REF}.supabase.co`;
const AUTH_API = `${API_URL}/auth/v1/admin/users`;
const DATA_API = `${API_URL}/rest/v1`;

const SEED = [
  { email: 'admin@demo.com',  password: 'DemoAdmin123!',  role: 'admin',  firstName: 'Demo', lastName: 'Admin' },
  { email: 'author@demo.com', password: 'DemoAuthor123!', role: 'author', firstName: 'Demo', lastName: 'Author' },
  { email: 'reader@demo.com', password: 'DemoReader123!', role: 'reader', firstName: 'Demo', lastName: 'Reader' },
];

async function updateRole(userId: string, role: string, firstName: string, lastName: string, headers: Record<string, string>) {
  const res = await fetch(`${DATA_API}/users?id=eq.${userId}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ role, first_name: firstName, last_name: lastName }),
  });
  if (!res.ok) return await res.text();
}

async function lookupUserId(email: string, headers: Record<string, string>): Promise<string | null> {
  const r = await fetch(`${AUTH_API}?filter%5Bemail%5D=eq.${encodeURIComponent(email)}`, { headers });
  if (!r.ok) return null;
  const body = await r.json();
  return body.users?.[0]?.id ?? null;
}

async function main() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!secret) { console.error('❌ SUPABASE_SECRET_KEY not set'); process.exit(1); }
  const headers: Record<string, string> = { apikey: publishableKey || secret, Authorization: `Bearer ${secret}` };

  for (const u of SEED) {
    process.stdout.write(`\n${u.email} (${u.role})... `);

    const res = await fetch(AUTH_API, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: u.email, password: u.password,
        email_confirm: true,
        user_metadata: { firstName: u.firstName, lastName: u.lastName, username: u.email.split('@')[0] },
      }),
    });
    const body = await res.json();

    let userId = body.id;
    if (!res.ok) {
      userId = await lookupUserId(u.email, headers);
      if (!userId) { console.log(`❌ ${body.msg || JSON.stringify(body)}`); continue; }
      console.log(`exists — updating password`);
      await fetch(`${AUTH_API}/${userId}`, { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: u.password, email_confirm: true }) });
    } else {
      console.log(`created`);
    }

    const err = await updateRole(userId, u.role, u.firstName, u.lastName, headers);
    console.log(err ? `  ⚠ ${err.slice(0, 200)}` : `  ✅ role = ${u.role}`);
  }

  console.log(`\n✅ Seed complete`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  admin@demo.com   │ DemoAdmin123!  │ admin`);
  console.log(`  author@demo.com  │ DemoAuthor123! │ author`);
  console.log(`  reader@demo.com  │ DemoReader123! │ reader`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch(console.error);
