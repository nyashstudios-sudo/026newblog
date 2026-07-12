import { Metadata } from 'next';
import { CategoryHero, CategoryGrid } from '@/components/category/CategoryPage';

export const metadata: Metadata = {
  title: 'Culture | 026Newsblog',
  description: 'Afrofuturism, music, arts, lifestyle, and the creative voices redefining African identity on the global stage. Explore African culture through journalism.',
  keywords: ['culture', 'Afrofuturism', 'African music', 'arts', 'lifestyle', 'creative', 'African identity', 'Nollywood', 'Afrobeats', 'fashion', 'literature'],
  openGraph: {
    title: 'Culture | 026Newsblog',
    description: 'Afrofuturism, music, arts, and the creative voices redefining African identity.',
    type: 'website',
  },
};

export default function CulturePage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <CategoryHero slug="culture" />
      
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <CategoryGrid slug="culture" />
      </section>
    </div>
  );
}