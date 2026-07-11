import Parser from 'rss-parser';
import { db } from './db';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': '026Newsblog RSS Reader/1.0' },
});

export async function fetchRssFeed(feedId: string) {
  const feed = await db.rssFeed.findUnique({ where: { id: feedId } });
  if (!feed || feed.status !== 'active') return { imported: 0 };

  try {
    const parsed = await parser.parseURL(feed.url);
    let imported = 0;

    for (const item of parsed.items.slice(0, 20)) {
      if (!item.guid && !item.link) continue;
      const guid = item.guid || item.link!;

      try {
        await db.rssItem.create({
          data: {
            feedId: feed.id,
            guid,
            title: item.title || 'Untitled',
            url: item.link || '',
            description: item.contentSnippet || item.content?.slice(0, 500),
            author: item.creator || parsed.title,
            publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
          },
        });
        imported++;
      } catch {
        // Duplicate guid — skip
      }
    }

    await db.rssFeed.update({
      where: { id: feedId },
      data: {
        lastFetchedAt: new Date(),
        itemsToday: { increment: imported },
        totalItemsImported: { increment: imported },
        lastError: null,
      },
    });

    return { imported };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await db.rssFeed.update({
      where: { id: feedId },
      data: { lastError: message, status: 'error' },
    });
    return { imported: 0, error: message };
  }
}

export async function refreshAllFeeds() {
  const feeds = await db.rssFeed.findMany({ where: { status: 'active' } });
  const results = await Promise.allSettled(feeds.map((f) => fetchRssFeed(f.id)));
  return results;
}

export async function getRecentRssItems(limit = 10) {
  return db.rssItem.findMany({
    orderBy: { importedAt: 'desc' },
    take: limit,
    include: {
      feed: { select: { name: true, category: { select: { name: true, slug: true } } } },
    },
  });
}
