'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { RichTextEditor } from '@/components/editor/rich-text-editor';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AuthorEditorPage() {
  const pathname = usePathname();
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
  const [featured, setFeatured] = useState(false);
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

  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  const navItems = [
    { href: '/author/dashboard', label: 'Dashboard', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { href: '/author/dashboard', label: 'Articles', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8' },
    { href: '/author/editor', label: 'Editor', icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' },
    { href: '/author/analytics', label: 'Analytics', icon: 'M18 20V10 M12 20V4 M6 20v-6' },
    { href: '/author/withdraw', label: 'Withdraw', icon: 'M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { href: '/settings', label: 'Settings', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' },
  ];

  return (
    <div className="dash-layout">
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-logo"><span>026</span>Newsblog</Link>
        <div className="dash-sidebar-role">Author</div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Main</div>
          <nav className="dash-sidebar-nav">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href + item.label} href={item.href} className={`dash-sidebar-link${active ? ' active' : ''}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="dash-sidebar-section">
          <div className="dash-sidebar-label">Quick Links</div>
          <nav className="dash-sidebar-nav">
            <Link href="/" className="dash-sidebar-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Public Home
            </Link>
          </nav>
        </div>
        <div className="dash-sidebar-footer">
          <Link href={`/profile/${user.username}`} className="dash-sidebar-profile" style={{ textDecoration: 'none' }}>
            <div className="dash-sidebar-avatar">{initials}</div>
            <div className="dash-sidebar-profile-info">
              <div className="dash-sidebar-profile-name">{user.firstName} {user.lastName}</div>
              <div className="dash-sidebar-profile-role">{user.role}</div>
            </div>
          </Link>
        </div>
      </aside>

      <main className="dash-main">
        {/* Topbar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50, background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)', padding: '0 24px',
          marginBottom: 32, marginLeft: -32, marginRight: -32, marginTop: -32,
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', height: 56,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/author/dashboard" style={{
                width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', textDecoration: 'none',
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Link>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Write Article</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving ? (
                  <>Saving...</>
                ) : message ? (
                  <span style={{ color: 'var(--primary)' }}>{message}</span>
                ) : (
                  <><span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} /> Saved</>
                )}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setPreview(!preview)}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
                {preview ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => saveArticle('draft')}
                disabled={saving}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', border: '1px solid var(--border)',
                  background: 'transparent', color: 'var(--text-secondary)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >Save Draft</button>
              <button
                onClick={() => saveArticle('published')}
                disabled={saving}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                  background: 'var(--success)', color: '#fff',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Editor Layout */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0,
          minHeight: 'calc(100vh - 88px)',
        }}>
          {/* Main Editor Area */}
          <div style={{
            padding: '0 56px 48px 0',
            borderRight: '1px solid var(--border-subtle)',
          }}>
            {/* Cover Image Upload */}
            <div
              onClick={() => coverInputRef.current?.click()}
              style={{
                width: '100%', height: coverImageUrl ? 280 : 200,
                borderRadius: 14, border: coverImageUrl ? 'none' : '2px dashed var(--border)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: 12, cursor: 'pointer',
                transition: 'all 0.3s', marginBottom: 40,
                background: coverImageUrl ? 'transparent' : 'var(--bg-inset)',
                position: 'relative', overflow: 'hidden',
              }}
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
                  <img src={coverImageUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14 }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s', borderRadius: 14,
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>Click to change cover image</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'var(--bg-elevated)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22, color: 'var(--text-tertiary)' }}>
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    <span>Drag & drop or <strong style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</strong> to upload cover image</span>
                  </div>
                </>
              )}
            </div>

            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your article title..."
              rows={1}
              style={{
                fontFamily: "'Newsreader', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                fontWeight: 600, lineHeight: 1.25, border: 'none', outline: 'none',
                width: '100%', background: 'transparent', color: 'var(--text-primary)',
                resize: 'none', overflow: 'hidden', marginBottom: 12,
              }}
            />

            {/* Subtitle */}
            <textarea
              ref={subtitleRef}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Add a subtitle (optional)"
              rows={1}
              style={{
                fontFamily: "'Newsreader', Georgia, serif", fontSize: '1.2rem',
                fontWeight: 400, fontStyle: 'italic', lineHeight: 1.5,
                border: 'none', outline: 'none', width: '100%',
                background: 'transparent', color: 'var(--text-secondary)',
                resize: 'none', overflow: 'hidden', marginBottom: 32,
              }}
            />

            {/* Rich Text Editor */}
            <div style={{ borderRadius: 12, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
              <RichTextEditor
                content={contentHtml}
                onChange={setContentHtml}
                onWordCount={setWordCount}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 8 }}>{wordCount} words</p>
          </div>

          {/* Editor Sidebar */}
          <aside style={{ padding: '0 0 0 24px' }}>
            {/* Stats */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>Stats</div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
              }}>
                <div style={{
                  padding: 12, background: 'var(--bg-inset)', borderRadius: 10, textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFeatureSettings: '"tnum"', color: 'var(--text-primary)' }}>{wordCount.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Words</div>
                </div>
                <div style={{
                  padding: 12, background: 'var(--bg-inset)', borderRadius: 10, textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, fontFeatureSettings: '"tnum"', color: 'var(--text-primary)' }}>{readingTime} min</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Read Time</div>
                </div>
              </div>
            </div>

            {/* Categorize */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>Categorize</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: '0.82rem',
                    fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center',
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Tags</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                  placeholder="Add a tag and press Enter"
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: '0.82rem',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
                {tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {tags.map((tag) => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', background: 'var(--primary-light)',
                        color: 'var(--primary)', borderRadius: 14, fontSize: '0.72rem', fontWeight: 600,
                      }}>
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          style={{
                            width: 14, height: 14, borderRadius: '50%', border: 'none',
                            background: 'transparent', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            color: 'var(--primary)', padding: 0,
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ width: 10, height: 10 }}>
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Status</label>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                  background: 'var(--bg-inset)', borderRadius: 10,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'var(--primary-light)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--primary)' }}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Published</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Visible to everyone</div>
                  </div>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>SEO</div>
              <div style={{ padding: 16, background: 'var(--bg-inset)', borderRadius: 10, marginBottom: 12 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--success)', marginBottom: 4, fontFamily: 'system-ui, sans-serif' }}>
                  026newsblog.com/{categoryId ? categories.find((c) => c.id === categoryId)?.slug || 'uncategorized' : 'uncategorized'}/{title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled'}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--primary)', marginBottom: 4, lineHeight: 1.3 }}>
                  {title || 'Article Title'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {metaDescription || excerpt || subtitle || 'Article description will appear here...'}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Meta Description</label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description for search results..."
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: 8,
                    border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)', fontSize: '0.82rem',
                    fontFamily: 'inherit', outline: 'none', resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Article Settings */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>Article Settings</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                background: 'var(--bg-inset)', borderRadius: 10, marginBottom: 8,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--accent-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--accent)' }}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Reading Time</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{readingTime} min at 200 wpm</div>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                background: 'var(--bg-inset)', borderRadius: 10,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--success-light)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, color: 'var(--success)' }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>Featured</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>Highlight this article</div>
                </div>
                <div
                  onClick={() => setFeatured(!featured)}
                  style={{
                    width: 38, height: 20, borderRadius: 10,
                    background: featured ? 'var(--success)' : 'var(--border)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 2, left: featured ? 20 : 2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#fff', transition: 'left 0.2s',
                  }} />
                </div>
              </div>
            </div>

            {/* Publish Checklist */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.08em', color: 'var(--text-tertiary)', marginBottom: 12,
              }}>Publish Checklist</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Title added', done: !!title.trim() },
                  { label: 'Cover image uploaded', done: !!coverImageUrl },
                  { label: 'Category selected', done: !!categoryId },
                  { label: 'At least 300 words', done: wordCount >= 300 },
                  { label: 'Meta description set', done: !!metaDescription.trim() },
                  { label: 'Content not empty', done: wordCount > 0 },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      background: item.done ? 'var(--success-light)' : 'var(--bg-inset)',
                      border: item.done ? 'none' : '1.5px solid var(--border)',
                    }}>
                      {item.done && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11, color: 'var(--success)' }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
