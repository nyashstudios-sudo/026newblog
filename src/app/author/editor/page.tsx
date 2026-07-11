'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AuthorEditorPage() {
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
  const subtitleRef = useRef<HTMLTextAreaElement>(null);

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    autoResize(titleRef.current);
  }, [title]);

  useEffect(() => {
    autoResize(subtitleRef.current);
  }, [subtitle]);

  const saveArticle = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setMessage('Title is required');
      return;
    }
    setSaving(true);
    setMessage('');
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        subtitle,
        excerpt: excerpt || metaDescription,
        coverImageUrl: coverImageUrl || null,
        categoryId: categoryId || null,
        contentHtml,
        content: {},
        wordCount,
        status,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setMessage(status === 'published' ? 'Published!' : 'Draft saved!');
      if (status === 'published' && data.article?.slug) {
        window.location.href = `/article/${data.article.slug}`;
      }
    } else {
      const err = await res.json();
      setMessage(err.error || 'Failed to save');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setCoverImageUrl(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (loading) return null;

  if (!user || !['author', 'admin'].includes(user.role)) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>Article Editor</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{user ? 'Author access required.' : 'Sign in to access the editor.'}</p>
        <Link href={user ? '/author/apply' : '/auth/login'}><button style={{ padding: '10px 20px', borderRadius: 9, background: 'var(--primary)', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>{user ? 'Apply as author' : 'Sign in'}</button></Link>
      </div>
    );
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
  const selectedCategorySlug = categories.find((c) => c.id === categoryId)?.slug || 'uncategorized';
  const seoUrl = `026newsblog.com/${selectedCategorySlug}/${slug}`;
  const saveLabel = saving ? 'Saving...' : message || 'Saved';

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <Link href="/author/dashboard" className="back-btn" aria-label="Back to dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </Link>
            <span className="topbar-title">Write Article</span>
            <span className="save-status">
              <span className="save-dot" style={{ background: saving ? 'var(--warning)' : message?.includes('fail') ? 'var(--error)' : 'var(--success)' }}></span>
              {saveLabel}
            </span>
          </div>
          <div className="topbar-right">
            <button
              onClick={() => setPreview(!preview)}
              className="btn btn-ghost"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => saveArticle('draft')}
              disabled={saving}
              className="btn btn-ghost"
            >Save Draft</button>
            <button
              onClick={() => saveArticle('published')}
              disabled={saving}
              className="btn btn-success"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Publish
            </button>
          </div>
        </div>
      </header>

      <div className="editor-layout">
        <div className="editor-main">
          <div
            className={`cover-upload${coverImageUrl ? ' has-image' : ''}`}
            onClick={() => coverInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-inset)'; }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-inset)';
              const file = e.dataTransfer.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  if (ev.target?.result) setCoverImageUrl(ev.target.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          >
            <input ref={coverInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
            {coverImageUrl ? (
              <>
                <img src={coverImageUrl} alt="Cover" />
                <div className="cover-overlay">
                  <span style={{ color: 'oklch(96% 0 0)', fontSize: '0.85rem', fontWeight: 600 }}>Click to change cover image</span>
                </div>
              </>
            ) : (
              <>
                <div className="cover-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <div className="cover-text">
                  <span>Drag & drop or <strong>browse</strong> to upload cover image</span>
                </div>
              </>
            )}
          </div>

          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your article title..."
            rows={1}
            className="title-input"
          />

          <textarea
            ref={subtitleRef}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Add a subtitle (optional)"
            rows={1}
            className="subtitle-input"
          />

          <div className="toolbar">
            <select className="toolbar-select">
              <option>Paragraph</option>
              <option>Heading 2</option>
              <option>Heading 3</option>
              <option>Quote</option>
              <option>Code Block</option>
            </select>

            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
              <button className="toolbar-btn active" data-tooltip="Bold (⌘B)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Italic (⌘I)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Underline (⌘U)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Strikethrough">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4H9a3 3 0 0 0 0 6h6"/><path d="M8 20h7a3 3 0 0 0 0-6H4"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
              </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
              <button className="toolbar-btn" data-tooltip="Bullet List">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Numbered List">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="7" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui">1</text><text x="3" y="13" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui">2</text><text x="3" y="19" fontSize="7" fill="currentColor" stroke="none" fontFamily="system-ui">3</text></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Blockquote">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>
              </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
              <button className="toolbar-btn" data-tooltip="Link (⌘K)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Video Embed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Code">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
              </button>
            </div>

            <div className="toolbar-divider"></div>

            <div className="toolbar-group">
              <button className="toolbar-btn" data-tooltip="Divider">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="12" x2="22" y2="12"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Embed Tweet">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Undo (⌘Z)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              </button>
              <button className="toolbar-btn" data-tooltip="Redo (⌘⇧Z)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </button>
            </div>
          </div>

          <div className="editor-content" contentEditable={false}>
            <RichTextEditor
              content={contentHtml}
              onChange={setContentHtml}
              onWordCount={setWordCount}
            />
          </div>
        </div>

        <aside className="editor-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Stats</div>
            <div className="word-stats">
              <div className="word-stat">
                <div className="word-stat-value">{wordCount.toLocaleString()}</div>
                <div className="word-stat-label">Words</div>
              </div>
              <div className="word-stat">
                <div className="word-stat-value">{readingTime} min</div>
                <div className="word-stat-label">Read Time</div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Categorize</div>
            <div className="field-group">
              <label className="field-label">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="field-select"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Tags</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add a tag and press Enter"
                className="field-input"
              />
              {tags.length > 0 && (
                <div className="tags-wrap">
                  {tags.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="tag-chip-remove">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">SEO Preview</div>
            <div className="seo-preview">
              <div className="seo-preview-url">{seoUrl}</div>
              <div className="seo-preview-title">{title || 'Article Title'}</div>
              <div className="seo-preview-desc">{metaDescription || excerpt || subtitle || 'Article description will appear here...'}</div>
            </div>
            <div className="field-group" style={{ marginTop: 12 }}>
              <label className="field-label">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                placeholder="Brief description for search results..."
                className="field-input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Scheduling</div>
            <div className="schedule-row">
              <div className="schedule-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div className="schedule-info">
                <div className="schedule-label">Schedule Post</div>
                <div className="schedule-value">{scheduled ? 'Scheduled' : 'Publish immediately'}</div>
              </div>
              <div
                className={`schedule-toggle${scheduled ? ' active' : ''}`}
                onClick={() => setScheduled(!scheduled)}
              ></div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-section-title">Publish Checklist</div>
            <div className="checklist">
              {[
                { label: 'Title added', done: !!title.trim() },
                { label: 'Cover image uploaded', done: !!coverImageUrl },
                { label: 'Category selected', done: !!categoryId },
                { label: 'At least 300 words', done: wordCount >= 300 },
                { label: 'Meta description set', done: !!metaDescription.trim() },
                { label: 'Content not empty', done: wordCount > 0 },
              ].map((item) => (
                <div key={item.label} className="check-item">
                  <span className={`check-icon${item.done ? ' done' : ' pending'}`}>
                    {item.done && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
