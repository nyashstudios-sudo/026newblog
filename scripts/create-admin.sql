INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'admin@026newsblog.com',
  '$2a$06$MP8in6X7CSdXeCrLkUp8LOW9jZG0ak.NjjnGB2DVhmB5.vURt2nPe',
  now(),
  'authenticated',
  'authenticated',
  '{"provider":"email","providers":["email"]}',
  '{"username":"admin","firstName":"Admin","lastName":"User"}',
  now(),
  now()
);