import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import path from 'path';
import bcrypt from 'bcryptjs';

const dbPath = path.resolve(process.cwd(), 'dev.db');
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const db = new PrismaClient({ adapter });

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', description: 'Latest in tech, AI, and digital innovation', icon: '💻' },
  { name: 'Business', slug: 'business', description: 'Markets, finance, and entrepreneurship', icon: '📈' },
  { name: 'Science', slug: 'science', description: 'Discoveries, research, and scientific breakthroughs', icon: '🔬' },
  { name: 'Health', slug: 'health', description: 'Wellness, medicine, and healthy living', icon: '🏥' },
  { name: 'Entertainment', slug: 'entertainment', description: 'Movies, music, games, and culture', icon: '🎬' },
  { name: 'Sports', slug: 'sports', description: 'Athletics, leagues, and sporting news', icon: '⚽' },
];

const USERS = [
  {
    email: 'admin@026news.com',
    password: 'admin123!',
    firstName: 'Platform',
    lastName: 'Admin',
    username: 'admin',
    role: 'admin' as const,
    bio: 'Platform administrator for 026News Blog.',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'jdoe@example.com',
    password: 'author123!',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    role: 'author' as const,
    bio: 'Senior tech journalist covering AI and startups.',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'sarah@example.com',
    password: 'author123!',
    firstName: 'Sarah',
    lastName: 'Chen',
    username: 'sarahchen',
    role: 'author' as const,
    bio: 'Science writer and health enthusiast.',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'mike@example.com',
    password: 'author123!',
    firstName: 'Mike',
    lastName: 'Johnson',
    username: 'mikejohnson',
    role: 'author' as const,
    bio: 'Business and finance reporter.',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'emma@example.com',
    password: 'author123!',
    firstName: 'Emma',
    lastName: 'Williams',
    username: 'emmawilliams',
    role: 'author' as const,
    bio: 'Entertainment and pop culture journalist.',
    isActive: true,
    isVerified: true,
  },
  {
    email: 'reader1@example.com',
    password: 'reader123!',
    firstName: 'Alex',
    lastName: 'Reader',
    username: 'alexreader',
    role: 'reader' as const,
    bio: 'Avid news reader.',
    isActive: true,
    isVerified: false,
  },
];

const ARTICLES_DATA = [
  {
    authorIdx: 1,
    categoryIdx: 0,
    title: 'The Rise of AI-Powered Development Tools',
    subtitle: 'How machine learning is transforming software engineering workflows',
    excerpt: 'AI coding assistants are reshaping how developers write, review, and debug code. Here\'s what the future holds.',
    coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=630&fit=crop',
    html: '<p>Artificial intelligence is no longer a futuristic concept — it\'s here, and it\'s transforming the way developers write code. From GitHub Copilot to ChatGPT-powered IDEs, AI-assisted development has become mainstream.</p><p>Recent studies show that developers using AI coding tools are 55% more productive on average. These tools excel at boilerplate code generation, test writing, and even complex refactoring tasks.</p><p>However, concerns about code quality and security remain. Experts recommend treating AI suggestions as a starting point, not a final product. Code review remains essential.</p><p>Looking ahead, we can expect AI to handle increasingly sophisticated tasks, potentially reshaping the role of software engineers entirely.</p>',
    tags: ['AI', 'Software Development', 'Machine Learning', 'Technology'],
    isFeatured: true,
    viewCount: 15230,
    likeCount: 342,
    commentCount: 28,
    readingTimeMinutes: 5,
  },
  {
    authorIdx: 1,
    categoryIdx: 0,
    title: 'Next.js 16: What\'s New in the React Framework',
    subtitle: 'A deep dive into the latest features and improvements',
    excerpt: 'The latest version brings significant performance gains and developer experience improvements.',
    coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=630&fit=crop',
    html: '<p>Next.js 16 has arrived with a host of new features that promise to streamline development and improve performance. The React team has been working closely with Vercel to push the boundaries of what\'s possible.</p><p>Key highlights include improved React Server Components, faster builds with Turbopack, and enhanced streaming SSR capabilities. The new version also introduces simplified data fetching patterns.</p><p>Developers migrating from Next.js 15 will find the upgrade process straightforward, though some APIs have been deprecated. The team has provided comprehensive migration guides.</p><p>Early benchmarks show a 40% improvement in build times and 30% faster page loads for typical applications.</p>',
    tags: ['Next.js', 'React', 'Web Development', 'JavaScript'],
    isFeatured: true,
    viewCount: 23100,
    likeCount: 567,
    commentCount: 45,
    readingTimeMinutes: 6,
  },
  {
    authorIdx: 2,
    categoryIdx: 2,
    title: 'Breakthrough in Quantum Computing: 1000-Qubit Processor',
    subtitle: 'New milestone brings practical quantum computers closer to reality',
    excerpt: 'Scientists have achieved a major breakthrough with a 1000-qubit quantum processor, opening new possibilities in computing.',
    coverImageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=630&fit=crop',
    html: '<p>A team of researchers has successfully demonstrated a 1000-qubit quantum processor, tripling the previous record. This milestone represents a significant step toward practical quantum computing.</p><p>The processor maintains coherence times of over 100 microseconds, allowing for complex quantum algorithms to run reliably. Applications in drug discovery, cryptography, and climate modeling are now within reach.</p><p>Industry experts predict that within five years, quantum computers could solve problems that are currently intractable for classical computers. Financial institutions are already exploring quantum algorithms for portfolio optimization.</p>',
    tags: ['Quantum Computing', 'Science', 'Technology', 'Research'],
    isFeatured: true,
    viewCount: 8900,
    likeCount: 234,
    commentCount: 19,
    readingTimeMinutes: 4,
  },
  {
    authorIdx: 2,
    categoryIdx: 3,
    title: 'New Study Reveals Benefits of Intermittent Fasting',
    subtitle: 'Research shows significant health improvements with time-restricted eating',
    excerpt: 'A comprehensive study on intermittent fasting reveals promising results for metabolic health and longevity.',
    coverImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=630&fit=crop',
    html: '<p>Intermittent fasting continues to gain scientific backing. A new study published in the New England Journal of Medicine followed 500 participants over 12 months and found remarkable health improvements.</p><p>Participants who practiced 16:8 intermittent fasting (16 hours fasting, 8 hours eating window) showed significant improvements in insulin sensitivity, reduced inflammation markers, and an average 8% reduction in body weight.</p><p>Importantly, the study found that the benefits were independent of calorie restriction — suggesting that the timing of meals plays a crucial role in metabolic health.</p>',
    tags: ['Health', 'Fasting', 'Nutrition', 'Wellness'],
    isFeatured: false,
    viewCount: 12300,
    likeCount: 445,
    commentCount: 52,
    readingTimeMinutes: 5,
  },
  {
    authorIdx: 3,
    categoryIdx: 1,
    title: 'Global Markets Rally as Central Banks Signal Rate Pause',
    subtitle: 'Stock markets surge following Federal Reserve announcement',
    excerpt: 'Major indices hit new highs as central banks indicate a pause in interest rate hikes.',
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop',
    html: '<p>Global financial markets experienced a significant rally today after the Federal Reserve signaled it would pause its interest rate hiking cycle. The S&P 500 gained 2.3%, while European and Asian markets also saw substantial gains.</p><p>The decision comes as inflation数据显示 signs of cooling, with core CPI dropping to 3.2% — its lowest level in over two years. Bond yields fell sharply, providing further support for equity markets.</p><p>Analysts caution that the rally may be premature, as inflation remains above the Fed\'s 2% target. However, the market sentiment has clearly shifted toward optimism.</p>',
    tags: ['Markets', 'Economy', 'Finance', 'Investing'],
    isFeatured: false,
    viewCount: 18900,
    likeCount: 312,
    commentCount: 36,
    readingTimeMinutes: 4,
  },
  {
    authorIdx: 3,
    categoryIdx: 1,
    title: 'The Startup Boom in African Tech Ecosystems',
    subtitle: 'Venture capital flowing into African startups at record levels',
    excerpt: 'African tech startups raised a record $6.5 billion this year, led by fintech and logistics companies.',
    coverImageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200&h=630&fit=crop',
    html: '<p>Africa\'s technology ecosystem is experiencing unprecedented growth. Startups across the continent raised $6.5 billion in funding this year, a 35% increase from the previous year. Fintech continues to dominate, accounting for over 60% of total investment.</p><p>Nigeria, Kenya, South Africa, and Egypt remain the top destinations for venture capital, but emerging hubs in Ghana, Rwanda, and Senegal are gaining traction. The rise of remote work has also enabled African talent to access global opportunities.</p><p>Key sectors attracting investment include mobile payments, agricultural technology, health tech, and logistics. Companies like Flutterwave, M-Pesa, and Andela have become global success stories.</p>',
    tags: ['Startups', 'Africa', 'Fintech', 'Venture Capital'],
    isFeatured: false,
    viewCount: 6700,
    likeCount: 156,
    commentCount: 14,
    readingTimeMinutes: 5,
  },
  {
    authorIdx: 4,
    categoryIdx: 4,
    title: 'Streaming Wars: New Platforms Reshape Entertainment',
    subtitle: 'How the streaming landscape is evolving with new entrants',
    excerpt: 'The streaming industry is undergoing a major transformation as new players enter the market.',
    coverImageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&h=630&fit=crop',
    html: '<p>The streaming landscape is more competitive than ever. With the entry of new platforms and the consolidation of existing ones, consumers are faced with an unprecedented array of choices — and rising costs.</p><p>Netflix, Disney+, and Amazon Prime remain the market leaders, but newer entrants like Apple TV+, Paramount+, and Peacock are gaining ground. The trend toward ad-supported tiers is reshaping pricing strategies across the industry.</p><p>Original content remains the key differentiator. Streaming platforms are projected to spend over $230 billion on content in 2025, with big-budget productions becoming the norm.</p>',
    tags: ['Streaming', 'Entertainment', 'Media', 'TV'],
    isFeatured: false,
    viewCount: 10400,
    likeCount: 289,
    commentCount: 31,
    readingTimeMinutes: 4,
  },
  {
    authorIdx: 4,
    categoryIdx: 5,
    title: 'World Cup 2026: Host Cities and Stadiums Announced',
    subtitle: '16 cities across three nations will host the expanded tournament',
    excerpt: 'The 2026 FIFA World Cup will feature 48 teams across 16 host cities in the US, Canada, and Mexico.',
    coverImageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=630&fit=crop',
    html: '<p>FIFA has officially announced the 16 host cities for the 2026 World Cup, which will be jointly hosted by the United States, Canada, and Mexico. The tournament will feature 48 teams for the first time, a significant expansion from the current 32-team format.</p><p>Key host cities include Los Angeles, New York/New Jersey, Dallas, and Mexico City. The final will be held at MetLife Stadium in New Jersey. Canada will host matches in Toronto and Vancouver.</p><p>The expanded format means 104 matches will be played over 39 days, making it the largest World Cup in history. Organizers expect over 5 million tickets to be sold.</p>',
    tags: ['World Cup', 'Soccer', 'Sports', 'FIFA'],
    isFeatured: false,
    viewCount: 25600,
    likeCount: 678,
    commentCount: 89,
    readingTimeMinutes: 5,
  },
  {
    authorIdx: 2,
    categoryIdx: 3,
    title: 'Mental Health in the Digital Age: A Comprehensive Guide',
    subtitle: 'Strategies for maintaining well-being in an always-connected world',
    excerpt: 'Expert advice on managing screen time, digital detox, and maintaining mental health.',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=630&fit=crop',
    html: '<p>In an era of constant connectivity, maintaining mental health has become increasingly challenging. Studies show that the average person spends over 6 hours per day on digital devices, with significant impacts on sleep, anxiety levels, and social interactions.</p><p>Mental health professionals recommend establishing clear boundaries: designating tech-free hours, using grayscale mode to reduce screen appeal, and practicing mindful social media consumption. Digital detox retreats have grown 300% in popularity over the past three years.</p><p>The key is not to eliminate technology but to develop a healthier relationship with it.</p>',
    tags: ['Mental Health', 'Wellness', 'Digital Detox', 'Health'],
    isFeatured: false,
    viewCount: 18700,
    likeCount: 523,
    commentCount: 47,
    readingTimeMinutes: 5,
  },
  {
    authorIdx: 1,
    categoryIdx: 0,
    title: 'Understanding Blockchain Beyond Cryptocurrency',
    subtitle: 'Enterprise blockchain applications are transforming supply chains and finance',
    excerpt: 'Blockchain technology finds practical applications in supply chain management, healthcare, and voting systems.',
    coverImageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop',
    html: '<p>While blockchain is most commonly associated with cryptocurrencies, its potential extends far beyond digital currencies. Enterprises across industries are exploring blockchain for supply chain transparency, secure data sharing, and decentralized identity management.</p><p>Major companies including Walmart, IBM, and Maersk have implemented blockchain solutions that track products from source to shelf. In healthcare, blockchain enables secure patient data sharing across providers while maintaining privacy.</p><p>The global blockchain market is expected to reach $163 billion by 2027, driven by enterprise adoption and government initiatives.</p>',
    tags: ['Blockchain', 'Enterprise', 'Technology', 'Supply Chain'],
    isFeatured: false,
    viewCount: 9200,
    likeCount: 198,
    commentCount: 16,
    readingTimeMinutes: 4,
  },
];

const RSS_FEEDS = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    categoryIdx: 0,
    refreshIntervalMinutes: 30,
  },
  {
    name: 'BBC News - Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    categoryIdx: 0,
    refreshIntervalMinutes: 30,
  },
  {
    name: 'Reuters - Business',
    url: 'https://www.reutersagency.com/feed/',
    categoryIdx: 1,
    refreshIntervalMinutes: 60,
  },
  {
    name: 'NASA Breaking News',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    categoryIdx: 2,
    refreshIntervalMinutes: 60,
  },
  {
    name: 'WHO News',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    categoryIdx: 3,
    refreshIntervalMinutes: 60,
  },
  {
    name: 'Variety - Entertainment',
    url: 'https://variety.com/feed/',
    categoryIdx: 4,
    refreshIntervalMinutes: 60,
  },
  {
    name: 'ESPN - Sports',
    url: 'https://www.espn.com/espn/rss/news',
    categoryIdx: 5,
    refreshIntervalMinutes: 30,
  },
];

async function main() {
  console.log('Seeding database...\n');

  // Create categories (upsert for idempotency)
  const categoryMap = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryMap.set(c.slug, cat.id);
    console.log(`  Category: ${c.name}`);
  }

  // Create users (upsert for idempotency)
  const userMap = new Map<string, string>();
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await db.user.upsert({
      where: { email: u.email },
      update: {
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        bio: u.bio,
        isActive: u.isActive,
        isVerified: u.isVerified,
        lastLoginAt: new Date(),
      },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        username: u.username,
        role: u.role,
        bio: u.bio,
        isActive: u.isActive,
        isVerified: u.isVerified,
        lastLoginAt: new Date(),
      },
    });
    userMap.set(u.username, user.id);

    // Create author profiles for authors and admin
    if (u.role === 'author' || u.role === 'admin') {
      await db.authorProfile.upsert({
        where: { userId: user.id },
        update: { displayName: `${u.firstName} ${u.lastName}`, tagline: u.bio || '' },
        create: { userId: user.id, displayName: `${u.firstName} ${u.lastName}`, tagline: u.bio || '', topics: '["Technology", "Science", "Business"]' },
      });
    }

    // Notification prefs + reading streak + goals
    await db.notificationPreferences.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    await db.readingStreak.upsert({ where: { userId: user.id }, update: { currentStreak: 0 }, create: { userId: user.id, currentStreak: 0, longestStreak: 0 } });
    await db.readingGoals.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });

    console.log(`  User: ${u.username} (${u.role}) [password: ${u.password}]`);
  }

  // Create articles
  const allCatSlugs = CATEGORIES.map((c) => c.slug);
  const articleIds: string[] = [];
  for (const a of ARTICLES_DATA) {
    const authorId = userMap.get(USERS[a.authorIdx].username)!;
    const categoryId = categoryMap.get(allCatSlugs[a.categoryIdx])!;
    const slug = a.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.random().toString(36).slice(2, 6);

    const article = await db.article.upsert({
      where: { slug },
      update: {
        viewCount: BigInt(a.viewCount),
        likeCount: a.likeCount,
        commentCount: a.commentCount,
        isFeatured: a.isFeatured,
      },
      create: {
        authorId,
        title: a.title,
        subtitle: a.subtitle,
        slug,
        content: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: a.excerpt }] }] },
        contentHtml: a.html,
        excerpt: a.excerpt,
        coverImageUrl: a.coverImageUrl,
        categoryId,
        tags: JSON.stringify(a.tags),
        status: 'published',
        readingTimeMinutes: a.readingTimeMinutes,
        wordCount: a.html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length,
        viewCount: BigInt(a.viewCount),
        likeCount: a.likeCount,
        commentCount: a.commentCount,
        shareCount: Math.floor(a.likeCount * 0.3),
        isFeatured: a.isFeatured,
        publishedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      },
    });
    articleIds.push(article.id);
    console.log(`  Article: ${a.title}`);
  }

  // Create some comments
  const commentData = [
    { articleIdx: 0, authorIdx: 5, content: 'Great article! AI tools have really changed my workflow.' },
    { articleIdx: 0, authorIdx: 0, content: 'Agreed, but we need to be careful about over-reliance.' },
    { articleIdx: 1, authorIdx: 5, content: 'Next.js keeps getting better with each release.' },
    { articleIdx: 2, authorIdx: 5, content: 'Fascinating breakthrough! Can\'t wait to see where this goes.' },
    { articleIdx: 4, authorIdx: 5, content: 'This is great news for the economy.' },
    { articleIdx: 7, authorIdx: 5, content: 'So excited for the 2026 World Cup!' },
    { articleIdx: 3, authorIdx: 5, content: 'I\'ve been doing 16:8 for 6 months and feel amazing.' },
    { articleIdx: 8, authorIdx: 5, content: 'Digital detox really works. Highly recommend.' },
  ];
  for (const c of commentData) {
    await db.comment.create({
      data: {
        articleId: articleIds[c.articleIdx],
        userId: userMap.get(USERS[c.authorIdx].username)!,
        content: c.content,
        moderationStatus: 'approved',
      },
    });
  }
  console.log(`  ${commentData.length} comments`);

  // Create some likes
  for (let ai = 0; ai < articleIds.length; ai++) {
    for (let ui = 0; ui < Math.min(3, USERS.length); ui++) {
      await db.articleLike.create({
        data: {
          articleId: articleIds[ai],
          userId: userMap.get(USERS[ui].username)!,
        },
      }).catch(() => {});
    }
  }
  console.log('  Likes created');

  // Create RSS feeds
  for (const f of RSS_FEEDS) {
    await db.rssFeed.upsert({
      where: { url: f.url },
      update: { name: f.name, categoryId: categoryMap.get(allCatSlugs[f.categoryIdx])!, refreshIntervalMinutes: f.refreshIntervalMinutes, status: 'active' },
      create: {
        name: f.name,
        url: f.url,
        categoryId: categoryMap.get(allCatSlugs[f.categoryIdx])!,
        refreshIntervalMinutes: f.refreshIntervalMinutes,
        status: 'active',
        lastFetchedAt: new Date(),
      },
    });
    console.log(`  RSS Feed: ${f.name}`);
  }

  // Seed some platform settings
  await db.platformSetting.upsert({
    where: { key: 'site_name' },
    update: { value: JSON.stringify('026News Blog') },
    create: { key: 'site_name', value: JSON.stringify('026News Blog') },
  });
  await db.platformSetting.upsert({
    where: { key: 'site_description' },
    update: { value: JSON.stringify('Your trusted source for the latest news, analysis, and insights.') },
    create: { key: 'site_description', value: JSON.stringify('Your trusted source for the latest news, analysis, and insights.') },
  });

  console.log('\nSeed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:  admin@026news.com / admin123!');
  console.log('  Author: jdoe@example.com / author123!');
  console.log('  Author: sarah@example.com / author123!');
  console.log('  Author: mike@example.com / author123!');
  console.log('  Author: emma@example.com / author123!');
  console.log('  Reader: reader1@example.com / reader123!');
}

main()
  .then(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    db.$disconnect();
    process.exit(1);
  });
