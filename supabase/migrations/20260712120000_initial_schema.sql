-- 026Newsblog Supabase Schema Migration
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Drop existing objects for a clean re-run (safe because there's no production data yet)
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.increment_article_views(uuid) cascade;
drop function if exists public.increment_comment_count(uuid) cascade;
drop function if exists public.increment_follower_count(uuid) cascade;
drop function if exists public.find_conversation_between(uuid, uuid) cascade;

drop table if exists public.security_events cascade;
drop table if exists public.reading_goals cascade;
drop table if exists public.reading_streaks cascade;
drop table if exists public.reading_sessions cascade;
drop table if exists public.rss_items cascade;
drop table if exists public.rss_feeds cascade;
drop table if exists public.moderation_queue cascade;
drop table if exists public.earnings cascade;
drop table if exists public.payouts cascade;
drop table if exists public.notification_preferences cascade;
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversation_participants cascade;
drop table if exists public.conversations cascade;
drop table if exists public.user_interests cascade;
drop table if exists public.follows cascade;
drop table if exists public.comment_likes cascade;
drop table if exists public.comments cascade;
drop table if exists public.article_views cascade;
drop table if exists public.article_saves cascade;
drop table if exists public.article_likes cascade;
drop table if exists public.article_audio cascade;
drop table if exists public.articles cascade;
drop table if exists public.categories cascade;
drop table if exists public.author_profiles cascade;
drop table if exists public.author_applications cascade;
drop table if exists public.oauth_accounts cascade;
drop table if exists public.user_pins cascade;
drop table if exists public.platform_settings cascade;
drop table if exists public.users cascade;

-- Enable uuid-ossp for UUID generation


-- ============================================
-- ENUMS
-- ============================================
do $$ begin
  create type user_role as enum ('reader', 'author', 'admin');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type author_status as enum ('pending', 'approved', 'rejected', 'suspended');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type article_status as enum ('draft', 'in_review', 'published', 'unpublished', 'archived');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type notification_type as enum ('like', 'comment', 'reply', 'follow', 'publish', 'mention', 'system', 'earning');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type payout_status as enum ('pending', 'processing', 'completed', 'failed');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type moderation_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type moderation_type as enum ('comment', 'article', 'spam');
exception
  when duplicate_object then null;
end $$;
do $$ begin
  create type feed_status as enum ('active', 'paused', 'error');
exception
  when duplicate_object then null;
end $$;

-- ============================================
-- USERS (profiles, references auth.users)
-- ============================================
create table public.users (
  id            uuid        primary key references auth.users(id) on delete cascade,
  email         text        not null,
  first_name    text        not null default '',
  last_name     text        not null default '',
  username      text        unique not null,
  avatar_url    text,
  bio           text,
  website       text,
  role          user_role   not null default 'reader'::user_role,
  is_verified   boolean     not null default false,
  is_active     boolean     not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
alter table public.users enable row level security;

create policy "Users can read any profile"
  on public.users for select
  using (true);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, username, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      'user_' || substr(md5(new.id::text), 1, 8)
    ),
    coalesce(new.raw_user_meta_data ->> 'firstName', ''),
    coalesce(new.raw_user_meta_data ->> 'lastName', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- OAUTH ACCOUNTS
-- ============================================
create table public.oauth_accounts (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references public.users(id) on delete cascade,
  provider             text        not null,
  provider_account_id  text        not null,
  access_token         text,
  refresh_token        text,
  expires_at           timestamptz,
  created_at           timestamptz not null default now(),
  unique(provider, provider_account_id)
);
alter table public.oauth_accounts enable row level security;

create policy "Users can read own OAuth accounts"
  on public.oauth_accounts for select
  using (auth.uid() = user_id);

-- ============================================
-- AUTHOR APPLICATIONS
-- ============================================
create table public.author_applications (
  id                  uuid           primary key default gen_random_uuid(),
  user_id             uuid           unique not null references public.users(id) on delete cascade,
  professional_title  text,
  writing_niche       text,
  years_experience    text,
  portfolio_url       text,
  linkedin_url        text,
  motivation          text,
  sample_files        jsonb          not null default '[]'::jsonb,
  status              author_status  not null default 'pending'::author_status,
  reviewed_by         uuid           references public.users(id),
  reviewed_at         timestamptz,
  rejection_reason    text,
  created_at          timestamptz    not null default now()
);
alter table public.author_applications enable row level security;

create policy "Users can read own application"
  on public.author_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own application"
  on public.author_applications for insert
  with check (auth.uid() = user_id);

create policy "Admins can read all applications"
  on public.author_applications for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update applications"
  on public.author_applications for update
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- AUTHOR PROFILES
-- ============================================
create table public.author_profiles (
  user_id            uuid        primary key references public.users(id) on delete cascade,
  display_name       text,
  tagline            text,
  topics             text        not null default '[]',
  pinned_article_id  uuid,
  total_views        bigint      not null default 0,
  total_likes        bigint      not null default 0,
  total_followers    int         not null default 0,
  revenue_share_pct  real        not null default 70.00,
  mpesa_phone        text,
  created_at         timestamptz not null default now()
);
alter table public.author_profiles enable row level security;

create policy "Anyone can read author profiles"
  on public.author_profiles for select
  using (true);

create policy "Authors can update own profile"
  on public.author_profiles for update
  using (auth.uid() = user_id);

-- ============================================
-- CATEGORIES
-- ============================================
create table public.categories (
  id             uuid        primary key default gen_random_uuid(),
  name           text        unique not null,
  slug           text        unique not null,
  description    text,
  icon           text,
  article_count  int         not null default 0,
  created_at     timestamptz not null default now()
);
alter table public.categories enable row level security;

create policy "Anyone can read categories"
  on public.categories for select
  using (true);

-- ============================================
-- ARTICLES
-- ============================================
create table public.articles (
  id                   uuid            primary key default gen_random_uuid(),
  author_id            uuid            not null references public.users(id) on delete cascade,
  title                text            not null,
  subtitle             text,
  slug                 text            unique not null,
  content              jsonb           not null default '{}'::jsonb,
  content_html         text,
  excerpt              text,
  cover_image_url      text,
  cover_image_caption  text,
  category_id          uuid            references public.categories(id),
  tags                 text            not null default '[]',
  status               article_status  not null default 'draft'::article_status,
  meta_description     text,
  reading_time_minutes int,
  word_count           int,
  view_count           bigint          not null default 0,
  like_count           int             not null default 0,
  comment_count        int             not null default 0,
  share_count          int             not null default 0,
  is_featured          boolean         not null default false,
  published_at         timestamptz,
  scheduled_at         timestamptz,
  created_at           timestamptz     not null default now(),
  updated_at           timestamptz     not null default now()
);
create index idx_articles_category_id on public.articles(category_id);
create index idx_articles_author_id on public.articles(author_id);
create index idx_articles_published_at on public.articles(published_at desc);
alter table public.articles enable row level security;

create policy "Anyone can read published articles"
  on public.articles for select
  using (status = 'published' or author_id = auth.uid() or (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  ));

create policy "Authors can insert articles"
  on public.articles for insert
  with check (author_id = auth.uid());

create policy "Authors can update own articles"
  on public.articles for update
  using (author_id = auth.uid());

create policy "Admins can update any article"
  on public.articles for update
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- ARTICLE LIKES
-- ============================================
create table public.article_likes (
  user_id    uuid        not null references public.users(id) on delete cascade,
  article_id uuid        not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);
alter table public.article_likes enable row level security;

create policy "Anyone can read likes"
  on public.article_likes for select
  using (true);

create policy "Users can manage own likes"
  on public.article_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own likes"
  on public.article_likes for delete
  using (auth.uid() = user_id);

-- ============================================
-- ARTICLE SAVES
-- ============================================
create table public.article_saves (
  user_id    uuid        not null references public.users(id) on delete cascade,
  article_id uuid        not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);
alter table public.article_saves enable row level security;

create policy "Anyone can read saves"
  on public.article_saves for select
  using (true);

create policy "Users can manage own saves"
  on public.article_saves for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saves"
  on public.article_saves for delete
  using (auth.uid() = user_id);

-- ============================================
-- ARTICLE VIEWS
-- ============================================
create table public.article_views (
  id                   uuid        primary key default gen_random_uuid(),
  article_id           uuid        not null references public.articles(id) on delete cascade,
  user_id              uuid        references public.users(id),
  session_id           text,
  ip_address           text,
  read_duration_seconds int,
  scroll_depth_pct     int,
  created_at           timestamptz not null default now()
);
create index idx_article_views_article on public.article_views(article_id, created_at desc);
alter table public.article_views enable row level security;

create policy "Anyone can insert views"
  on public.article_views for insert
  with check (true);

-- ============================================
-- COMMENTS
-- ============================================
create table public.comments (
  id                uuid              primary key default gen_random_uuid(),
  article_id        uuid              not null references public.articles(id) on delete cascade,
  user_id           uuid              not null references public.users(id) on delete cascade,
  parent_id         uuid              references public.comments(id) on delete cascade,
  content           text              not null,
  like_count        int               not null default 0,
  is_flagged        boolean           not null default false,
  moderation_status moderation_status not null default 'approved'::moderation_status,
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now()
);
create index idx_comments_article on public.comments(article_id, created_at);
alter table public.comments enable row level security;

create policy "Anyone can read approved comments"
  on public.comments for select
  using (moderation_status = 'approved' or user_id = auth.uid());

create policy "Users can insert comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id);

-- ============================================
-- COMMENT LIKES
-- ============================================
create table public.comment_likes (
  user_id    uuid        not null references public.users(id) on delete cascade,
  comment_id uuid        not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);
alter table public.comment_likes enable row level security;

create policy "Users can manage own comment likes"
  on public.comment_likes for all
  using (auth.uid() = user_id);

-- ============================================
-- FOLLOWS
-- ============================================
create table public.follows (
  follower_id  uuid        not null references public.users(id) on delete cascade,
  following_id uuid        not null references public.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id)
);
alter table public.follows enable row level security;

create policy "Anyone can read follows"
  on public.follows for select
  using (true);

create policy "Users can manage own follows"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can delete own follows"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================
-- USER INTERESTS
-- ============================================
create table public.user_interests (
  user_id     uuid        not null references public.users(id) on delete cascade,
  category_id uuid        not null references public.categories(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, category_id)
);
alter table public.user_interests enable row level security;

create policy "Users can manage own interests"
  on public.user_interests for all
  using (auth.uid() = user_id);

-- ============================================
-- CONVERSATIONS
-- ============================================
create table public.conversations (
  id         uuid        primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.conversations enable row level security;

-- ============================================
-- CONVERSATION PARTICIPANTS
-- ============================================
create table public.conversation_participants (
  conversation_id uuid        not null references public.conversations(id) on delete cascade,
  user_id         uuid        not null references public.users(id) on delete cascade,
  last_read_at    timestamptz,
  primary key (conversation_id, user_id)
);
alter table public.conversation_participants enable row level security;

create policy "Participants can read"
  on public.conversation_participants for select
  using (user_id = auth.uid());

create policy "Participants can read conversations"
  on public.conversations for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = id and user_id = auth.uid()
    )
  );

-- ============================================
-- MESSAGES
-- ============================================
create table public.messages (
  id                uuid        primary key default gen_random_uuid(),
  conversation_id   uuid        not null references public.conversations(id) on delete cascade,
  sender_id         uuid        not null references public.users(id) on delete cascade,
  content           text        not null,
  attachment_url    text,
  shared_article_id uuid        references public.articles(id),
  is_read           boolean     not null default false,
  created_at        timestamptz not null default now()
);
create index idx_messages_conversation on public.messages(conversation_id, created_at desc);
alter table public.messages enable row level security;

create policy "Participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

create policy "Participants can insert messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.conversation_participants
      where conversation_id = messages.conversation_id and user_id = auth.uid()
    )
  );

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id         uuid              primary key default gen_random_uuid(),
  user_id    uuid              not null references public.users(id) on delete cascade,
  type       notification_type not null,
  title      text,
  content    text,
  actor_id   uuid              references public.users(id) on delete set null,
  article_id uuid              references public.articles(id) on delete cascade,
  comment_id uuid              references public.comments(id) on delete cascade,
  is_read    boolean           not null default false,
  created_at timestamptz       not null default now()
);
create index idx_notifications_user on public.notifications(user_id, created_at desc);
alter table public.notifications enable row level security;

create policy "Users can read own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ============================================
-- NOTIFICATION PREFERENCES
-- ============================================
create table public.notification_preferences (
  user_id            uuid    primary key references public.users(id) on delete cascade,
  daily_digest       boolean not null default true,
  push_notifications boolean not null default true,
  comment_replies    boolean not null default true,
  new_followers      boolean not null default false,
  likes_on_comments  boolean not null default false,
  weekly_recap       boolean not null default true,
  author_publishes   boolean not null default true
);
alter table public.notification_preferences enable row level security;

create policy "Users can manage own preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id);

-- ============================================
-- EARNINGS
-- ============================================
create table public.earnings (
  id           uuid        primary key default gen_random_uuid(),
  author_id    uuid        not null references public.users(id) on delete cascade,
  article_id   uuid        not null references public.articles(id) on delete cascade,
  amount_usd   real        not null,
  source       text        not null,
  period_start timestamptz not null,
  period_end   timestamptz not null,
  created_at   timestamptz not null default now()
);
create index idx_earnings_author on public.earnings(author_id, created_at desc);
alter table public.earnings enable row level security;

create policy "Authors can read own earnings"
  on public.earnings for select
  using (auth.uid() = author_id);

-- ============================================
-- PAYOUTS
-- ============================================
create table public.payouts (
  id                  uuid          primary key default gen_random_uuid(),
  author_id           uuid          not null references public.users(id) on delete cascade,
  amount_usd          real          not null,
  amount_kes          real          not null,
  exchange_rate       real          not null,
  fee_usd             real          not null default 0,
  mpesa_phone         text          not null,
  mpesa_transaction_id text,
  status              payout_status not null default 'pending'::payout_status,
  processed_at        timestamptz,
  failed_reason       text,
  created_at          timestamptz   not null default now()
);
create index idx_payouts_author on public.payouts(author_id, created_at desc);
alter table public.payouts enable row level security;

create policy "Authors can read own payouts"
  on public.payouts for select
  using (auth.uid() = author_id);

-- ============================================
-- MODERATION QUEUE
-- ============================================
create table public.moderation_queue (
  id              uuid              primary key default gen_random_uuid(),
  type            moderation_type   not null,
  content_id      text              not null,
  reported_by     text              not null default '[]',
  reason          text,
  ai_confidence   real,
  ai_category     text,
  status          moderation_status not null default 'pending'::moderation_status,
  moderated_by    uuid              references public.users(id),
  moderated_at    timestamptz,
  action_taken    text,
  created_at      timestamptz       not null default now()
);
alter table public.moderation_queue enable row level security;

create policy "Admins can read moderation queue"
  on public.moderation_queue for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update moderation queue"
  on public.moderation_queue for update
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- RSS FEEDS
-- ============================================
create table public.rss_feeds (
  id                       uuid        primary key default gen_random_uuid(),
  name                     text        not null,
  url                      text        unique not null,
  category_id              uuid        references public.categories(id),
  refresh_interval_minutes int         not null default 60,
  status                   feed_status not null default 'active'::feed_status,
  last_fetched_at          timestamptz,
  last_error               text,
  items_today              int         not null default 0,
  total_items_imported     int         not null default 0,
  created_at               timestamptz not null default now()
);
alter table public.rss_feeds enable row level security;

create policy "Anyone can read RSS feeds"
  on public.rss_feeds for select
  using (true);

create policy "Admins can manage RSS feeds"
  on public.rss_feeds for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- RSS ITEMS
-- ============================================
create table public.rss_items (
  id           uuid        primary key default gen_random_uuid(),
  feed_id      uuid        not null references public.rss_feeds(id) on delete cascade,
  guid         text        not null,
  title        text        not null,
  url          text        not null,
  description  text,
  author       text,
  published_at timestamptz,
  imported_at  timestamptz not null default now(),
  unique(feed_id, guid)
);
create index idx_rss_items_imported on public.rss_items(imported_at desc);
alter table public.rss_items enable row level security;

create policy "Anyone can read RSS items"
  on public.rss_items for select
  using (true);

-- ============================================
-- READING SESSIONS
-- ============================================
create table public.reading_sessions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.users(id) on delete cascade,
  article_id       uuid        not null references public.articles(id) on delete cascade,
  duration_seconds int         not null,
  completed        boolean     not null default false,
  created_at       timestamptz not null default now()
);
create index idx_reading_sessions_user on public.reading_sessions(user_id, created_at desc);
alter table public.reading_sessions enable row level security;

create policy "Users can manage own reading sessions"
  on public.reading_sessions for all
  using (auth.uid() = user_id);

-- ============================================
-- READING STREAKS
-- ============================================
create table public.reading_streaks (
  user_id       uuid        primary key references public.users(id) on delete cascade,
  current_streak int        not null default 0,
  longest_streak int        not null default 0,
  last_read_date timestamptz,
  updated_at     timestamptz not null default now()
);
alter table public.reading_streaks enable row level security;

create policy "Users can manage own streak"
  on public.reading_streaks for all
  using (auth.uid() = user_id);

-- ============================================
-- READING GOALS
-- ============================================
create table public.reading_goals (
  user_id          uuid primary key references public.users(id) on delete cascade,
  daily_articles   int not null default 5,
  weekly_minutes   int not null default 120,
  weekly_comments  int not null default 10,
  weekly_new_topics int not null default 3
);
alter table public.reading_goals enable row level security;

create policy "Users can manage own goals"
  on public.reading_goals for all
  using (auth.uid() = user_id);

-- ============================================
-- ARTICLE AUDIO
-- ============================================
create table public.article_audio (
  id               uuid        primary key default gen_random_uuid(),
  article_id       uuid        unique not null references public.articles(id) on delete cascade,
  audio_url        text        not null,
  duration_seconds int         not null,
  generated_at     timestamptz not null default now(),
  voice_model      text        not null default 'en-US-Neural2-D'
);
alter table public.article_audio enable row level security;

create policy "Anyone can read article audio"
  on public.article_audio for select
  using (true);

-- ============================================
-- PLATFORM SETTINGS
-- ============================================
create table public.platform_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_by uuid        references public.users(id),
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;

create policy "Admins can read settings"
  on public.platform_settings for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update settings"
  on public.platform_settings for all
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- SECURITY EVENTS
-- ============================================
create table public.security_events (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        references public.users(id) on delete set null,
  event_type text        not null,
  ip_address text,
  metadata   jsonb,
  created_at timestamptz not null default now()
);
create index idx_security_events_created on public.security_events(created_at desc);

-- ============================================
-- RPC FUNCTIONS
-- ============================================

-- Increment article view count (for public article GET)
create or replace function increment_article_view(article_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.articles set view_count = view_count + 1 where id = article_id;
end;
$$;

-- Increment article like count
create or replace function increment_article_like(article_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.articles set like_count = like_count + 1 where id = article_id;
end;
$$;

-- Decrement article like count
create or replace function decrement_article_like(article_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.articles set like_count = greatest(like_count - 1, 0) where id = article_id;
end;
$$;

-- Increment article comment count
create or replace function increment_comment_count(article_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.articles set comment_count = comment_count + 1 where id = article_id;
end;
$$;

-- Find conversation between two users
create or replace function find_conversation_between(user_a uuid, user_b uuid)
returns table(conversation_id uuid)
language sql security definer as $$
  select cp1.conversation_id
  from conversation_participants cp1
  join conversation_participants cp2 on cp2.conversation_id = cp1.conversation_id
  where cp1.user_id = user_a and cp2.user_id = user_b
  limit 1;
$$;
alter table public.security_events enable row level security;

create policy "Admins can read security events"
  on public.security_events for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ============================================
-- USER PINS (2FA)
-- ============================================
create table public.user_pins (
  user_id    uuid        primary key references public.users(id) on delete cascade,
  pin_hash   text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_pins enable row level security;

create policy "Users can manage own pin"
  on public.user_pins for all
  using (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR FULL-TEXT SEARCH
-- ============================================
create index idx_articles_search on public.articles
  using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '')));

create index idx_users_search on public.users
  using gin(to_tsvector('english', coalesce(username, '') || ' ' || coalesce(first_name, '') || ' ' || coalesce(last_name, '')));


