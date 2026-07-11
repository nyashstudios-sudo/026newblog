import 'dotenv/config';

const PROJECT_REF = 'glmrranchflzuxvjthli';
const MGMT_API = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`;

const CATEGORIES = [
  { name: 'Education', slug: 'education', description: 'Learning resources, courses, and academic insights', icon: 'graduation-cap' },
  { name: 'Self Improvement', slug: 'self-improvement', description: 'Productivity, habits, mindset, and personal growth', icon: 'sparkles' },
];

const FEEDS: { name: string; url: string; categorySlug: string; refreshMinutes: number }[] = [
  // Education sources
  { name: 'TED Talks Daily', url: 'https://feeds.feedburner.com/tedtalks_video', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'Khan Academy Blog', url: 'https://blog.khanacademy.org/feed/', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'Harvard Business Review', url: 'https://hbr.org/rss.xml', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'Scientific American', url: 'https://www.scientificamerican.com/feed/rss/', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'Aeon', url: 'https://aeon.co/feed.rss', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', categorySlug: 'education', refreshMinutes: 1440 },

  // Self-improvement / life-improving sources
  { name: 'James Clear — 3-2-1 Thursday', url: 'https://jamesclear.com/feed', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Farnam Street', url: 'https://fs.blog/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Scott H Young', url: 'https://www.scotthyoung.com/blog/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'The Marginalian', url: 'https://www.themarginalian.org/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Psyche', url: 'https://psyche.co/feed.rss', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Zen Habits', url: 'https://zenhabits.net/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Wait But Why', url: 'https://waitbutwhy.com/feed', categorySlug: 'self-improvement', refreshMinutes: 1440 },
];

async function sql(query: string, token: string) {
  const res = await fetch(MGMT_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) console.error(`SQL error: ${text.slice(0, 300)}`);
  return text;
}

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) { console.error('❌ SUPABASE_ACCESS_TOKEN not set'); process.exit(1); }

  // 1. Create categories
  for (const cat of CATEGORIES) {
    // Upsert: try insert, ignore conflict on slug
    const r = await sql(
      `insert into public.categories (name, slug, description, icon) values ('${cat.name}', '${cat.slug}', '${cat.description}', '${cat.icon}') on conflict (slug) do nothing returning id;`,
      token,
    );
    if (r.includes('"id"')) console.log(`✅ Category '${cat.name}' created`);
    else console.log(`ℹ️  Category '${cat.name}' already exists`);
  }

  // 2. Get all category IDs
  const catResult = await sql(`select json_agg(json_build_object('slug', slug, 'id', id)) from public.categories where slug in ('education', 'self-improvement');`, token);
  let catMap: Record<string, string> = {};
  try {
    const parsed = JSON.parse(catResult);
    if (parsed?.[0]?.json_agg) {
      for (const c of parsed[0].json_agg) catMap[c.slug] = c.id;
    }
  } catch {}
  if (!catMap.education || !catMap['self-improvement']) {
    console.error('❌ Could not find categories after upsert');
    process.exit(1);
  }

  // 3. Insert RSS feeds
  let added = 0;
  for (const feed of FEEDS) {
    const catId = catMap[feed.categorySlug];
    const r = await sql(
      `insert into public.rss_feeds (name, url, category_id, refresh_interval_minutes, status) values ('${feed.name.replace(/'/g, "''")}', '${feed.url}', '${catId}', ${feed.refreshMinutes}, 'active') on conflict (url) do nothing returning id;`,
      token,
    );
    if (r.includes('"id"')) {
      console.log(`✅ Feed added: ${feed.name}`);
      added++;
    } else {
      console.log(`ℹ️  Feed already exists: ${feed.name}`);
    }
  }

  console.log(`\n✅ Done. ${added} new feeds added out of ${FEEDS.length} total.`);
}

main().catch(console.error);
