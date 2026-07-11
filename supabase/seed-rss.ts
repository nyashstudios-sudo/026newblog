import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!);

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', description: 'Latest tech news, AI, gadgets, and innovation', icon: 'cpu' },
  { name: 'Science', slug: 'science', description: 'Scientific discoveries, research, and space exploration', icon: 'flask-conical' },
  { name: 'Business', slug: 'business', description: 'Finance, markets, startups, and economic trends', icon: 'briefcase' },
  { name: 'World', slug: 'world', description: 'International news, politics, and global affairs', icon: 'globe' },
  { name: 'Health', slug: 'health', description: 'Medical news, wellness, fitness, and healthcare', icon: 'heart-pulse' },
  { name: 'Education', slug: 'education', description: 'Learning resources, courses, and academic insights', icon: 'graduation-cap' },
  { name: 'Self Improvement', slug: 'self-improvement', description: 'Productivity, habits, mindset, and personal growth', icon: 'sparkles' },
  { name: 'Culture', slug: 'culture', description: 'Arts, entertainment, books, and cultural commentary', icon: 'book-open' },
  { name: 'Sports', slug: 'sports', description: 'Sports news, scores, and athlete stories', icon: 'trophy' },
];

const FEEDS: { name: string; url: string; categorySlug: string; refreshMinutes: number }[] = [
  // Technology
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', categorySlug: 'technology', refreshMinutes: 180 },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', categorySlug: 'technology', refreshMinutes: 180 },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', categorySlug: 'technology', refreshMinutes: 180 },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', categorySlug: 'technology', refreshMinutes: 180 },
  { name: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', categorySlug: 'technology', refreshMinutes: 180 },
  { name: 'Engadget', url: 'https://www.engadget.com/rss.xml', categorySlug: 'technology', refreshMinutes: 180 },
  { name: 'Hacker News', url: 'https://hnrss.org/frontpage', categorySlug: 'technology', refreshMinutes: 120 },
  { name: 'AI News (OpenAI)', url: 'https://openai.com/blog/rss.xml', categorySlug: 'technology', refreshMinutes: 1440 },

  // Science
  { name: 'Scientific American', url: 'https://www.scientificamerican.com/feed/rss/', categorySlug: 'science', refreshMinutes: 360 },
  { name: 'Nature', url: 'https://www.nature.com/nature.rss', categorySlug: 'science', refreshMinutes: 360 },
  { name: 'Space.com', url: 'https://www.space.com/feeds/all', categorySlug: 'science', refreshMinutes: 180 },
  { name: 'New Scientist', url: 'https://www.newscientist.com/feed/home/', categorySlug: 'science', refreshMinutes: 360 },
  { name: 'NASA News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', categorySlug: 'science', refreshMinutes: 360 },
  { name: 'Physics World', url: 'https://physicsworld.com/feed/', categorySlug: 'science', refreshMinutes: 720 },

  // Business
  { name: 'Harvard Business Review', url: 'https://hbr.org/rss.xml', categorySlug: 'business', refreshMinutes: 720 },
  { name: 'Bloomberg', url: 'https://feeds.bloomberg.com/markets/news.rss', categorySlug: 'business', refreshMinutes: 120 },
  { name: 'Financial Times', url: 'https://www.ft.com/rss/home', categorySlug: 'business', refreshMinutes: 180 },
  { name: 'Wall Street Journal', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml', categorySlug: 'business', refreshMinutes: 180 },
  { name: 'The Economist', url: 'https://www.economist.com/finance-and-economics/rss.xml', categorySlug: 'business', refreshMinutes: 720 },
  { name: 'TechCrunch Startups', url: 'https://techcrunch.com/startups/feed/', categorySlug: 'business', refreshMinutes: 180 },

  // World
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', categorySlug: 'world', refreshMinutes: 120 },
  { name: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews', categorySlug: 'world', refreshMinutes: 120 },
  { name: 'The Guardian World', url: 'https://www.theguardian.com/world/rss', categorySlug: 'world', refreshMinutes: 120 },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', categorySlug: 'world', refreshMinutes: 120 },
  { name: 'Associated Press', url: 'https://apnews.com/rss/apf-topnews', categorySlug: 'world', refreshMinutes: 120 },

  // Health
  { name: 'Healthline', url: 'https://www.healthline.com/health-news/feed', categorySlug: 'health', refreshMinutes: 360 },
  { name: 'Medical News Today', url: 'https://www.medicalnewstoday.com/rss', categorySlug: 'health', refreshMinutes: 360 },
  { name: 'WebMD', url: 'https://rss.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC', categorySlug: 'health', refreshMinutes: 360 },
  { name: 'WHO News', url: 'https://www.who.int/rss-feeds/news-english.xml', categorySlug: 'health', refreshMinutes: 720 },

  // Education
  { name: 'TED Talks Daily', url: 'https://feeds.feedburner.com/tedtalks_video', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'Khan Academy Blog', url: 'https://blog.khanacademy.org/feed/', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'Harvard Business Review', url: 'https://hbr.org/rss.xml', categorySlug: 'education', refreshMinutes: 1440 },
  { name: 'MIT News', url: 'https://news.mit.edu/rss/topic/artificial-intelligence2', categorySlug: 'education', refreshMinutes: 360 },
  { name: 'Edutopia', url: 'https://www.edutopia.org/rss.xml', categorySlug: 'education', refreshMinutes: 720 },

  // Self Improvement
  { name: 'James Clear', url: 'https://jamesclear.com/feed', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Farnam Street', url: 'https://fs.blog/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Scott H Young', url: 'https://www.scotthyoung.com/blog/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'The Marginalian', url: 'https://www.themarginalian.org/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Psyche', url: 'https://psyche.co/feed.rss', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Zen Habits', url: 'https://zenhabits.net/feed/', categorySlug: 'self-improvement', refreshMinutes: 1440 },
  { name: 'Wait But Why', url: 'https://waitbutwhy.com/feed', categorySlug: 'self-improvement', refreshMinutes: 1440 },

  // Culture
  { name: 'The New Yorker', url: 'https://www.newyorker.com/feed/culture', categorySlug: 'culture', refreshMinutes: 360 },
  { name: 'Aeon', url: 'https://aeon.co/feed.rss', categorySlug: 'culture', refreshMinutes: 720 },
  { name: 'Brain Pickings', url: 'https://www.brainpickings.org/feed/', categorySlug: 'culture', refreshMinutes: 1440 },
  { name: 'Literary Hub', url: 'https://lithub.com/feed/', categorySlug: 'culture', refreshMinutes: 360 },
  { name: 'NPR Books', url: 'https://feeds.npr.org/1029/feed.rss', categorySlug: 'culture', refreshMinutes: 360 },

  // Sports
  { name: 'ESPN', url: 'https://www.espn.com/espn/rss/news', categorySlug: 'sports', refreshMinutes: 120 },
  { name: 'The Athletic', url: 'https://theathletic.com/feed/', categorySlug: 'sports', refreshMinutes: 180 },
  { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml', categorySlug: 'sports', refreshMinutes: 120 },
];

async function main() {
  console.log('🌱 Seeding RSS categories and feeds...\n');

  // 1. Create categories
  for (const cat of CATEGORIES) {
    const { data, error } = await sb
      .from('categories')
      .upsert({ name: cat.name, slug: cat.slug, description: cat.description, icon: cat.icon }, { onConflict: 'slug' })
      .select('id');
    
    if (error) console.error(`❌ Category '${cat.name}':`, error.message);
    else console.log(`✅ Category '${cat.name}' ${data?.[0] ? 'created/updated' : 'exists'}`);
  }

  // 2. Get all category IDs
  const { data: cats } = await sb.from('categories').select('slug, id').in('slug', CATEGORIES.map(c => c.slug));
  const catMap = Object.fromEntries((cats || []).map(c => [c.slug, c.id]));
  console.log('\n📋 Category map:', catMap);

  // 3. Insert feeds
  for (const feed of FEEDS) {
    const catId = catMap[feed.categorySlug];
    if (!catId) { console.log(`⚠️  No category for ${feed.name} (slug: ${feed.categorySlug})`); continue; }
    
    const { data, error } = await sb
      .from('rss_feeds')
      .upsert({ 
        name: feed.name, 
        url: feed.url, 
        category_id: catId, 
        refresh_interval_minutes: feed.refreshMinutes, 
        status: 'active' 
      }, { onConflict: 'url' })
      .select('id');
    
    if (error) console.log(`⚠️  Feed '${feed.name}': ${error.message}`);
    else console.log(`✅ Feed '${feed.name}' ${data?.[0] ? 'added' : 'exists'}`);
  }

  console.log('\n✅ Done!');
}

main().catch(console.error);