import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse articles by category — Technology, Business, Science, Health, Entertainment, Sports and more.',
  openGraph: {
    title: 'Categories — 026Newsblog',
    description: 'Browse articles by category from 026Newsblog.',
  },
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
