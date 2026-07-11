import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', description: 'Latest in tech, AI, and digital innovation', icon: 'cpu' },
  { name: 'Business', slug: 'business', description: 'Business news, startups, and economic insights', icon: 'briefcase' },
  { name: 'Science', slug: 'science', description: 'Scientific discoveries and research', icon: 'flask' },
  { name: 'Culture', slug: 'culture', description: 'Arts, entertainment, and cultural commentary', icon: 'palette' },
  { name: 'Health', slug: 'health', description: 'Health, wellness, and medical breakthroughs', icon: 'heart' },
  { name: 'Sports', slug: 'sports', description: 'Sports news and analysis', icon: 'trophy' },
  { name: 'Education', slug: 'education', description: 'Learning resources and academic insights', icon: 'graduation-cap' },
  { name: 'Self Improvement', slug: 'self-improvement', description: 'Productivity, habits, and personal growth', icon: 'sparkles' },
];

const ARTICLES = [
  { title: 'The Rise of African AI Startups: A New Tech Frontier', category: 'technology', tags: ['AI', 'startups', 'Africa', 'innovation'], content: 'African AI startups raised over $500 million in 2025, marking a 78% increase from the previous year. From Lagos to Nairobi, a new generation of entrepreneurs is building AI solutions tailored to local challenges. This surge reflects growing investor confidence in the continent\'s tech ecosystem, with applications ranging from agricultural optimization to healthcare diagnostics.', excerpt: 'African AI startups raised over $500M in 2025 — a 78% surge driven by local innovation in agriculture, healthcare, and fintech.' },
  { title: 'How East African Coffee Farmers Are Using Blockchain', category: 'technology', slug: 'east-african-coffee-blockchain', tags: ['blockchain', 'coffee', 'agriculture', 'East Africa'], content: 'Coffee cooperatives in Kenya, Ethiopia, and Uganda are adopting blockchain technology to ensure fair pricing and supply chain transparency. By recording every transaction on an immutable ledger, farmers can now prove the origin and quality of their beans, commanding premium prices in international markets.', excerpt: 'Coffee farmers in East Africa are using blockchain to trace beans from farm to cup, ensuring fair prices and supply chain transparency.' },
  { title: 'Inside Kenya\'s Booming Startup Ecosystem', category: 'business', tags: ['startups', 'Kenya', 'investment', 'innovation'], content: 'Nairobi has become Africa\'s third-largest hub for venture capital, attracting $1.2 billion in 2025. Fintech leads the charge, but climate tech, health tech, and edtech are gaining momentum. This analysis explores the factors driving Kenya\'s startup boom and the challenges that remain.', excerpt: 'Nairobi attracted $1.2B in VC funding in 2025, becoming Africa\'s third-largest startup hub behind Lagos and Cape Town.' },
  { title: 'The Future of Renewable Energy in Sub-Saharan Africa', category: 'science', tags: ['energy', 'renewable', 'climate', 'Africa'], content: 'Sub-Saharan Africa has the potential to become a global leader in renewable energy. With abundant solar, wind, and geothermal resources, the region could leapfrog fossil fuel infrastructure entirely. However, policy fragmentation and infrastructure gaps remain significant hurdles.', excerpt: 'Sub-Saharan Africa could leapfrog to 100% renewable energy, but policy gaps and infrastructure deficits stand in the way.' },
  { title: 'A New Wave of Afrobeats Is Taking Over Global Charts', category: 'culture', tags: ['music', 'Afrobeats', 'culture', 'global'], content: 'Afrobeats has evolved from a regional sound into a global phenomenon, with artists like Burna Boy, Asake, and Tyla dominating streaming platforms worldwide. The genre\'s fusion of traditional African rhythms with pop, R&B, and amapiano has created a sound that transcends borders.', excerpt: 'Afrobeats artists are dominating global charts as the genre evolves from regional sound to worldwide movement.' },
  { title: 'mental Health Awareness in African Workplaces', category: 'health', tags: ['mental health', 'workplace', 'wellness', 'Africa'], content: 'A growing number of African companies are investing in employee mental health programs. From Nairobi to Johannesburg, businesses are recognizing that mental well-being directly impacts productivity and retention. Yet stigma remains a significant barrier to seeking help.', excerpt: 'African companies are investing in mental health programs, but stigma and lack of resources remain major challenges.' },
  { title: 'The Digital Divide in African Education Post-COVID', category: 'education', tags: ['education', 'digital divide', 'COVID', 'remote learning'], content: 'The pandemic accelerated digital learning across Africa, but also exposed deep inequities. While private schools in urban areas thrived with online platforms, millions of students in rural areas were left behind due to lack of internet access and devices.', excerpt: 'COVID exposed Africa\'s education divide: urban schools went digital while millions of rural students were left behind.' },
  { title: 'Kipchoge\'s Legacy: What Makes the Greatest Marathoner of All Time', category: 'sports', tags: ['running', 'marathon', 'Kipchoge', 'Kenya'], content: 'Eliud Kipchoge\'s remarkable career offers lessons in discipline, mindset, and human potential. From his Olympic gold medals to the sub-two-hour marathon, the Kenyan legend has redefined what\'s possible in endurance sports.', excerpt: 'Eliud Kipchoge\'s journey from Olympic champion to sub-two-hour marathoner reveals the mindset behind greatness.' },
  { title: 'How to Build a Reading Habit That Sticks', category: 'self-improvement', tags: ['reading', 'productivity', 'habits', 'learning'], content: 'Reading is one of the most effective ways to grow, but many struggle to maintain the habit. This guide covers practical strategies from atomic habits framework: start small, stack habits, optimize your environment, and track progress.', excerpt: 'Practical strategies to build a lasting reading habit using atomic habits, environment design, and progress tracking.' },
  { title: 'The Art of Active Listening in Leadership', category: 'self-improvement', tags: ['leadership', 'communication', 'listening', 'soft skills'], content: 'Great leaders listen more than they speak. Active listening — fully concentrating, understanding, responding, and remembering what others say — is the most underrated leadership skill. This article explores techniques to master it.', excerpt: 'Active listening is the most underrated leadership skill. Learn techniques to listen better and lead more effectively.' },
  { title: 'Why Learning a Second Language Boosts Brain Health', category: 'education', tags: ['languages', 'brain health', 'cognitive science', 'learning'], content: 'Studies show that bilingualism delays cognitive decline by up to five years. Learning a second language strengthens neural pathways, improves executive function, and enhances cultural understanding. It\'s never too late to start.', excerpt: 'Bilingualism delays cognitive decline by up to 5 years. Here\'s how learning a language transforms your brain.' },
  { title: 'The Psychology of Financial Decision-Making', category: 'business', tags: ['psychology', 'finance', 'behavioral economics', 'decision-making'], content: 'Why do smart people make poor financial decisions? Behavioral economics reveals that cognitive biases — from loss aversion to confirmation bias — systematically influence our money choices. Understanding these biases is the first step to better financial outcomes.', excerpt: 'Behavioral economics reveals why smart people make poor financial decisions — and how to overcome cognitive biases.' },
  { title: 'Kenya\'s Rift Valley: The Cradle of Human History', category: 'culture', tags: ['history', 'Kenya', 'archaeology', 'Rift Valley'], content: 'The Rift Valley has yielded some of the most important archaeological discoveries in human history. From the Turkana Boy to ancient tools dating back millions of years, this region continues to reshape our understanding of human evolution.', excerpt: 'The Rift Valley\'s archaeological treasures are rewriting the story of human evolution, from Turkana Boy to ancient tools.' },
  { title: 'The Microbiome Revolution: How Gut Health Affects Everything', category: 'health', tags: ['microbiome', 'gut health', 'wellness', 'science'], content: 'The human gut microbiome influences everything from digestion to mood to immune function. Recent research reveals that diet, exercise, sleep, and even social connections shape our microbial ecosystem in profound ways.', excerpt: 'Your gut microbiome affects everything from your mood to your immunity. Here\'s what the latest science reveals.' },
  { title: 'Inside M-Pesa\'s Evolution from Mobile Money to Financial Superapp', category: 'technology', tags: ['M-Pesa', 'fintech', 'mobile money', 'Africa'], content: 'M-Pesa started as a simple money transfer service in 2007 and has evolved into a financial ecosystem serving over 60 million users across Africa. From loans to insurance to international remittances, M-Pesa\'s journey mirrors Africa\'s digital financial revolution.', excerpt: 'M-Pesa grew from a simple money transfer service to Africa\'s largest fintech platform with 60M+ users across the continent.' },
];

async function upsertCategory(cat: typeof CATEGORIES[0]) {
  const { data: existing } = await sb.from('categories').select('id').eq('slug', cat.slug).maybeSingle();
  if (existing) return existing.id;
  const { data } = await sb.from('categories').insert({
    name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon,
  }).select('id').single();
  return data?.id;
}

async function getOrCreateAuthorUser(email: string, firstName: string, lastName: string, username: string) {
  // Check if user exists in auth via the users table
  const { data: existing } = await sb.from('users').select('id, role').eq('email', email).maybeSingle();
  if (existing) {
    // Ensure role is author
    if (existing.role !== 'author') {
      await sb.from('users').update({ role: 'author' }).eq('id', existing.id);
    }
    return existing.id;
  }
  return null; // Need to create via Auth API
}

async function main() {
  console.log('Seeding mock data...\n');

  // 1. Upsert categories
  const catMap: Record<string, string> = {};
  for (const cat of CATEGORIES) {
    const id = await upsertCategory(cat);
    if (id) { catMap[cat.slug] = id; console.log(`✅ Category: ${cat.name}`); }
  }

  // 2. Create author user (via Management API - same as seed.ts)
  // Check if demo author exists
  let authorId = await getOrCreateAuthorUser('author@demo.com', 'Demo', 'Author', 'demo-author');
  if (!authorId) {
    console.log('⚠ demo author not found. Run supabase/seed.ts first to create users.');
    console.log('Creating author via direct insert...');
    // Direct insert into users table (bypasses auth, but useful for demo)
    let newUser: any;
    try {
      const r = await sb.from('users').insert({
        email: 'author@demo.com',
        first_name: 'Demo', last_name: 'Author',
        username: 'demo-author',
        role: 'author',
        is_active: true,
      }).select('id').single();
      newUser = r.data;
    } catch {}
    if (!newUser?.id) {
      console.log('❌ Could not create author user. Aborting article creation.');
      return;
    }
    authorId = newUser.id;
    console.log('✅ Created author user (direct insert)');
  } else {
    console.log('✅ Author user found');
  }

  // 3. Create an author application for demo purposes
  const { data: existingApp } = await sb.from('author_applications').select('id').eq('user_id', authorId).maybeSingle();
  if (!existingApp) {
    try { await sb.from('author_applications').insert({
      user_id: authorId,
      professional_title: 'Senior Technology Writer',
      writing_niche: 'Technology, Business & Culture',
      years_experience: '5-10',
      portfolio_url: 'https://demo-author.example.com',
      motivation: 'I am passionate about storytelling that bridges Africa\'s tech innovation with global audiences. With 7 years of journalism experience, I want to bring authentic narratives about African entrepreneurship, science, and culture to 026Newsblog.',
      status: 'approved',
      reviewed_at: new Date().toISOString(),
    }); } catch {}
    console.log('✅ Author application created');
  }

  // 4. Create articles
  let articleCount = 0;
  for (const art of ARTICLES) {
    const catId = catMap[art.category];
    if (!catId) { console.log(`  ⚠ No category for: ${art.title}`); continue; }
    const slug = slugify(art.title);
    const wordCount = art.content.split(' ').length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const publishedAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

    try {
      await sb.from('articles').insert({
        author_id: authorId,
        title: art.title,
        slug,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: art.content }] }] },
        content_html: `<p>${art.content}</p>`,
        excerpt: art.excerpt,
        category_id: catId,
        tags: JSON.stringify(art.tags),
        status: 'published',
        reading_time_minutes: readingTime,
        word_count: wordCount,
        view_count: Math.floor(Math.random() * 5000) + 50,
        like_count: Math.floor(Math.random() * 200) + 5,
        comment_count: Math.floor(Math.random() * 30) + 1,
        share_count: Math.floor(Math.random() * 100) + 2,
        is_featured: Math.random() < 0.3,
        published_at: publishedAt,
      });
      articleCount++;
      console.log(`  📄 ${art.title.slice(0, 50)}...`);
    } catch (e: any) {
      if (!e.message?.includes('duplicate')) console.log(`  ❌ ${art.title}: ${e.message?.slice(0, 80)}`);
    }
  }

  console.log(`\nCreated ${articleCount} articles`);

  // 5. Create comments for some articles
  const { data: articleIds } = await sb.from('articles').select('id').limit(5);
  const { data: readerUser } = await sb.from('users').select('id').eq('email', 'reader@demo.com').maybeSingle();
  const readerId = readerUser?.id || authorId;

  if (articleIds) {
    const comments = [
      'This is exactly the kind of reporting we need more of. Great insights!',
      'Interesting perspective, but I think there\'s more to consider regarding the economic factors.',
      'Thanks for shedding light on this topic. Very well researched.',
      'I shared this with my colleagues — everyone found it valuable.',
      'Would love to see a follow-up on this with more data points.',
    ];
    for (const article of articleIds) {
      for (const comment of comments.slice(0, 2)) {
        try { await sb.from('comments').insert({
          article_id: article.id,
          user_id: readerId,
          content: comment,
        }); } catch {}
      }
    }
    console.log('✅ Comments added');
  }

  // 6. Create some security events for the admin dashboard
  const events = ['user_login', 'article_published', 'user_registered', 'author_application_approved', 'profile_updated'];
  for (const eventType of events) {
    try { await sb.from('security_events').insert({
      user_id: authorId, event_type: eventType, metadata: { source: 'seed' },
    }); } catch {}
  }
  console.log('✅ Security events added');

  // 7. Create sample earnings/payouts
  const articleCountResult = await sb.from('articles').select('id').limit(1);
  const sampleArticleId = articleCountResult.data?.[0]?.id;
  if (sampleArticleId) {
    try { await sb.from('earnings').insert({
      author_id: authorId, article_id: sampleArticleId, amount_usd: 1250.00,
      source: 'article_revenue',
      period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      period_end: new Date().toISOString(),
    }); } catch {}
  }
  try { await sb.from('payouts').insert({
    author_id: authorId, amount_usd: 500.00, amount_kes: 65000.00,
    exchange_rate: 130.00, fee_usd: 5.00, mpesa_phone: '+254712345678',
    status: 'completed',
    processed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  }); } catch {}
  console.log('✅ Earnings & payouts added');

  console.log(`\n🎉 Mock data seeding complete!`);
  console.log(`   ${articleCount} articles · ${CATEGORIES.length} categories · comments · events`);
}

main().catch(console.error);
