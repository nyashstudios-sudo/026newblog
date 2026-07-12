'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';

interface AppSettings {
  authorShare: number; platformShare: number; withdrawalThreshold: number;
  autoFlag: boolean; requireReview: boolean;
  breakingNewsTicker: boolean; autoApprove: boolean;
  siteTheme: string; siteLogoUrl: string; siteTitle: string; siteDescription: string;
  enableRegistration: boolean; enableComments: boolean; enableChat: boolean;
  requireEmailVerification: boolean; contentPerPage: number;
  siteUrl: string; supportEmail: string; faviconUrl: string;
  defaultLanguage: string; timezone: string; dateFormat: string; currencyDisplay: string;
  enableGoogleOauth: boolean; enableGithubOauth: boolean; inviteOnlyMode: boolean;
  heroSlideshow: boolean; trendingSidebar: boolean; newsletterWidget: boolean;
  rssFeedSection: boolean; chatWidget: boolean;
  primaryColor: string; accentColor: string;
  heroSlideshowInterval: number; defaultFeedTab: string;
  payoutProcessingTime: string;
  mpesaEnvironment: string; mpesaShortcode: string; mpesaConsumerKey: string;
  mpesaConsumerSecret: string; mpesaPasskey: string; mpesaCallbackUrl: string;
  adSponsoredArticle: number; adDisplayAds: number; adNewsletterSponsor: number; adHomepageFeature: number;
  allowSelfPublishing: boolean;
  moderationExternalLinks: boolean; moderationCommunityReports: boolean;
  moderationAutoHide: boolean; moderationProfanityFilter: boolean; moderationAiThreshold: number;
  minWordCount: number; maxTags: number; autoGenerateAudio: boolean;
  readingTimeDisplay: boolean; relatedArticles: boolean;
  emailApiKey: string; emailFrom: string; emailReplyTo: string;
  storageEndpoint: string; storageBucket: string; storageAccessKey: string;
  storageSecretKey: string; storageCdnUrl: string; storageMaxUpload: number;
  openaiApiKey: string; googleTtsApiKey: string; ttsVoiceModel: string;
  seoTitleTemplate: string; seoDescription: string; seoOgImage: string;
  socialTwitter: string; socialFacebook: string; socialLinkedin: string; socialInstagram: string;
  analyticsGaId: string; analyticsCustomHead: string;
  sitemapAutoGenerate: boolean; indexArticles: boolean; indexAuthors: boolean;
  redisUrl: string; feedCacheTtl: number; articleCacheTtl: number;
  rateLimiting: boolean; corsRestriction: boolean; bruteForceProtection: boolean; forceHttps: boolean;
  backupFrequency: string; backupRetention: string;
}

const D: AppSettings = {
  authorShare: 70, platformShare: 30, withdrawalThreshold: 50,
  autoFlag: true, requireReview: false, breakingNewsTicker: true, autoApprove: false,
  siteTheme: 'light', siteLogoUrl: '', siteTitle: '026Newsblog',
  siteDescription: "East Africa's independent news platform.",
  enableRegistration: true, enableComments: true, enableChat: true,
  requireEmailVerification: false, contentPerPage: 20,
  siteUrl: 'https://026newsblog.com', supportEmail: 'hello@026newsblog.com', faviconUrl: '',
  defaultLanguage: 'en-US', timezone: 'Africa/Nairobi', dateFormat: 'Jul 12, 2026', currencyDisplay: 'USD with KES',
  enableGoogleOauth: true, enableGithubOauth: true, inviteOnlyMode: false,
  heroSlideshow: true, trendingSidebar: true, newsletterWidget: true,
  rssFeedSection: true, chatWidget: true,
  primaryColor: '#1a8a6e', accentColor: '#f97316',
  heroSlideshowInterval: 5, defaultFeedTab: 'foryou',
  payoutProcessingTime: '24h',
  mpesaEnvironment: 'production', mpesaShortcode: '174379', mpesaConsumerKey: '', mpesaConsumerSecret: '', mpesaPasskey: '', mpesaCallbackUrl: '',
  adSponsoredArticle: 500, adDisplayAds: 200, adNewsletterSponsor: 150, adHomepageFeature: 800,
  allowSelfPublishing: true,
  moderationExternalLinks: true, moderationCommunityReports: true,
  moderationAutoHide: true, moderationProfanityFilter: false, moderationAiThreshold: 80,
  minWordCount: 300, maxTags: 8, autoGenerateAudio: true,
  readingTimeDisplay: true, relatedArticles: true,
  emailApiKey: '', emailFrom: 'noreply@026newsblog.com', emailReplyTo: 'hello@026newsblog.com',
  storageEndpoint: '', storageBucket: '026newsblog-uploads', storageAccessKey: '', storageSecretKey: '', storageCdnUrl: '', storageMaxUpload: 10,
  openaiApiKey: '', googleTtsApiKey: '', ttsVoiceModel: 'en-US-Neural2-D',
  seoTitleTemplate: '{title} · 026Newsblog', seoDescription: "026Newsblog is East Africa's creator-first news platform.", seoOgImage: '',
  socialTwitter: '@026newsblog', socialFacebook: 'https://facebook.com/026newsblog', socialLinkedin: 'https://linkedin.com/company/026newsblog', socialInstagram: '@026newsblog',
  analyticsGaId: '', analyticsCustomHead: '',
  sitemapAutoGenerate: true, indexArticles: true, indexAuthors: true,
  redisUrl: '', feedCacheTtl: 300, articleCacheTtl: 3600,
  rateLimiting: true, corsRestriction: true, bruteForceProtection: true, forceHttps: true,
  backupFrequency: 'daily', backupRetention: '30',
};

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const [s, setS] = useState<AppSettings>(D);
  const [saved, setSaved] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const markSaved = () => {
    setSaved('Settings saved successfully');
    setDirty(false);
    setTimeout(() => setSaved(null), 2000);
  };

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((d: any) => {
        const st = d.settings || {};
        setS(p => ({
          ...p,
          authorShare: st.revenue_share_pct?.author ?? p.authorShare,
          platformShare: st.revenue_share_pct?.platform ?? p.platformShare,
          withdrawalThreshold: st.withdrawal_threshold_usd?.amount ?? p.withdrawalThreshold,
          autoFlag: st.moderation?.autoFlag ?? p.autoFlag,
          requireReview: st.moderation?.requireReview ?? p.requireReview,
          breakingNewsTicker: st.breaking_news_ticker ?? p.breakingNewsTicker,
          autoApprove: st.auto_approve ?? p.autoApprove,
          siteTheme: st.site_appearance?.theme || p.siteTheme,
          siteLogoUrl: st.site_appearance?.logoUrl || p.siteLogoUrl,
          siteTitle: st.site_title || p.siteTitle,
          siteDescription: st.site_description || p.siteDescription,
          enableRegistration: st.enable_registration ?? p.enableRegistration,
          enableComments: st.enable_comments ?? p.enableComments,
          enableChat: st.enable_chat ?? p.enableChat,
          requireEmailVerification: st.require_email_verification ?? p.requireEmailVerification,
          contentPerPage: st.content_per_page || p.contentPerPage,
          siteUrl: st.site_url || p.siteUrl,
          supportEmail: st.support_email || p.supportEmail,
          faviconUrl: st.favicon_url || p.faviconUrl,
          defaultLanguage: st.default_language || p.defaultLanguage,
          timezone: st.timezone || p.timezone,
          dateFormat: st.date_format || p.dateFormat,
          currencyDisplay: st.currency_display || p.currencyDisplay,
          enableGoogleOauth: st.enable_google_oauth ?? p.enableGoogleOauth,
          enableGithubOauth: st.enable_github_oauth ?? p.enableGithubOauth,
          inviteOnlyMode: st.invite_only_mode ?? p.inviteOnlyMode,
          heroSlideshow: st.hero_slideshow ?? p.heroSlideshow,
          trendingSidebar: st.trending_sidebar ?? p.trendingSidebar,
          newsletterWidget: st.newsletter_widget ?? p.newsletterWidget,
          rssFeedSection: st.rss_feed_section ?? p.rssFeedSection,
          chatWidget: st.chat_widget ?? p.chatWidget,
          primaryColor: st.primary_color || p.primaryColor,
          accentColor: st.accent_color || p.accentColor,
          heroSlideshowInterval: st.hero_slideshow_interval || p.heroSlideshowInterval,
          defaultFeedTab: st.default_feed_tab || p.defaultFeedTab,
          payoutProcessingTime: st.payout_processing_time || p.payoutProcessingTime,
          mpesaEnvironment: st.mpesa_environment || p.mpesaEnvironment,
          mpesaShortcode: st.mpesa_shortcode || p.mpesaShortcode,
          mpesaConsumerKey: st.mpesa_consumer_key || p.mpesaConsumerKey,
          mpesaConsumerSecret: st.mpesa_consumer_secret || p.mpesaConsumerSecret,
          mpesaPasskey: st.mpesa_passkey || p.mpesaPasskey,
          mpesaCallbackUrl: st.mpesa_callback_url || p.mpesaCallbackUrl,
          adSponsoredArticle: st.ad_sponsored_article || p.adSponsoredArticle,
          adDisplayAds: st.ad_display_ads || p.adDisplayAds,
          adNewsletterSponsor: st.ad_newsletter_sponsor || p.adNewsletterSponsor,
          adHomepageFeature: st.ad_homepage_feature || p.adHomepageFeature,
          allowSelfPublishing: st.allow_self_publishing ?? p.allowSelfPublishing,
          moderationExternalLinks: st.moderation_external_links ?? p.moderationExternalLinks,
          moderationCommunityReports: st.moderation_community_reports ?? p.moderationCommunityReports,
          moderationAutoHide: st.moderation_auto_hide ?? p.moderationAutoHide,
          moderationProfanityFilter: st.moderation_profanity_filter ?? p.moderationProfanityFilter,
          moderationAiThreshold: st.moderation_ai_threshold || p.moderationAiThreshold,
          minWordCount: st.min_word_count || p.minWordCount,
          maxTags: st.max_tags || p.maxTags,
          autoGenerateAudio: st.auto_generate_audio ?? p.autoGenerateAudio,
          readingTimeDisplay: st.reading_time_display ?? p.readingTimeDisplay,
          relatedArticles: st.related_articles ?? p.relatedArticles,
          emailApiKey: st.email_api_key || p.emailApiKey,
          emailFrom: st.email_from || p.emailFrom,
          emailReplyTo: st.email_reply_to || p.emailReplyTo,
          storageEndpoint: st.storage_endpoint || p.storageEndpoint,
          storageBucket: st.storage_bucket || p.storageBucket,
          storageAccessKey: st.storage_access_key || p.storageAccessKey,
          storageSecretKey: st.storage_secret_key || p.storageSecretKey,
          storageCdnUrl: st.storage_cdn_url || p.storageCdnUrl,
          storageMaxUpload: st.storage_max_upload || p.storageMaxUpload,
          openaiApiKey: st.openai_api_key || p.openaiApiKey,
          googleTtsApiKey: st.google_tts_api_key || p.googleTtsApiKey,
          ttsVoiceModel: st.tts_voice_model || p.ttsVoiceModel,
          seoTitleTemplate: st.seo_title_template || p.seoTitleTemplate,
          seoDescription: st.seo_description || p.seoDescription,
          seoOgImage: st.seo_og_image || p.seoOgImage,
          socialTwitter: st.social_twitter || p.socialTwitter,
          socialFacebook: st.social_facebook || p.socialFacebook,
          socialLinkedin: st.social_linkedin || p.socialLinkedin,
          socialInstagram: st.social_instagram || p.socialInstagram,
          analyticsGaId: st.analytics_ga_id || p.analyticsGaId,
          analyticsCustomHead: st.analytics_custom_head || p.analyticsCustomHead,
          sitemapAutoGenerate: st.sitemap_auto_generate ?? p.sitemapAutoGenerate,
          indexArticles: st.index_articles ?? p.indexArticles,
          indexAuthors: st.index_authors ?? p.indexAuthors,
          redisUrl: st.redis_url || p.redisUrl,
          feedCacheTtl: st.feed_cache_ttl || p.feedCacheTtl,
          articleCacheTtl: st.article_cache_ttl || p.articleCacheTtl,
          rateLimiting: st.rate_limiting ?? p.rateLimiting,
          corsRestriction: st.cors_restriction ?? p.corsRestriction,
          bruteForceProtection: st.brute_force_protection ?? p.bruteForceProtection,
          forceHttps: st.force_https ?? p.forceHttps,
          backupFrequency: st.backup_frequency || p.backupFrequency,
          backupRetention: st.backup_retention || p.backupRetention,
        }));
      }, () => {});
  }, [user]);

  const save = async () => {
    const body: Record<string, unknown> = {
      revenue_share_pct: { author: s.authorShare, platform: s.platformShare },
      withdrawal_threshold_usd: { amount: s.withdrawalThreshold },
      moderation: { autoFlag: s.autoFlag, requireReview: s.requireReview },
      site_appearance: { theme: s.siteTheme, logoUrl: s.siteLogoUrl || null },
      site_title: s.siteTitle, site_description: s.siteDescription,
      enable_registration: s.enableRegistration, enable_comments: s.enableComments,
      enable_chat: s.enableChat, require_email_verification: s.requireEmailVerification,
      content_per_page: s.contentPerPage, breaking_news_ticker: s.breakingNewsTicker,
      auto_approve: s.autoApprove, site_url: s.siteUrl, support_email: s.supportEmail,
      favicon_url: s.faviconUrl, default_language: s.defaultLanguage, timezone: s.timezone,
      date_format: s.dateFormat, currency_display: s.currencyDisplay,
      enable_google_oauth: s.enableGoogleOauth, enable_github_oauth: s.enableGithubOauth,
      invite_only_mode: s.inviteOnlyMode, hero_slideshow: s.heroSlideshow,
      trending_sidebar: s.trendingSidebar, newsletter_widget: s.newsletterWidget,
      rss_feed_section: s.rssFeedSection, chat_widget: s.chatWidget,
      primary_color: s.primaryColor, accent_color: s.accentColor,
      hero_slideshow_interval: s.heroSlideshowInterval, default_feed_tab: s.defaultFeedTab,
      payout_processing_time: s.payoutProcessingTime,
      mpesa_environment: s.mpesaEnvironment, mpesa_shortcode: s.mpesaShortcode,
      mpesa_consumer_key: s.mpesaConsumerKey, mpesa_consumer_secret: s.mpesaConsumerSecret,
      mpesa_passkey: s.mpesaPasskey, mpesa_callback_url: s.mpesaCallbackUrl,
      ad_sponsored_article: s.adSponsoredArticle, ad_display_ads: s.adDisplayAds,
      ad_newsletter_sponsor: s.adNewsletterSponsor, ad_homepage_feature: s.adHomepageFeature,
      allow_self_publishing: s.allowSelfPublishing,
      moderation_external_links: s.moderationExternalLinks,
      moderation_community_reports: s.moderationCommunityReports,
      moderation_auto_hide: s.moderationAutoHide,
      moderation_profanity_filter: s.moderationProfanityFilter,
      moderation_ai_threshold: s.moderationAiThreshold,
      min_word_count: s.minWordCount, max_tags: s.maxTags,
      auto_generate_audio: s.autoGenerateAudio, reading_time_display: s.readingTimeDisplay,
      related_articles: s.relatedArticles,
      email_api_key: s.emailApiKey, email_from: s.emailFrom, email_reply_to: s.emailReplyTo,
      storage_endpoint: s.storageEndpoint, storage_bucket: s.storageBucket,
      storage_access_key: s.storageAccessKey, storage_secret_key: s.storageSecretKey,
      storage_cdn_url: s.storageCdnUrl, storage_max_upload: s.storageMaxUpload,
      openai_api_key: s.openaiApiKey, google_tts_api_key: s.googleTtsApiKey,
      tts_voice_model: s.ttsVoiceModel,
      seo_title_template: s.seoTitleTemplate, seo_description: s.seoDescription,
      seo_og_image: s.seoOgImage,
      social_twitter: s.socialTwitter, social_facebook: s.socialFacebook,
      social_linkedin: s.socialLinkedin, social_instagram: s.socialInstagram,
      analytics_ga_id: s.analyticsGaId, analytics_custom_head: s.analyticsCustomHead,
      sitemap_auto_generate: s.sitemapAutoGenerate, index_articles: s.indexArticles,
      index_authors: s.indexAuthors,
      redis_url: s.redisUrl, feed_cache_ttl: s.feedCacheTtl, article_cache_ttl: s.articleCacheTtl,
      rate_limiting: s.rateLimiting, cors_restriction: s.corsRestriction,
      brute_force_protection: s.bruteForceProtection, force_https: s.forceHttps,
      backup_frequency: s.backupFrequency, backup_retention: s.backupRetention,
    };
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    markSaved();
  };

  const set = (partial: Partial<AppSettings>) => {
    setS(p => ({ ...p, ...partial }));
    setDirty(true);
  };

  if (loading) return null;

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'monetization', label: 'Monetization' },
    { key: 'moderation', label: 'Content & Moderation' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'seo', label: 'SEO & Meta' },
    { key: 'advanced', label: 'Advanced' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Site Settings</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginTop: 2 }}>Configure platform behavior, appearance, integrations, and policies</p>
        </div>
        <Button onClick={save} disabled={!!saved}>{saved || 'Save Settings'}</Button>
      </div>

      <TabsRow tabs={tabs} activeTab={activeTab} onTabChange={(k) => { setActiveTab(k); setDirty(false); }} />

      {activeTab === 'general' && <GeneralSection s={s} set={set} />}
      {activeTab === 'appearance' && <AppearanceSection s={s} set={set} />}
      {activeTab === 'monetization' && <MonetizationSection s={s} set={set} />}
      {activeTab === 'moderation' && <ModerationSection s={s} set={set} />}
      {activeTab === 'integrations' && <IntegrationsSection s={s} set={set} />}
      {activeTab === 'seo' && <SeoSection s={s} set={set} />}
      {activeTab === 'advanced' && <AdvancedSection s={s} set={set} />}

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        {dirty && <span style={{ fontSize: '0.78rem', color: 'var(--warning)', alignSelf: 'center' }}>Unsaved changes</span>}
        <Button onClick={save} disabled={!!saved} style={{ padding: '12px 36px' }}>{saved || 'Save Settings'}</Button>
      </div>
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <span onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? 'var(--success)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-elevated)', transition: 'transform 0.2s' }} />
    </span>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)', gap: 16 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{label}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{desc}</div>
      </div>
      {children}
    </div>
  );
}

function TabsRow({ tabs, activeTab, onTabChange }: { tabs: { key: string; label: string }[]; activeTab: string; onTabChange: (k: string) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 28, padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', overflowX: 'auto', width: 'fit-content', maxWidth: '100%' }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onTabChange(t.key)}
          style={{
            padding: '8px 18px', borderRadius: 7, fontSize: '0.78rem', fontWeight: 600, border: 'none', whiteSpace: 'nowrap',
            background: activeTab === t.key ? 'var(--primary)' : 'transparent',
            color: activeTab === t.key ? 'oklch(98% 0.005 175)' : 'var(--text-tertiary)',
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
          }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

function InlineInput({ value, onChange, suffix, min, max, style: extra }: { value: number | string; onChange: (v: any) => void; suffix?: string; min?: number; max?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {suffix && <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{suffix}</span>}
      <input type={typeof value === 'number' ? 'number' : 'text'} value={value}
        onChange={e => onChange(typeof value === 'number' ? (min !== undefined ? Math.max(min, Math.min(max ?? 9999, +e.target.value)) : +e.target.value) : e.target.value)}
        style={{ width: typeof value === 'number' ? 60 : 120, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)', fontSize: '0.82rem', fontFamily: 'inherit', fontFeatureSettings: '"tnum"', textAlign: 'center', color: 'var(--text-primary)', ...extra }} />
    </div>
  );
}

function Select({ value, onChange, options, style }: { value: string; onChange: (v: string) => void; options: string[]; style?: React.CSSProperties }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ height: 36, padding: '0 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-surface)', fontFamily: 'inherit', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', ...style }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px', borderRadius: 9,
  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
  fontFamily: 'inherit', fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none',
};

/* ───── General ───── */
function GeneralSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Site Identity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Site Name</label><input value={s.siteTitle} onChange={e => set({ siteTitle: e.target.value })} style={inputStyle} /></div>
            <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Tagline</label><input value={s.siteDescription} onChange={e => set({ siteDescription: e.target.value })} style={inputStyle} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Site URL</label><input value={s.siteUrl} onChange={e => set({ siteUrl: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
            <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Support Email</label><input value={s.supportEmail} onChange={e => set({ supportEmail: e.target.value })} style={inputStyle} placeholder="hello@..." /></div>
          </div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Site Logo URL</label><input value={s.siteLogoUrl} onChange={e => set({ siteLogoUrl: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Favicon URL</label><input value={s.faviconUrl} onChange={e => set({ faviconUrl: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
        </div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Regional Settings</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Default Language</label><Select value={s.defaultLanguage} onChange={v => set({ defaultLanguage: v })} options={['en-US', 'sw-KE', 'fr-FR']} style={{ width: '100%' }} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Timezone</label><Select value={s.timezone} onChange={v => set({ timezone: v })} options={['Africa/Nairobi', 'Africa/Lagos', 'Africa/Johannesburg']} style={{ width: '100%' }} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Date Format</label><Select value={s.dateFormat} onChange={v => set({ dateFormat: v })} options={['Jul 12, 2026', '12/07/2026', '2026-07-12', '12 July 2026']} style={{ width: '100%' }} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Currency Display</label><Select value={s.currencyDisplay} onChange={v => set({ currencyDisplay: v })} options={['USD with KES', 'KES only', 'USD only']} style={{ width: '100%' }} /></div>
        </div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Registration & Access</h2>
        <SettingRow label="Open Registration" desc="Allow new readers to create accounts"><Toggle value={s.enableRegistration} onChange={v => set({ enableRegistration: v })} /></SettingRow>
        <SettingRow label="Email Verification Required" desc="Users must verify email before accessing full features"><Toggle value={s.requireEmailVerification} onChange={v => set({ requireEmailVerification: v })} /></SettingRow>
        <SettingRow label="Google OAuth Login" desc="Allow sign in with Google accounts"><Toggle value={s.enableGoogleOauth} onChange={v => set({ enableGoogleOauth: v })} /></SettingRow>
        <SettingRow label="GitHub OAuth Login" desc="Allow sign in with GitHub accounts"><Toggle value={s.enableGithubOauth} onChange={v => set({ enableGithubOauth: v })} /></SettingRow>
        <SettingRow label="Invite-Only Mode" desc="Require an invitation code to register (overrides open registration)"><Toggle value={s.inviteOnlyMode} onChange={v => set({ inviteOnlyMode: v })} /></SettingRow>
      </div>
    </>
  );
}

/* ───── Appearance ───── */
function AppearanceSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Homepage Layout</h2>
        <SettingRow label="Breaking News Ticker" desc="Show scrolling ticker at top of homepage"><Toggle value={s.breakingNewsTicker} onChange={v => set({ breakingNewsTicker: v })} /></SettingRow>
        <SettingRow label="Hero Slideshow" desc="Featured article carousel in hero section"><Toggle value={s.heroSlideshow} onChange={v => set({ heroSlideshow: v })} /></SettingRow>
        <SettingRow label="Trending Sidebar" desc="Show trending articles in sidebar"><Toggle value={s.trendingSidebar} onChange={v => set({ trendingSidebar: v })} /></SettingRow>
        <SettingRow label="Newsletter Signup Widget" desc="Display email signup in sidebar"><Toggle value={s.newsletterWidget} onChange={v => set({ newsletterWidget: v })} /></SettingRow>
        <SettingRow label="RSS Feed Section" desc="Display aggregated external content on homepage"><Toggle value={s.rssFeedSection} onChange={v => set({ rssFeedSection: v })} /></SettingRow>
        <SettingRow label="Chat Widget" desc="Floating chat button on all pages"><Toggle value={s.chatWidget} onChange={v => set({ chatWidget: v })} /></SettingRow>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Brand Colors</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Primary Color</label><input type="color" value={s.primaryColor} onChange={e => set({ primaryColor: e.target.value })} style={{ width: 48, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', padding: 2 }} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Accent Color</label><input type="color" value={s.accentColor} onChange={e => set({ accentColor: e.target.value })} style={{ width: 48, height: 36, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', padding: 2 }} /></div>
        </div>
        <SettingRow label="Default Theme" desc="Default appearance for new visitors">
          <Select value={s.siteTheme} onChange={v => set({ siteTheme: v })} options={['light', 'dark', 'system']} />
        </SettingRow>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Feed Settings</h2>
        <SettingRow label="Articles Per Page" desc="Number of articles shown per page/infinite scroll batch"><InlineInput value={s.contentPerPage} onChange={v => set({ contentPerPage: Math.max(5, Math.min(100, v)) })} min={5} max={100} /></SettingRow>
        <SettingRow label="Hero Slideshow Interval" desc="Seconds between slides"><InlineInput value={s.heroSlideshowInterval} onChange={v => set({ heroSlideshowInterval: Math.max(2, Math.min(30, v)) })} suffix="seconds" min={2} max={30} /></SettingRow>
        <SettingRow label="Default Feed Tab" desc="Initial tab when visiting homepage">
          <Select value={s.defaultFeedTab} onChange={v => set({ defaultFeedTab: v })} options={['foryou', 'recent', 'popular']} />
        </SettingRow>
      </div>
    </>
  );
}

/* ───── Monetization ───── */
function MonetizationSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Revenue Configuration</h2>
        <SettingRow label="Author Revenue Share" desc="Percentage of article revenue that goes to the author">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" value={s.authorShare}
              onChange={e => { const v = +e.target.value; set({ authorShare: Math.min(v, 99), platformShare: 100 - Math.min(v, 99) }); }}
              style={{ width: 60, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-base)', fontSize: '0.82rem', fontFamily: 'inherit', fontFeatureSettings: '"tnum"', textAlign: 'center', color: 'var(--text-primary)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>/ {s.platformShare}%</span>
          </div>
        </SettingRow>
        <SettingRow label="Platform Share" desc="Percentage retained by the platform"><span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{s.platformShare}%</span></SettingRow>
        <SettingRow label="Minimum Withdrawal (USD)" desc="Minimum balance for author withdrawal"><InlineInput value={s.withdrawalThreshold} onChange={v => set({ withdrawalThreshold: v })} suffix="$" /></SettingRow>
        <SettingRow label="Payout Processing Time" desc="How quickly payouts are processed">
          <Select value={s.payoutProcessingTime} onChange={v => set({ payoutProcessingTime: v })} options={['1h', '24h', '48h', 'weekly']} />
        </SettingRow>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>M-Pesa Configuration</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>Safaricom Daraja API credentials for payouts</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Environment</label><Select value={s.mpesaEnvironment} onChange={v => set({ mpesaEnvironment: v })} options={['sandbox', 'production']} style={{ width: '100%' }} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Business Shortcode</label><input value={s.mpesaShortcode} onChange={e => set({ mpesaShortcode: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Consumer Key</label><input type="password" value={s.mpesaConsumerKey} onChange={e => set({ mpesaConsumerKey: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Consumer Secret</label><input type="password" value={s.mpesaConsumerSecret} onChange={e => set({ mpesaConsumerSecret: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Passkey</label><input type="password" value={s.mpesaPasskey} onChange={e => set({ mpesaPasskey: e.target.value })} style={inputStyle} /></div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Callback URL</label><input value={s.mpesaCallbackUrl} onChange={e => set({ mpesaCallbackUrl: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Advertising Rates</h2>
        <SettingRow label="Sponsored Article" desc="Price per sponsored article"><InlineInput value={s.adSponsoredArticle} onChange={v => set({ adSponsoredArticle: v })} suffix="$" /></SettingRow>
        <SettingRow label="Display Ads" desc="Price per week"><InlineInput value={s.adDisplayAds} onChange={v => set({ adDisplayAds: v })} suffix="$" /></SettingRow>
        <SettingRow label="Newsletter Sponsor" desc="Price per send"><InlineInput value={s.adNewsletterSponsor} onChange={v => set({ adNewsletterSponsor: v })} suffix="$" /></SettingRow>
        <SettingRow label="Homepage Feature" desc="Price per 24 hours"><InlineInput value={s.adHomepageFeature} onChange={v => set({ adHomepageFeature: v })} suffix="$" /></SettingRow>
      </div>
    </>
  );
}

/* ───── Content & Moderation ───── */
function ModerationSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Author Management</h2>
        <SettingRow label="Auto-Approve Authors" desc="Automatically approve applications with verified portfolios"><Toggle value={s.autoApprove} onChange={v => set({ autoApprove: v })} /></SettingRow>
        <SettingRow label="Require Editorial Review" desc="New authors must have first 3 articles reviewed before auto-publishing"><Toggle value={s.requireReview} onChange={v => set({ requireReview: v })} /></SettingRow>
        <SettingRow label="Allow Self-Publishing" desc="Authors can publish directly without admin approval (after probation)"><Toggle value={s.allowSelfPublishing} onChange={v => set({ allowSelfPublishing: v })} /></SettingRow>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Content Moderation</h2>
        <SettingRow label="AI Content Moderation" desc="Automatically flag comments using AI"><Toggle value={s.autoFlag} onChange={v => set({ autoFlag: v })} /></SettingRow>
        <SettingRow label="External Link Approval" desc="Hold comments with external links for manual review"><Toggle value={s.moderationExternalLinks} onChange={v => set({ moderationExternalLinks: v })} /></SettingRow>
        <SettingRow label="Community Reports" desc="Allow users to report comments and articles"><Toggle value={s.moderationCommunityReports} onChange={v => set({ moderationCommunityReports: v })} /></SettingRow>
        <SettingRow label="Auto-Hide on Reports" desc="Automatically hide content after 3 community reports"><Toggle value={s.moderationAutoHide} onChange={v => set({ moderationAutoHide: v })} /></SettingRow>
        <SettingRow label="Profanity Filter" desc="Block comments containing profanity"><Toggle value={s.moderationProfanityFilter} onChange={v => set({ moderationProfanityFilter: v })} /></SettingRow>
        <SettingRow label="AI Confidence Threshold" desc="Minimum confidence % for auto-flagging">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="range" min={50} max={99} value={s.moderationAiThreshold} onChange={e => set({ moderationAiThreshold: +e.target.value })}
              style={{ width: 120, height: 6, borderRadius: 3, background: 'var(--border)', accentColor: 'var(--primary)', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, minWidth: 36 }}>{s.moderationAiThreshold}%</span>
          </div>
        </SettingRow>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Article Settings</h2>
        <SettingRow label="Article Comments" desc="Enable commenting on articles"><Toggle value={s.enableComments} onChange={v => set({ enableComments: v })} /></SettingRow>
        <SettingRow label="Community Chat" desc="Enable the live chat feature"><Toggle value={s.enableChat} onChange={v => set({ enableChat: v })} /></SettingRow>
        <SettingRow label="Minimum Word Count" desc="Minimum words required per article"><InlineInput value={s.minWordCount} onChange={v => set({ minWordCount: v })} suffix="words" /></SettingRow>
        <SettingRow label="Maximum Tags" desc="Maximum tags per article"><InlineInput value={s.maxTags} onChange={v => set({ maxTags: v })} suffix="tags" /></SettingRow>
        <SettingRow label="Auto-Generate Audio" desc="Automatically create AI-narrated audio for published articles"><Toggle value={s.autoGenerateAudio} onChange={v => set({ autoGenerateAudio: v })} /></SettingRow>
        <SettingRow label="Reading Time Display" desc="Show estimated reading time on article cards"><Toggle value={s.readingTimeDisplay} onChange={v => set({ readingTimeDisplay: v })} /></SettingRow>
        <SettingRow label="Related Articles" desc="Show related content at the end of articles"><Toggle value={s.relatedArticles} onChange={v => set({ relatedArticles: v })} /></SettingRow>
      </div>
    </>
  );
}

/* ───── Integrations ───── */
function IntegrationsSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Email Service (Resend)</h2>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>API Key</label><input type="password" value={s.emailApiKey} onChange={e => set({ emailApiKey: e.target.value })} style={inputStyle} placeholder="re_..." /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>From Email</label><input value={s.emailFrom} onChange={e => set({ emailFrom: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Reply-To Email</label><input value={s.emailReplyTo} onChange={e => set({ emailReplyTo: e.target.value })} style={inputStyle} /></div>
        </div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Storage (Cloudflare R2)</h2>
        <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Endpoint URL</label><input value={s.storageEndpoint} onChange={e => set({ storageEndpoint: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Bucket Name</label><input value={s.storageBucket} onChange={e => set({ storageBucket: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Max Upload Size (MB)</label><input type="number" value={s.storageMaxUpload} onChange={e => set({ storageMaxUpload: +e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Access Key ID</label><input type="password" value={s.storageAccessKey} onChange={e => set({ storageAccessKey: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Secret Access Key</label><input type="password" value={s.storageSecretKey} onChange={e => set({ storageSecretKey: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Public CDN URL</label><input value={s.storageCdnUrl} onChange={e => set({ storageCdnUrl: e.target.value })} style={inputStyle} placeholder="https://cdn..." /></div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>AI Services</h2>
        <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>OpenAI API Key (Moderation)</label><input type="password" value={s.openaiApiKey} onChange={e => set({ openaiApiKey: e.target.value })} style={inputStyle} placeholder="sk-..." /></div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Google Cloud TTS API Key</label><input type="password" value={s.googleTtsApiKey} onChange={e => set({ googleTtsApiKey: e.target.value })} style={inputStyle} /></div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>TTS Voice Model</label>
          <Select value={s.ttsVoiceModel} onChange={v => set({ ttsVoiceModel: v })} options={['en-US-Neural2-D', 'en-US-Neural2-C', 'en-US-Neural2-F', 'en-US-Neural2-A']} />
        </div>
      </div>
    </>
  );
}

/* ───── SEO & Meta ───── */
function SeoSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>SEO Defaults</h2>
        <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Default Meta Title Template</label><input value={s.seoTitleTemplate} onChange={e => set({ seoTitleTemplate: e.target.value })} style={inputStyle} /></div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Default Meta Description</label><textarea value={s.seoDescription} onChange={e => set({ seoDescription: e.target.value })} rows={2} style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5 }} /></div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Default OG Image URL</label><input value={s.seoOgImage} onChange={e => set({ seoOgImage: e.target.value })} style={inputStyle} placeholder="https://..." /></div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Social Media</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Twitter / X Handle</label><input value={s.socialTwitter} onChange={e => set({ socialTwitter: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Facebook Page</label><input value={s.socialFacebook} onChange={e => set({ socialFacebook: e.target.value })} style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>LinkedIn</label><input value={s.socialLinkedin} onChange={e => set({ socialLinkedin: e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Instagram</label><input value={s.socialInstagram} onChange={e => set({ socialInstagram: e.target.value })} style={inputStyle} /></div>
        </div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Analytics & Tracking</h2>
        <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Google Analytics Measurement ID</label><input value={s.analyticsGaId} onChange={e => set({ analyticsGaId: e.target.value })} style={inputStyle} placeholder="G-XXXXXXXXXX" /></div>
        <div style={{ marginTop: 16 }}><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Custom Head Script</label><textarea value={s.analyticsCustomHead} onChange={e => set({ analyticsCustomHead: e.target.value })} rows={3} style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5, fontFamily: 'monospace', fontSize: '0.78rem' }} placeholder="<!-- Paste tracking scripts here -->" /></div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Sitemap & Robots</h2>
        <SettingRow label="Auto-Generate Sitemap" desc="Automatically update sitemap.xml when articles are published"><Toggle value={s.sitemapAutoGenerate} onChange={v => set({ sitemapAutoGenerate: v })} /></SettingRow>
        <SettingRow label="Index Published Articles" desc="Allow search engines to index article pages"><Toggle value={s.indexArticles} onChange={v => set({ indexArticles: v })} /></SettingRow>
        <SettingRow label="Index Author Profiles" desc="Allow search engines to index public author pages"><Toggle value={s.indexAuthors} onChange={v => set({ indexAuthors: v })} /></SettingRow>
      </div>
    </>
  );
}

/* ───── Advanced ───── */
function AdvancedSection({ s, set }: { s: AppSettings; set: (p: Partial<AppSettings>) => void }) {
  return (
    <>
      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Performance & Caching</h2>
        <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Redis URL</label><input type="password" value={s.redisUrl} onChange={e => set({ redisUrl: e.target.value })} style={inputStyle} placeholder="redis://..." /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Feed Cache TTL (seconds)</label><input type="number" value={s.feedCacheTtl} onChange={e => set({ feedCacheTtl: +e.target.value })} style={inputStyle} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Article Cache TTL (seconds)</label><input type="number" value={s.articleCacheTtl} onChange={e => set({ articleCacheTtl: +e.target.value })} style={inputStyle} /></div>
        </div>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Security</h2>
        <SettingRow label="Rate Limiting" desc="Limit API requests to prevent abuse (100 req/min per IP)"><Toggle value={s.rateLimiting} onChange={v => set({ rateLimiting: v })} /></SettingRow>
        <SettingRow label="CORS Restriction" desc="Only allow requests from known origins"><Toggle value={s.corsRestriction} onChange={v => set({ corsRestriction: v })} /></SettingRow>
        <SettingRow label="Brute Force Protection" desc="Lock account after 5 failed login attempts"><Toggle value={s.bruteForceProtection} onChange={v => set({ bruteForceProtection: v })} /></SettingRow>
        <SettingRow label="Force HTTPS" desc="Redirect all HTTP traffic to HTTPS"><Toggle value={s.forceHttps} onChange={v => set({ forceHttps: v })} /></SettingRow>
      </div>

      <div className="dash-card">
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20 }}>Backups</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Backup Frequency</label><Select value={s.backupFrequency} onChange={v => set({ backupFrequency: v })} options={['6h', 'daily', 'weekly']} style={{ width: '100%' }} /></div>
          <div><label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Retention Period</label><Select value={s.backupRetention} onChange={v => set({ backupRetention: v })} options={['7', '30', '90']} style={{ width: '100%' }} /></div>
        </div>
      </div>

      <div className="dash-card" style={{ borderColor: 'var(--error)' }}>
        <h2 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 20, color: 'var(--error)' }}>Danger Zone</h2>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 20 }}>Irreversible actions that affect the entire platform</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" style={{ padding: '9px 18px', borderRadius: 9, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)' }}>Put Site in Maintenance Mode</button>
          <button className="btn btn-ghost" style={{ padding: '9px 18px', borderRadius: 9, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', color: 'var(--error)', border: '1px solid var(--error)' }}>Export All Data</button>
          <button className="btn btn-danger" style={{ padding: '9px 18px', borderRadius: 9, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--error)', color: 'oklch(98% 0.005 25)', border: 'none' }}>Reset Platform to Defaults</button>
        </div>
      </div>
    </>
  );
}
