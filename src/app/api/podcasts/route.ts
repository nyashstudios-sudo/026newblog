import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': '026Newsblog Podcast Fetcher/1.0' },
});

const OPEN_SOURCE_PODCASTS = [
  {
    id: 'software-engineering-daily',
    title: 'Software Engineering Daily',
    sourceUrl: 'https://softwareengineeringdaily.com/feed/podcast/',
    category: 'Technology',
    image: 'https://softwareengineeringdaily.com/wp-content/uploads/2023/01/sed-logo-300x300.png',
  },
  {
    id: 'changelog',
    title: 'The Changelog',
    sourceUrl: 'https://changelog.com/podcast/feed.xml',
    category: 'Technology',
    image: 'https://changelog.com/assets/images/logo.png',
  },
  {
    id: 'syntax',
    title: 'Syntax',
    sourceUrl: 'https://syntax.fm/rss.xml',
    category: 'Technology',
    image: 'https://syntax.fm/images/logo.png',
  },
  {
    id: 'coding-blocks',
    title: 'Coding Blocks',
    sourceUrl: 'https://www.codingblocks.net/feed/podcast/',
    category: 'Technology',
    image: 'https://www.codingblocks.net/wp-content/uploads/2023/01/coding-blocks-logo.png',
  },
  {
    id: 'front-end-happy-hour',
    title: 'Front End Happy Hour',
    sourceUrl: 'https://frontendhappyhour.com/feed.xml',
    category: 'Technology',
    image: 'https://frontendhappyhour.com/images/logo.png',
  },
  {
    id: 'shop-talk',
    title: 'ShopTalk Show',
    sourceUrl: 'https://shoptalkshow.com/feed/podcast/',
    category: 'Technology',
    image: 'https://shoptalkshow.com/images/logo.png',
  },
  {
    id: 'developer-tea',
    title: 'Developer Tea',
    sourceUrl: 'https://developertea.com/feed.xml',
    category: 'Technology',
    image: 'https://developertea.com/images/logo.png',
  },
  {
    id: 'the-bike-shed',
    title: 'The Bike Shed',
    sourceUrl: 'https://bikeshed.fm/feed.xml',
    category: 'Technology',
    image: 'https://bikeshed.fm/images/logo.png',
  },
  {
    id: 'greater-than-code',
    title: 'Greater Than Code',
    sourceUrl: 'https://www.greaterthancode.com/feed.xml',
    category: 'Technology',
    image: 'https://www.greaterthancode.com/images/logo.png',
  },
  {
    id: 'command-line-heroes',
    title: 'Command Line Heroes',
    sourceUrl: 'https://commandlineheroes.com/feed/',
    category: 'Technology',
    image: 'https://commandlineheroes.com/images/logo.png',
  },
];

export async function GET() {
  const allEpisodes: any[] = [];

  const fetchPromises = OPEN_SOURCE_PODCASTS.map(async (podcast) => {
    try {
      const feed = await parser.parseURL(podcast.sourceUrl);
      const episodes = (feed.items || []).slice(0, 5).map((item: any, index: number) => {
        const audioUrl = item.enclosure?.url || 
          item['media:content']?.$?.url || 
          item['itunes:media']?.$?.url ||
          item.links?.find((l: any) => l.type?.startsWith('audio/'))?.href ||
          item.link;

        const duration = item['itunes:duration'] || item.enclosure?.duration || 0;

        return {
          id: `${podcast.id}-${index}-${item.guid || item.link}`,
          title: item.title || 'Untitled Episode',
          slug: item.guid || item.link,
          authorName: feed.title || podcast.title,
          categoryName: podcast.category,
          durationSeconds: parseDuration(duration),
          audioUrl,
          coverImageUrl: item['itunes:image']?.href || podcast.image || feed.image?.url,
          sourceUrl: item.link,
          pubDate: item.pubDate,
          podcastTitle: podcast.title,
        };
      });
      allEpisodes.push(...episodes);
    } catch (error) {
      console.error(`Failed to fetch ${podcast.title}:`, error);
    }
  });

  await Promise.all(fetchPromises);

  allEpisodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({ episodes: allEpisodes.slice(0, 50) });
}

function parseDuration(duration: any): number {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;
  const parts = String(duration).split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(String(duration), 10) || 0;
}