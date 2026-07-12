'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/editor/rich-text-editor').then(m => m.RichTextEditor), { ssr: false });

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminWritePublishPage() {
  const { user, loading } = useAuth();
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [preview, setPreview] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {});
  };

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const saveArticle = async (status: 'draft' | 'published') => {
    if (!title.trim()) { setMessage('Title is required'); return; }
    setSaving(true); setMessage('');
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subtitle, excerpt: excerpt || metaDescription, coverImageUrl: coverImageUrl || null, categoryId: categoryId || null, contentHtml, content: {}, wordCount, status }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setMessage(status === 'published' ? 'Article published!' : 'Draft saved!');
      setTitle(''); setSubtitle(''); setExcerpt(''); setContentHtml(''); setCoverImageUrl('');
      setCategoryId(''); setWordCount(0); setMetaDescription(''); setTags([]);
    } else {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || 'Failed to save');
    }
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  if (loading) return null;

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Sign in to write articles</h2>
        <Link href="/auth/login" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Write / Publish</h1>
          <p className="dash-subtitle">Create a new article using the rich text editor</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/author/dashboard" className="btn btn-ghost">My Dashboard</Link>
          <Link href="/admin/articles" className="btn btn-ghost">All Articles</Link>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 20,
          background: message.includes('published') || message.includes('saved') ? 'var(--success-light)' : 'var(--error-light)',
          color: message.includes('published') || message.includes('saved') ? 'var(--success)' : 'var(--error)',
          fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, flexShrink: 0 }}>
            {message.includes('published') || message.includes('saved')
              ? <polyline points="20 6 9 17 4 12" />
              : <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>}
          </svg>
          {message}
        </div>
      )}

      <div className="dash-card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['draft', 'published'].map(s => (
            <button key={s} onClick={() => saveArticle(s as 'draft' | 'published')} disabled={saving}
              style={{
                padding: '11px 22px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.2s',
                background: s === 'published' ? 'var(--primary)' : 'var(--bg-surface)',
                color: s === 'published' ? 'oklch(98% 0.005 175)' : 'var(--text-primary)',
                border: s === 'published' ? 'none' : '1px solid var(--border)',
                opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {saving ? 'Saving...' : s === 'published' ? 'Publish' : 'Save Draft'}
            </button>
          ))}
        </div>

        <textarea ref={titleRef} value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title..." rows={1}
          style={{ width: '100%', fontSize: '1.6rem', fontWeight: 700, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'none', lineHeight: 1.3, marginBottom: 8 }} />

        <textarea ref={e => { if (e) { autoResize(e); } }} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle or summary (optional)..." rows={1}
          style={{ width: '100%', fontSize: '1rem', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'inherit', resize: 'none', lineHeight: 1.4, marginBottom: 20 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>Category</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} onClick={fetchCategories}
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>Cover Image URL</label>
            <input value={coverImageUrl} onChange={e => setCoverImageUrl(e.target.value)} placeholder="https://..." ref={coverInputRef}
              style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>Excerpt <span style={{ fontWeight: 400, textTransform: 'none' }}>(shown in article cards)</span></label>
          <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="A short summary of this article..." rows={2}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none', resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>Meta Description <span style={{ fontWeight: 400, textTransform: 'none' }}>(SEO)</span></label>
          <input value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="Brief description for search engines..."
            style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {tags.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 12, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600 }}>
                {t}
                <span onClick={() => setTags(tags.filter(x => x !== t))} style={{ cursor: 'pointer', opacity: 0.6, fontSize: '0.9rem', lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="Add a tag..."
              style={{ flex: 1, height: 36, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }} />
            <button onClick={addTag} className="btn btn-ghost" style={{ height: 36, padding: '0 14px' }}>Add</button>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-base)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Content</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{wordCount} words · {readingTime} min read</span>
          </div>
          <RichTextEditor content={contentHtml} onChange={(html) => setContentHtml(html)} onWordCount={(wc) => setWordCount(wc)} />
        </div>

        {preview && contentHtml && (
          <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elevated)', marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>{title}</h2>
            {subtitle && <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{subtitle}</p>}
            <div dangerouslySetInnerHTML={{ __html: contentHtml }} style={{ lineHeight: 1.7, fontSize: '0.95rem' }} />
          </div>
        )}

        <button onClick={() => setPreview(!preview)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
          {preview ? 'Hide Preview' : 'Show Preview'}
        </button>

        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-inset)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => setScheduled(!scheduled)} style={{ width: 40, height: 22, borderRadius: 11, background: scheduled ? 'var(--primary)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: scheduled ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg-elevated)', transition: 'transform 0.2s' }} />
          </span>
          <span style={{ fontSize: '0.82rem', color: scheduled ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>Schedule for later publishing</span>
        </div>
      </div>
    </div>
  );
}
