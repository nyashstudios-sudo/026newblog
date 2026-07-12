'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export interface AppSettings {
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
  socialTwitter: '@026newsblog', socialFacebook: 'https://facebook.com/026newsblog',
  socialLinkedin: 'https://linkedin.com/company/026newsblog', socialInstagram: '@026newsblog',
  analyticsGaId: '', analyticsCustomHead: '',
  sitemapAutoGenerate: true, indexArticles: true, indexAuthors: true,
  redisUrl: '', feedCacheTtl: 300, articleCacheTtl: 3600,
  rateLimiting: true, corsRestriction: true, bruteForceProtection: true, forceHttps: true,
  backupFrequency: 'daily', backupRetention: '30',
};

const SettingsContext = createContext<AppSettings>(D);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(D);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then((d: any) => {
        const st = d.settings || {};
        setSettings(p => ({
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
          siteUrl: st.site_url || p.siteUrl, supportEmail: st.support_email || p.supportEmail,
          faviconUrl: st.favicon_url || p.faviconUrl,
          defaultLanguage: st.default_language || p.defaultLanguage,
          timezone: st.timezone || p.timezone, dateFormat: st.date_format || p.dateFormat,
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
          minWordCount: st.min_word_count || p.minWordCount, maxTags: st.max_tags || p.maxTags,
          autoGenerateAudio: st.auto_generate_audio ?? p.autoGenerateAudio,
          readingTimeDisplay: st.reading_time_display ?? p.readingTimeDisplay,
          relatedArticles: st.related_articles ?? p.relatedArticles,
          emailApiKey: st.email_api_key || p.emailApiKey,
          emailFrom: st.email_from || p.emailFrom, emailReplyTo: st.email_reply_to || p.emailReplyTo,
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
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
