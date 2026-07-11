'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Heart, Bookmark, Share2 } from 'lucide-react';

interface ArticleActionsProps {
  articleId: string;
  slug: string;
  initialLiked?: boolean;
  initialSaved?: boolean;
  likeCount?: number;
}

export function ArticleActions({
  articleId,
  slug,
  initialLiked = false,
  initialSaved = false,
  likeCount = 0,
}: ArticleActionsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(initialLiked);
  const [saved, setSaved] = useState(initialSaved);
  const [likes, setLikes] = useState(likeCount);

  const toggleLike = async () => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    const method = liked ? 'DELETE' : 'POST';
    const res = await fetch(`/api/articles/${articleId}/like`, { method });
    if (res.ok) {
      setLiked(!liked);
      setLikes((n) => (liked ? n - 1 : n + 1));
    }
  };

  const toggleSave = async () => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    const method = saved ? 'DELETE' : 'POST';
    const res = await fetch(`/api/articles/${articleId}/save`, { method });
    if (res.ok) setSaved(!saved);
  };

  const share = async () => {
    const url = `${window.location.origin}/article/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={liked ? 'primary' : 'outline'}
        size="sm"
        onClick={toggleLike}
        className="gap-1.5"
      >
        <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
        {likes}
      </Button>
      <Button variant={saved ? 'primary' : 'outline'} size="sm" onClick={toggleSave}>
        <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
      </Button>
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
