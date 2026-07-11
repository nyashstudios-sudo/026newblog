import 'dotenv/config';

const PROJECT_REF = 'glmrranchflzuxvjthli';
const API_URL = `https://${PROJECT_REF}.supabase.co`;
const AUTH_API = `${API_URL}/auth/v1/admin/users`;
const MGMT_API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const SEED = [
  { email: 'admin@demo.com',  password: 'DemoAdmin123!',  role: 'admin',  firstName: 'Demo', lastName: 'Admin' },
  { email: 'author@demo.com', password: 'DemoAuthor123!', role: 'author', firstName: 'Demo', lastName: 'Author' },
  { email: 'reader@demo.com', password: 'DemoReader123!', role: 'reader', firstName: 'Demo', lastName: 'Reader' },
];

async function sql(query: string, token: string) {
  const res = await fetch(MGMT_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) return await res.text();
}

async function lookupUserId(email: string, secret: string): Promise<string | null> {
  const r = await fetch(`${AUTH_API}?filter%5Bemail%5D=eq.${encodeURIComponent(email)}`, {
    headers: { apikey: secret, Authorization: `Bearer ${secret}` },
  });
  if (!r.ok) return null;
  const body = await r.json();
  return body.users?.[0]?.id ?? null;
}

async function main() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
  if (!secret) { console.error('❌ SUPABASE_SECRET_KEY not set'); process.exit(1); }
  if (!accessToken) { console.error('❌ SUPABASE_ACCESS_TOKEN not set (needed for role updates)'); process.exit(1); }

  const authHeaders = { apikey: secret, Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' };

  for (const u of SEED) {
    process.stdout.write(`\n${u.email} (${u.role})... `);

    const res = await fetch(AUTH_API, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        email: u.email, password: u.password,
        email_confirm: true,
        user_metadata: { firstName: u.firstName, lastName: u.lastName, username: u.email.split('@')[0] },
      }),
    });
    const body = await res.json();

    let userId = body.id;
    if (!res.ok) {
      userId = await lookupUserId(u.email, secret);
      if (!userId) { console.log(`❌ ${body.msg || JSON.stringify(body)}`); continue; }
      console.log(`exists — updating password`);
      await fetch(`${AUTH_API}/${userId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ password: u.password, email_confirm: true }) });
    } else {
      console.log(`created`);
    }

    const err = await sql(
      `update public.users set role = '${u.role}'::user_role, first_name = '${u.firstName}', last_name = '${u.lastName}' where id = '${userId}'`,
      accessToken,
    );
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
