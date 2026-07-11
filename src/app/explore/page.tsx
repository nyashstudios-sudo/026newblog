import { Suspense } from 'react';
import ExploreContent from './explore-content';

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><span className="loading-dots">Loading</span></div>}>
      <ExploreContent />
    </Suspense>
  );
}
