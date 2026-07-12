-- 026Newsblog Contact Messages Table
-- Run this in Supabase SQL Editor

-- ============================================
-- CONTACT MESSAGES TABLE
-- ============================================

create table public.contact_messages (
  id                 uuid        primary key default gen_random_uuid(),
  first_name         text        not null,
  last_name          text        not null,
  email              text        not null,
  subject            text        not null,
  message            text        not null,
  ip_address         text,
  user_agent         text,
  status             text        not null default 'unread' check (status in ('unread', 'read', 'replied', 'archived')),
  admin_notes        text,
  replied_at         timestamptz,
  replied_by         uuid        references public.users(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_contact_messages_status on public.contact_messages(status);
create index idx_contact_messages_created_at on public.contact_messages(created_at desc);
create index idx_contact_messages_email on public.contact_messages(email);

alter table public.contact_messages enable row level security;

create policy "Admins can read contact messages"
  on public.contact_messages for select
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update contact messages"
  on public.contact_messages for update
  using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Anyone can insert contact messages"
  on public.contact_messages for insert
  with check (true);

-- Updated at trigger
drop trigger if exists trigger_contact_messages_updated_at on public.contact_messages;
create trigger trigger_contact_messages_updated_at
  before update on public.contact_messages
  for each row execute function public.update_updated_at_column();


-- ============================================
-- RPC FUNCTIONS FOR ADMIN
-- ============================================

create or replace function public.get_contact_messages(
  p_status text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  first_name text,
  last_name text,
  email text,
  subject text,
  message text,
  status text,
  admin_notes text,
  replied_at timestamptz,
  replied_by uuid,
  created_at timestamptz
)
language plpgsql security definer as $$
begin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  return query
  select
    cm.id,
    cm.first_name,
    cm.last_name,
    cm.email,
    cm.subject,
    cm.message,
    cm.status,
    cm.admin_notes,
    cm.replied_at,
    cm.replied_by,
    cm.created_at
  from public.contact_messages cm
  where (p_status is null or cm.status = p_status)
  order by cm.created_at desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.get_contact_message_count(p_status text default null)
returns int
language plpgsql security definer as $$
declare
  v_count int;
begin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  select count(*)
  into v_count
  from public.contact_messages
  where (p_status is null or status = p_status);

  return v_count;
end;
$$;

create or replace function public.update_contact_message_status(
  p_id uuid,
  p_status text,
  p_admin_notes text default null
)
returns void
language plpgsql security definer as $$
declare
  v_replied_at timestamptz;
  v_replied_by uuid;
begin
  if not exists (select 1 from public.users where id = auth.uid() and role = 'admin') then
    raise exception 'Unauthorized';
  end if;

  v_replied_at := case when p_status = 'replied' then now() else null end;
  v_replied_by := case when p_status = 'replied' then auth.uid() else null end;

  update public.contact_messages
  set status = p_status,
      admin_notes = coalesce(p_admin_notes, admin_notes),
      replied_at = v_replied_at,
      replied_by = v_replied_by
  where id = p_id;
end;
$$;


-- ============================================
-- REALTIME: Enable pg_notify + broadcast on INSERT
-- ============================================

-- Add table to supabase_realtime publication for postgres_changes
alter publication supabase_realtime add table public.contact_messages;

-- Function that fires on INSERT and broadcasts to admin channel
create or replace function public.notify_new_contact_message()
returns trigger
language plpgsql
security definer as $$
begin
  perform supabase_realtime.broadcast(
    'admin:contact-messages',
    'new_message',
    jsonb_build_object(
      'id',         NEW.id,
      'first_name', NEW.first_name,
      'last_name',  NEW.last_name,
      'email',      NEW.email,
      'subject',    NEW.subject,
      'message',    NEW.message,
      'status',     NEW.status,
      'created_at', NEW.created_at
    )
  );
  return NEW;
end;
$$;

-- Function that fires on UPDATE (status change) and broadcasts to admin + user channels
create or replace function public.notify_contact_message_update()
returns trigger
language plpgsql
security definer as $$
begin
  -- Broadcast to admin dashboard
  perform supabase_realtime.broadcast(
    'admin:contact-messages',
    'message_updated',
    jsonb_build_object(
      'id',         NEW.id,
      'status',     NEW.status,
      'admin_notes', NEW.admin_notes,
      'replied_at', NEW.replied_at,
      'replied_by', NEW.replied_by
    )
  );

  -- Broadcast back to the user who submitted the message
  perform supabase_realtime.broadcast(
    'contact:' || NEW.id,
    'status_update',
    jsonb_build_object(
      'id',         NEW.id,
      'status',     NEW.status,
      'admin_notes', NEW.admin_notes,
      'replied_at', NEW.replied_at
    )
  );

  return NEW;
end;
$$;

-- Trigger: broadcast new messages to admin dashboard
drop trigger if exists trigger_notify_new_contact_message on public.contact_messages;
create trigger trigger_notify_new_contact_message
  after insert on public.contact_messages
  for each row execute function public.notify_new_contact_message();

-- Trigger: broadcast status changes to admin dashboard
drop trigger if exists trigger_notify_contact_message_update on public.contact_messages;
create trigger trigger_notify_contact_message_update
  after update on public.contact_messages
  for each row execute function public.notify_contact_message_update();