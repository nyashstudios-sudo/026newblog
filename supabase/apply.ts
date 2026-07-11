const PROJECT_REF = 'glmrranchflzuxvjthli';
const MANAGEMENT_API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

async function applyMigration() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error(`
❌ SUPABASE_ACCESS_TOKEN not set.

To get one:
  1. Go to https://supabase.com/dashboard/account/tokens
  2. Create a token with "manage_sql" scope
  3. Run: $env:SUPABASE_ACCESS_TOKEN = "sbp_..."
  4. Run: npx tsx supabase/apply.ts

Alternatively, apply migration.sql manually via the SQL Editor:
  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new
`);
    process.exit(1);
  }

  const fs = await import('fs');
  const sql = fs.readFileSync(new URL('./migration.sql', import.meta.url), 'utf-8');

  // Remove single-line comments (-- ...)
  const cleaned = sql
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n')
    .trim();

  if (!cleaned) {
    console.log('Nothing to run.');
    return;
  }

  console.log('Applying migration...');

  const res = await fetch(MANAGEMENT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: cleaned }),
  });

  const text = await res.text();

  if (res.ok) {
    console.log('✅ Migration applied successfully!');
  } else {
    console.error('❌ Error:', text.slice(0, 500));
    console.log('\nThe SQL Editor at https://supabase.com/dashboard/project/glmrranchflzuxvjthli/sql/new may give a better error.');
  }
}

applyMigration().catch(console.error);
