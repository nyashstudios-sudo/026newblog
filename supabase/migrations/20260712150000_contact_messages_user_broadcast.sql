-- Update the UPDATE trigger to also broadcast back to the user's channel

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
