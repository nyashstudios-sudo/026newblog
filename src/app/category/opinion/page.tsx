import { Metadata } from 'next';
import { CategoryHero, CategoryGrid } from '@/components/category/CategoryPage';
import OpinionContent from './OpinionContent';

export const metadata: Metadata = {
  title: 'Opinion & Editorials | 026Newsblog - African Perspectives on Technology, Business & Culture',
  description: 'Thought-provoking op-eds, editorials, and perspectives from leading African voices on technology, business, politics, culture, and society. Explore diverse viewpoints on the issues shaping East Africa and the continent.',
  keywords: ['opinion', 'editorials', 'African perspectives', 'op-eds', 'thought leadership', 'commentary', 'East Africa', 'Kenya', 'African voices', 'technology ethics', 'business opinion', 'culture commentary'],
  openGraph: {
    title: 'Opinion & Editorials | 026Newsblog',
    description: 'Thought-provoking op-eds and perspectives from leading African voices on the issues shaping our continent.',
    type: 'website',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&h=630&fit=crop',
        width: 1200,
        height: 630,
        alt: '026Newsblog Opinion Section',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Opinion & Editorials | 026Newsblog',
    description: 'Thought-provoking op-eds and perspectives from leading African voices.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function OpinionPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <CategoryHero slug="opinion" />
      
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <CategoryGrid slug="opinion" />
      </section>

      <OpinionContent />
    </div>
  );
}