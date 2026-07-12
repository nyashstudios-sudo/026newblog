-- 026Newsblog Database Triggers
-- Run this in Supabase SQL Editor after the initial schema migration

-- ============================================
-- UPDATED_AT TIMESTAMP TRIGGERS
-- ============================================

create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to tables with updated_at column
drop trigger if exists trigger_users_updated_at on public.users;
create trigger trigger_users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_articles_updated_at on public.articles;
create trigger trigger_articles_updated_at
  before update on public.articles
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_comments_updated_at on public.comments;
create trigger trigger_comments_updated_at
  before update on public.comments
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_conversations_updated_at on public.conversations;
create trigger trigger_conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_author_profiles_updated_at on public.author_profiles;
create trigger trigger_author_profiles_updated_at
  before update on public.author_profiles
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_user_pins_updated_at on public.user_pins;
create trigger trigger_user_pins_updated_at
  before update on public.user_pins
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_reading_streaks_updated_at on public.reading_streaks;
create trigger trigger_reading_streaks_updated_at
  before update on public.reading_streaks
  for each row execute function public.update_updated_at_column();

drop trigger if exists trigger_platform_settings_updated_at on public.platform_settings;
create trigger trigger_platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.update_updated_at_column();


-- ============================================
-- CATEGORY ARTICLE COUNT TRIGGERS
-- ============================================

create or replace function public.update_category_article_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    if new.status = 'published' and new.category_id is not null then
      update public.categories set article_count = article_count + 1 where id = new.category_id;
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    -- Published -> Unpublished/Archived
    if old.status = 'published' and new.status != 'published' and old.category_id is not null then
      update public.categories set article_count = greatest(article_count - 1, 0) where id = old.category_id;
    -- Unpublished -> Published
    elsif old.status != 'published' and new.status = 'published' and new.category_id is not null then
      update public.categories set article_count = article_count + 1 where id = new.category_id;
    -- Category changed while published
    elsif old.status = 'published' and new.status = 'published' and old.category_id is distinct from new.category_id then
      if old.category_id is not null then
        update public.categories set article_count = greatest(article_count - 1, 0) where id = old.category_id;
      end if;
      if new.category_id is not null then
        update public.categories set article_count = article_count + 1 where id = new.category_id;
      end if;
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.status = 'published' and old.category_id is not null then
      update public.categories set article_count = greatest(article_count - 1, 0) where id = old.category_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_articles_category_count on public.articles;
create trigger trigger_articles_category_count
  after insert or update or delete on public.articles
  for each row execute function public.update_category_article_count();


-- ============================================
-- COMMENT COUNT TRIGGERS
-- ============================================

create or replace function public.update_article_comment_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    if new.moderation_status = 'approved' then
      update public.articles set comment_count = comment_count + 1 where id = new.article_id;
    end if;
    return new;
  elsif TG_OP = 'UPDATE' then
    -- Approved -> Not approved
    if old.moderation_status = 'approved' and new.moderation_status != 'approved' then
      update public.articles set comment_count = greatest(comment_count - 1, 0) where id = old.article_id;
    -- Not approved -> Approved
    elsif old.moderation_status != 'approved' and new.moderation_status = 'approved' then
      update public.articles set comment_count = comment_count + 1 where id = new.article_id;
    -- Article changed
    elsif old.article_id is distinct from new.article_id then
      if old.moderation_status = 'approved' then
        update public.articles set comment_count = greatest(comment_count - 1, 0) where id = old.article_id;
      end if;
      if new.moderation_status = 'approved' then
        update public.articles set comment_count = comment_count + 1 where id = new.article_id;
      end if;
    end if;
    return new;
  elsif TG_OP = 'DELETE' then
    if old.moderation_status = 'approved' then
      update public.articles set comment_count = greatest(comment_count - 1, 0) where id = old.article_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_comments_article_count on public.comments;
create trigger trigger_comments_article_count
  after insert or update or delete on public.comments
  for each row execute function public.update_article_comment_count();


-- ============================================
-- COMMENT LIKE COUNT TRIGGERS
-- ============================================

create or replace function public.update_comment_like_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.comments set like_count = like_count + 1 where id = new.comment_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.comments set like_count = greatest(like_count - 1, 0) where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_comment_likes_count on public.comment_likes;
create trigger trigger_comment_likes_count
  after insert or delete on public.comment_likes
  for each row execute function public.update_comment_like_count();


-- ============================================
-- FOLLOWER COUNT TRIGGERS
-- ============================================

create or replace function public.update_follower_counts()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.author_profiles set total_followers = total_followers + 1 where user_id = new.following_id;
    return new;
  elsif TG_OP = 'DELETE' then
    update public.author_profiles set total_followers = greatest(total_followers - 1, 0) where user_id = old.following_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trigger_follows_counts on public.follows;
create trigger trigger_follows_counts
  after insert or delete on public.follows
  for each row execute function public.update_follower_counts();


-- ============================================
-- CONVERSATION UPDATED_AT ON NEW MESSAGE
-- ============================================

create or replace function public.update_conversation_timestamp()
returns trigger language plpgsql as $$
begin
  update public.conversations set updated_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trigger_messages_conversation_updated on public.messages;
create trigger trigger_messages_conversation_updated
  after insert on public.messages
  for each row execute function public.update_conversation_timestamp();


-- ============================================
-- AUTO-CREATE AUTHOR PROFILE ON ROLE CHANGE
-- ============================================

create or replace function public.ensure_author_profile()
returns trigger language plpgsql as $$
begin
  if new.role = 'author' and old.role is distinct from 'author' then
    insert into public.author_profiles (user_id, display_name)
    values (new.id, coalesce(new.first_name || ' ' || new.last_name, new.username))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_users_role_change on public.users;
create trigger trigger_users_role_change
  after update on public.users
  for each row
  when (old.role is distinct from new.role)
  execute function public.ensure_author_profile();


-- ============================================
-- READING STREAKS ON ARTICLE VIEW
-- ============================================

create or replace function public.update_reading_streak()
returns trigger language plpgsql as $$
declare
  v_streak public.reading_streaks%rowtype;
  v_today date := current_date;
  v_yesterday date := current_date - interval '1 day';
begin
  if new.read_duration_seconds is not null and new.read_duration_seconds >= 30 then
    insert into public.reading_streaks (user_id, current_streak, longest_streak, last_read_date)
    values (new.user_id, 1, 1, v_today)
    on conflict (user_id) do update set
      current_streak = case
        when reading_streaks.last_read_date = v_yesterday then reading_streaks.current_streak + 1
        when reading_streaks.last_read_date = v_today then reading_streaks.current_streak
        else 1
      end,
      longest_streak = greatest(
        reading_streaks.longest_streak,
        case
          when reading_streaks.last_read_date = v_yesterday then reading_streaks.current_streak + 1
          when reading_streaks.last_read_date = v_today then reading_streaks.current_streak
          else 1
        end
      ),
      last_read_date = v_today,
      updated_at = now()
    where reading_streaks.user_id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_article_views_reading_streak on public.article_views;
create trigger trigger_article_views_reading_streak
  after insert on public.article_views
  for each row
  when (new.user_id is not null)
  execute function public.update_reading_streak();


-- ============================================
-- NOTIFICATION TRIGGERS
-- ============================================

-- Notify on article like
create or replace function public.notify_article_like()
returns trigger language plpgsql as $$
declare
  v_article public.articles%rowtype;
begin
  if TG_OP = 'INSERT' then
    select * into v_article from public.articles where id = new.article_id;
    if v_article.author_id != new.user_id then
      insert into public.notifications (user_id, type, title, content, actor_id, article_id)
      values (v_article.author_id, 'like',
        'Someone liked your article',
        (select first_name || ' ' || last_name from public.users where id = new.user_id) || ' liked "' || v_article.title || '"',
        new.user_id, v_article.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_notify_article_like on public.article_likes;
create trigger trigger_notify_article_like
  after insert on public.article_likes
  for each row execute function public.notify_article_like();


-- Notify on comment
create or replace function public.notify_comment()
returns trigger language plpgsql as $$
declare
  v_article public.articles%rowtype;
  v_parent_comment public.comments%rowtype;
begin
  if TG_OP = 'INSERT' and new.moderation_status = 'approved' then
    select * into v_article from public.articles where id = new.article_id;

    -- Notify article author (if not self-comment)
    if v_article.author_id != new.user_id then
      insert into public.notifications (user_id, type, title, content, actor_id, article_id, comment_id)
      values (v_article.author_id, 'comment',
        'New comment on your article',
        (select first_name || ' ' || last_name from public.users where id = new.user_id) || ' commented on "' || v_article.title || '"',
        new.user_id, v_article.id, new.id);
    end if;

    -- Notify parent comment author (reply)
    if new.parent_id is not null then
      select * into v_parent_comment from public.comments where id = new.parent_id;
      if v_parent_comment.user_id != new.user_id and v_parent_comment.user_id != v_article.author_id then
        insert into public.notifications (user_id, type, title, content, actor_id, article_id, comment_id)
        values (v_parent_comment.user_id, 'reply',
          'Someone replied to your comment',
          (select first_name || ' ' || last_name from public.users where id = new.user_id) || ' replied to your comment',
          new.user_id, v_article.id, new.id);
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_notify_comment on public.comments;
create trigger trigger_notify_comment
  after insert on public.comments
  for each row execute function public.notify_comment();


-- Notify on follow
create or replace function public.notify_follow()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.notifications (user_id, type, title, content, actor_id)
    values (new.following_id, 'follow',
      'New follower',
      (select first_name || ' ' || last_name from public.users where id = new.follower_id) || ' started following you',
      new.follower_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_notify_follow on public.follows;
create trigger trigger_notify_follow
  after insert on public.follows
  for each row execute function public.notify_follow();


-- Notify on article publish (to followers)
create or replace function public.notify_article_publish()
returns trigger language plpgsql as $$
declare
  v_follower uuid;
begin
  if TG_OP = 'UPDATE' and old.status != 'published' and new.status = 'published' then
    for v_follower in
      select follower_id from public.follows where following_id = new.author_id
    loop
      insert into public.notifications (user_id, type, title, content, actor_id, article_id)
      values (v_follower.follower_id, 'publish',
        'New article from someone you follow',
        (select first_name || ' ' || last_name from public.users where id = new.author_id) || ' published "' || new.title || '"',
        new.author_id, new.id);
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_notify_article_publish on public.articles;
create trigger trigger_notify_article_publish
  after update on public.articles
  for each row execute function public.notify_article_publish();


-- Notify on comment like
create or replace function public.notify_comment_like()
returns trigger language plpgsql as $$
declare
  v_comment public.comments%rowtype;
begin
  if TG_OP = 'INSERT' then
    select * into v_comment from public.comments where id = new.comment_id;
    if v_comment.user_id != new.user_id then
      insert into public.notifications (user_id, type, title, content, actor_id, article_id, comment_id)
      values (v_comment.user_id, 'like',
        'Someone liked your comment',
        (select first_name || ' ' || last_name from public.users where id = new.user_id) || ' liked your comment',
        new.user_id, v_comment.article_id, v_comment.id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_notify_comment_like on public.comment_likes;
create trigger trigger_notify_comment_like
  after insert on public.comment_likes
  for each row execute function public.notify_comment_like();


-- ============================================
-- AUTHOR PROFILE STATS AGGREGATION
-- ============================================

create or replace function public.refresh_author_stats(p_user_id uuid)
returns void language plpgsql as $$
declare
  v_views bigint;
  v_likes bigint;
begin
  select coalesce(sum(view_count), 0), coalesce(sum(like_count), 0)
  into v_views, v_likes
  from public.articles where author_id = p_user_id;

  update public.author_profiles
  set total_views = v_views,
      total_likes = v_likes
  where user_id = p_user_id;
end;
$$;

create or replace function public.update_author_stats_on_article()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    perform public.refresh_author_stats(new.author_id);
  elsif TG_OP = 'DELETE' then
    perform public.refresh_author_stats(old.author_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_articles_author_stats on public.articles;
create trigger trigger_articles_author_stats
  after insert or update or delete on public.articles
  for each row execute function public.update_author_stats_on_article();


-- Trigger to update author stats when article view/like counts change
create or replace function public.update_author_stats_on_counts()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'UPDATE' then
    if old.view_count is distinct from new.view_count or old.like_count is distinct from new.like_count then
      perform public.refresh_author_stats(new.author_id);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_articles_counts_author_stats on public.articles;
create trigger trigger_articles_counts_author_stats
  after update on public.articles
  for each row
  when (old.view_count is distinct from new.view_count or old.like_count is distinct from new.like_count)
  execute function public.update_author_stats_on_counts();


-- ============================================
-- SECURITY EVENT LOGGING
-- ============================================

create or replace function public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_ip_address text default null,
  p_metadata jsonb default null
)
returns void language plpgsql security definer as $$
begin
  insert into public.security_events (user_id, event_type, ip_address, metadata)
  values (p_user_id, p_event_type, p_ip_address, p_metadata);
end;
$$;


-- ============================================
-- CLEANUP OLD NOTIFICATIONS (run via pg_cron)
-- ============================================

create or replace function public.cleanup_old_notifications()
returns void language plpgsql as $$
begin
  delete from public.notifications
  where created_at < now() - interval '90 days'
  and is_read = true;
end;
$$;


-- ============================================
-- CLEANUP OLD SECURITY EVENTS (run via pg_cron)
-- ============================================

create or replace function public.cleanup_old_security_events()
returns void language plpgsql as $$
begin
  delete from public.security_events
  where created_at < now() - interval '1 year';
end;
$$;


-- ============================================
-- REFRESH RSS FEED ITEMS COUNT (run via pg_cron)
-- ============================================

create or replace function public.refresh_rss_feed_counts()
returns void language plpgsql as $$
begin
  update public.rss_feeds rf
  set total_items_imported = (
    select count(*) from public.rss_items ri where ri.feed_id = rf.id
  ),
  items_today = (
    select count(*) from public.rss_items ri
    where ri.feed_id = rf.id and ri.imported_at >= current_date
  );
end;
$$;