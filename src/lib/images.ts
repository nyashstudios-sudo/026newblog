export async function extractImageFromUrl(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    
    const res = await fetch(url, {
      headers: { 'User-Agent': '026Newsblog/1.0 (+https://026newsblog.com)' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!res.ok) return null;
    const html = await res.text();
    
    // Try multiple meta tag patterns
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /<meta[^>]+name=["']image["'][^>]+content=["']([^"']+)["']/i,
      /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        let imgUrl = match[1];
        // Resolve relative URLs
        if (imgUrl.startsWith('//')) imgUrl = 'https:' + imgUrl;
        else if (imgUrl.startsWith('/')) {
          const base = new URL(url).origin;
          imgUrl = base + imgUrl;
        }
        // Validate it's an image URL
        if (/\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(imgUrl)) {
          return imgUrl;
        }
        // If no extension but looks like image URL, accept it
        if (imgUrl.includes('images') || imgUrl.includes('img') || imgUrl.includes('cdn')) {
          return imgUrl;
        }
      }
    }
    
    // Fallback: find first large image in content
    const imgMatches = html.match(/<img[^>]+src=["']([^"']+)["']/gi);
    if (imgMatches) {
      for (const img of imgMatches) {
        const srcMatch = img.match(/src=["']([^"']+)["']/i);
        if (srcMatch?.[1]) {
          let src = srcMatch[1];
          if (src.startsWith('//')) src = 'https:' + src;
          else if (src.startsWith('/')) src = new URL(url).origin + src;
          // Skip tiny images, icons, tracking pixels
          if (!/(icon|logo|avatar|pixel|tracking|analytics|1x1|spacer)/i.test(src)) {
            return src;
          }
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

export async function extractImagesFromRssItem(item: any): Promise<{ cover: string | null; images: string[] }> {
  const images: string[] = [];
  
  // Check common RSS image fields
  const possibleUrls = [
    item['media:content']?.$?.url,
    item['media:thumbnail']?.$?.url,
    item['itunes:image']?.href,
    item.enclosure?.url,
    item.image?.url,
    item.image?.href,
  ].filter(Boolean);
  
  for (const url of possibleUrls) {
    if (typeof url === 'string' && isValidImageUrl(url)) {
      images.push(url);
    }
  }
  
  // Check content for images
  const content = item.content || item['content:encoded'] || item.description || '';
  const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi);
  if (imgMatches) {
    for (const img of imgMatches) {
      const srcMatch = img.match(/src=["']([^"']+)["']/i);
      if (srcMatch?.[1] && isValidImageUrl(srcMatch[1])) {
        images.push(srcMatch[1]);
      }
    }
  }
  
  // Deduplicate
  const unique = [...new Set(images)];
  return { cover: unique[0] || null, images: unique };
}

function isValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    return /\.(jpe?g|png|webp|gif|avif|svg)(\?|$)/i.test(path) || 
           u.hostname.includes('images') || 
           u.hostname.includes('cdn') ||
           u.hostname.includes('img');
  } catch {
    return false;
  }
}

// Helper to get best image for an article
export async function getBestArticleImage(articleUrl: string, rssItem?: any): Promise<string | null> {
  // 1. Try RSS item images first
  if (rssItem) {
    const { cover } = await extractImagesFromRssItem(rssItem);
    if (cover) return cover;
  }
  
  // 2. Fetch from article URL
  return await extractImageFromUrl(articleUrl);
}