import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { createSupabaseContext } from '@/lib/supabase/context';

const DEFAULT_SETTINGS = {
  revenue_share_pct: { author: 70, platform: 30 },
  withdrawal_threshold_usd: { amount: 50 },
  site_appearance: { theme: 'default', logoUrl: null },
  moderation: { autoFlag: true, requireReview: false },
};

export const GET = requireRole('admin', async () => {
  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const { data: settings } = await (ctx.supabaseAdmin as any)
    .from('platform_settings')
    .select('*');

  const result: Record<string, unknown> = { ...DEFAULT_SETTINGS };

  (settings || []).forEach((s: any) => {
    result[s.key] = s.value;
  });

  return NextResponse.json({ settings: result });
});

export const PATCH = requireRole('admin', async (req, admin) => {
  const body = await req.json();

  const allowedKeys = [
    'revenue_share_pct', 'withdrawal_threshold_usd', 'site_appearance', 'moderation',
    'site_title', 'site_description', 'enable_registration', 'enable_comments',
    'enable_chat', 'require_email_verification', 'content_per_page',
    'breaking_news_ticker', 'auto_approve',
    'site_url', 'support_email', 'favicon_url',
    'default_language', 'timezone', 'date_format', 'currency_display',
    'enable_google_oauth', 'enable_github_oauth', 'invite_only_mode',
    'hero_slideshow', 'trending_sidebar', 'newsletter_widget', 'rss_feed_section', 'chat_widget',
    'primary_color', 'accent_color', 'default_theme',
    'hero_slideshow_interval', 'default_feed_tab',
    'payout_processing_time',
    'mpesa_environment', 'mpesa_shortcode', 'mpesa_consumer_key', 'mpesa_consumer_secret', 'mpesa_passkey', 'mpesa_callback_url',
    'ad_sponsored_article', 'ad_display_ads', 'ad_newsletter_sponsor', 'ad_homepage_feature',
    'allow_self_publishing',
    'moderation_external_links', 'moderation_community_reports', 'moderation_auto_hide', 'moderation_profanity_filter', 'moderation_ai_threshold',
    'min_word_count', 'max_tags', 'auto_generate_audio', 'reading_time_display', 'related_articles',
    'email_api_key', 'email_from', 'email_reply_to',
    'storage_endpoint', 'storage_bucket', 'storage_access_key', 'storage_secret_key', 'storage_cdn_url', 'storage_max_upload',
    'openai_api_key', 'google_tts_api_key', 'tts_voice_model',
    'seo_title_template', 'seo_description', 'seo_og_image',
    'social_twitter', 'social_facebook', 'social_linkedin', 'social_instagram',
    'analytics_ga_id', 'analytics_custom_head',
    'sitemap_auto_generate', 'index_articles', 'index_authors',
    'redis_url', 'feed_cache_ttl', 'article_cache_ttl',
    'rate_limiting', 'cors_restriction', 'brute_force_protection', 'force_https',
    'backup_frequency', 'backup_retention',
  ];
  const updates = Object.entries(body).filter(([key]) => allowedKeys.includes(key));

  const { data: ctx } = await createSupabaseContext({ auth: 'secret' });
  if (!ctx) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const sb = ctx.supabaseAdmin as any;

  await Promise.all(
    updates.map(([key, value]) =>
      sb.from('platform_settings').upsert(
        { key, value: value as object, updated_by: admin.id },
        { onConflict: 'key' },
      )
    )
  );

  return NextResponse.json({ success: true });
});
