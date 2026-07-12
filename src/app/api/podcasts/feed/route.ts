import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': '026Newsblog Podcast Client/1.0' },
});

const OPEN_SOURCE_PODCAST_FEEDS = [
  {
    id: 'changelog',
    title: 'Changelog',
    url: 'https://changelog.com/podcast/feed.xml',
    category: 'Technology',
    image: 'https://changelog.com/images/podcast-cover.jpg',
  },
  {
    id: 'software-engineering-daily',
    title: 'Software Engineering Daily',
    url: 'https://softwareengineeringdaily.com/feed/podcast/',
    category: 'Technology',
    image: 'https://softwareengineeringdaily.com/wp-content/uploads/2023/01/sed-cover.jpg',
  },
  {
    id: 'talk-python',
    title: 'Talk Python To Me',
    url: 'https://talkpython.fm/episodes/rss',
    category: 'Technology',
    image: 'https://talkpython.fm/static/images/logo.png',
  },
  {
    id: 'python-bytes',
    title: 'Python Bytes',
    url: 'https://pythonbytes.fm/episodes/rss',
    category: 'Technology',
    image: 'https://pythonbytes.fm/static/img/logo.png',
  },
  {
    id: 'syntax',
    title: 'Syntax',
    url: 'https://syntax.fm/rss.xml',
    category: 'Technology',
    image: 'https://syntax.fm/images/logo.png',
  },
  {
    id: 'coding-blocks',
    title: 'Coding Blocks',
    url: 'https://www.codingblocks.net/feed/podcast/',
    category: 'Technology',
    image: 'https://www.codingblocks.net/wp-content/uploads/2020/01/cb-logo.png',
  },
  {
    id: 'hanselminutes',
    title: 'Hanselminutes',
    url: 'https://hanselminutes.com/feed/',
    category: 'Technology',
    image: 'https://hanselminutes.com/images/logo.png',
  },
  {
    id: 'devnews',
    title: 'DevNews',
    url: 'https://devnews.fm/rss',
    category: 'Technology',
    image: 'https://devnews.fm/images/logo.png',
  },
];

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  pubDate: string;
  duration: string;
  podcastTitle: string;
  podcastImage: string;
  link: string;
}

export async function GET() {
  const allEpisodes: PodcastEpisode[] = [];

  await Promise.all(
    OPEN_SOURCE_PODCAST_FEEDS.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed.url);
        const episodes = feedData.items.slice(0, 5).map((item) => {
          const audioUrl = item.enclosure?.url || item.link || '';
          const link = item.link || '';
          const duration = item.itunes?.duration || '00:00:00';
          return {
            id: `${feed.id}-${item.guid || item.link}`,
            title: item.title || 'Untitled Episode',
            description: item.contentSnippet || item.content || '',
            audioUrl,
            imageUrl: item.itunes?.image || feed.image,
            pubDate: item.pubDate || new Date().toISOString(),
            duration,
            podcastTitle: feed.title,
            podcastImage: feed.image,
            link,
          };
        });
        allEpisodes.push(...episodes);
      } catch (error) {
        console.error(`Failed to fetch ${feed.title}:`, error);
      }
    })
  );

  allEpisodes.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return NextResponse.json({ episodes: allEpisodes.slice(0, 30) });
}