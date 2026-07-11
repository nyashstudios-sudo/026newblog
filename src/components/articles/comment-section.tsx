'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeDate } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; username: string; avatarUrl?: string | null };
  replies?: Comment[];
}

export function CommentSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadComments = () => {
    fetch(`/api/articles/${articleId}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
    const interval = setInterval(loadComments, 15000);
    return () => clearInterval(interval);
  }, [articleId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent('');
        loadComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Comments ({comments.length})</h2>

      {user ? (
        <form onSubmit={submit} className="mb-8 flex gap-3">
          <Avatar src={user.avatarUrl} name={`${user.firstName} ${user.lastName}`} size="sm" />
          <div className="flex-1 flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="flex-1 h-10 px-3 rounded-[10px] border border-[var(--border)] bg-[var(--bg-surface)] focus:outline-none focus:border-[var(--primary)]"
            />
            <Button type="submit" disabled={submitting}>Post</Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-[var(--text-secondary)] mb-8">
          <a href="/auth/login" className="text-[var(--primary)] hover:underline">Sign in</a> to join the conversation.
        </p>
      )}

      {loading ? (
        <p className="text-[var(--text-secondary)]">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-[var(--text-secondary)]">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                src={comment.user.avatarUrl}
                name={`${comment.user.firstName} ${comment.user.lastName}`}
                size="sm"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {comment.user.firstName} {comment.user.lastName}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {formatRelativeDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-[var(--text-secondary)]">{comment.content}</p>
                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="flex gap-3 mt-4 ml-4 pl-4 border-l-2 border-[var(--border-subtle)]">
                    <Avatar
                      src={reply.user.avatarUrl}
                      name={`${reply.user.firstName} ${reply.user.lastName}`}
                      size="sm"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {reply.user.firstName} {reply.user.lastName}
                        </span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {formatRelativeDate(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)]">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
