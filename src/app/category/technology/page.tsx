'use client';

import { CategoryHero, CategoryGrid } from '@/components/category/CategoryPage';

export default function TechnologyPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <CategoryHero slug="technology" />
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <CategoryGrid slug="technology" />
      </section>
    </div>
  );
}