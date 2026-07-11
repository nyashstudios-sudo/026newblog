import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore',
  description: 'Search articles, topics, and authors. Discover trending stories and new perspectives from 026Newsblog.',
  openGraph: {
    title: 'Explore — 026Newsblog',
    description: 'Search and discover articles, topics, and authors.',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
