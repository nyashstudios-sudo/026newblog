const PROJECT_REF = 'glmrranchflzuxvjthli';
const AUTH_API = `https://${PROJECT_REF}.supabase.co/auth/v1/admin/users`;
const MGMT_API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const SEED = [
  { email: 'admin@demo.com',  password: 'DemoAdmin123!',  role: 'admin',  firstName: 'Demo', lastName: 'Admin' },
  { email: 'author@demo.com', password: 'DemoAuthor123!', role: 'author', firstName: 'Demo', lastName: 'Author' },
  { email: 'reader@demo.com', password: 'DemoReader123!', role: 'reader', firstName: 'Demo', lastName: 'Reader' },
];

async function sql(query: string, headers: Record<string, string>): Promise<{ error?: string; data?: any[] }> {
  const res = await fetch(MGMT_API, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
  if (!res.ok) return { error: await res.text() };
  try { return { data: await res.json() }; } catch { return {}; }
}

async function lookupUserId(email: string, headers: Record<string, string>): Promise<string | null> {
  const r = await fetch(`${AUTH_API}?filter%5Bemail%5D=eq.${encodeURIComponent(email)}`, { headers });
  if (!r.ok) return null;
  const body = await r.json();
  return body.users?.[0]?.id ?? null;
}

async function main() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) { console.error('❌ SUPABASE_SECRET_KEY not set'); process.exit(1); }
  const headers = { Authorization: `Bearer ${secret}` };

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

    const { error } = await sql(
      `update public.users set role = '${u.role}'::user_role, first_name = '${u.firstName}', last_name = '${u.lastName}' where id = '${userId}'`,
      headers,
    );
    if (error) console.log(`  ⚠ role update failed: ${error.slice(0, 200)}`);
    else console.log(`  ✅ role = ${u.role}`);
  }

  console.log(`\n✅ Seed complete`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  admin@demo.com   │ DemoAdmin123!  │ admin`);
  console.log(`  author@demo.com  │ DemoAuthor123! │ author`);
  console.log(`  reader@demo.com  │ DemoReader123! │ reader`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch(console.error);
