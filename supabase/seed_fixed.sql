-- 026Newsblog sample seed data (fixed UUIDs)
-- Run AFTER supabase/migration.sql in Supabase SQL Editor

create extension if not exists pgcrypto;

do $seed$
declare
  v_admin uuid := '11111111-1111-1111-1111-111111111111';
  v_ada   uuid := '22222222-2222-2222-2222-222222222222';
  v_alan  uuid := '33333333-3333-3333-3333-333333333333';
  v_grace uuid := '44444444-4444-4444-4444-444444444444';
  v_mia   uuid := '55555555-5555-5555-5555-555555555555';
  v_leo   uuid := '66666666-6666-6666-6666-666666666666';

  c_tech   uuid := 'c1000000-0000-0000-0000-000000000001';
  c_ai     uuid := 'c1000000-0000-0000-0000-000000000002';
  c_start  uuid := 'c1000000-0000-0000-0000-000000000003';
  c_culture uuid := 'c1000000-0000-0000-0000-000000000004';
  c_sci    uuid := 'c1000000-0000-0000-0000-000000000005';
  c_innov  uuid := 'c1000000-0000-0000-0000-000000000006';
  c_health uuid := 'c1000000-0000-0000-0000-000000000007';
  c_biz    uuid := 'c1000000-0000-0000-0000-000000000008';

  a1 uuid := 'a1000000-0000-0000-0000-000000000001';
  a2 uuid := 'a1000000-0000-0000-0000-000000000002';
  a3 uuid := 'a1000000-0000-0000-0000-000000000003';
  a4 uuid := 'a1000000-0000-0000-0000-000000000004';
  a5 uuid := 'a1000000-0000-0000-0000-000000000005';
  a6 uuid := 'a1000000-0000-0000-0000-000000000006';
  a7 uuid := 'a1000000-0000-0000-0000-000000000007';
  a8 uuid := 'a1000000-0000-0000-0000-000000000008';
  a9 uuid := 'a1000000-0000-0000-0000-000000000009';
  a10 uuid := 'a1000000-0000-0000-0000-000000000010';
  a11 uuid := 'a1000000-0000-0000-0000-000000000011';
  a12 uuid := 'a1000000-0000-0000-0000-000000000012';

  conv1 uuid := 'b1000000-0000-0000-0000-000000000001';
  pwd text := crypt('Password123!', gen_salt('bf'));
begin

insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, aud, role, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
 (v_admin, '00000000-0000-0000-0000-000000000000', 'admin@026news.com', pwd, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"admin","firstName":"Site","lastName":"Admin"}'::jsonb, now() - interval '90 days', now()),
 (v_ada,   '00000000-0000-0000-0000-000000000000', 'ada@026news.com',   pwd, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"ada","firstName":"Ada","lastName":"Lovelace"}'::jsonb, now() - interval '80 days', now()),
 (v_alan,  '00000000-0000-0000-0000-000000000000', 'alan@026news.com',  pwd, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"alan","firstName":"Alan","lastName":"Turing"}'::jsonb, now() - interval '75 days', now()),
 (v_grace, '00000000-0000-0000-0000-000000000000', 'grace@026news.com', pwd, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"grace","firstName":"Grace","lastName":"Hopper"}'::jsonb, now() - interval '70 days', now()),
 (v_mia,   '00000000-0000-0000-0000-000000000000', 'mia@026news.com',   pwd, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"mia","firstName":"Mia","lastName":"Chen"}'::jsonb, now() - interval '40 days', now()),
 (v_leo,   '00000000-0000-0000-0000-000000000000', 'leo@026news.com',   pwd, now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}'::jsonb, '{"username":"leo","firstName":"Leo","lastName":"Park"}'::jsonb, now() - interval '30 days', now());

update public.users set role='admin', is_verified=true, bio='Platform administrator keeping 026News running smoothly.', website='https://026news.com', avatar_url='https://i.pravatar.cc/300?img=12' where id=v_admin;
update public.users set role='author', is_verified=true, bio='Writing about systems, edge computing, and the tools developers actually use.', website='https://ada.dev', avatar_url='https://i.pravatar.cc/300?img=47' where id=v_ada;
update public.users set role='author', is_verified=true, bio='Researcher focused on AI agents, verification, and the philosophy of computation.', avatar_url='https://i.pravatar.cc/300?img=33' where id=v_alan;
update public.users set role='author', is_verified=true, bio='Compiler engineer and lifelong advocate for readable, resilient software.', website='https://grace.hop', avatar_url='https://i.pravatar.cc/300?img=45' where id=v_grace;
update public.users set role='reader', is_verified=true, bio='Avid reader of science and technology. Currently learning to code.', avatar_url='https://i.pravatar.cc/300?img=5' where id=v_mia;
update public.users set role='reader', is_verified=false, bio='Casual reader, big on culture and business pieces.', avatar_url='https://i.pravatar.cc/300?img=8' where id=v_leo;

insert into public.author_profiles (user_id, display_name, tagline, topics, total_views, total_likes, total_followers, revenue_share_pct, mpesa_phone)
values
 (v_ada, 'Ada Lovelace', 'Systems & developer tools', '["Edge Computing","Developer Tools","Rust"]', 18420, 1320, 540, 70.00, '+254712345001'),
 (v_alan, 'Alan Turing', 'AI, agents, and verification', '["Artificial Intelligence","Verification","Theory"]', 22110, 1890, 710, 70.00, '+254712345002'),
 (v_grace, 'Grace Hopper', 'Compilers & resilient software', '["Compilers","Legacy Systems","Culture"]', 15030, 980, 430, 65.00, '+254712345003');

insert into public.author_applications (user_id, professional_title, writing_niche, years_experience, portfolio_url, motivation, status)
values
 (v_ada, 'Staff Engineer', 'Developer infrastructure', '10+', 'https://ada.dev', 'I want to share hard-won lessons from building edge platforms.', 'approved'),
 (v_alan, 'Research Scientist', 'Machine learning', '8', 'https://alan.research', 'Bridging academic AI research and practical engineering.', 'approved'),
 (v_grace, 'Compiler Engineer', 'Programming languages', '15', 'https://grace.hop', 'Making legacy systems legible to the next generation.', 'approved'),
 (v_leo, 'Product Designer', 'Design culture', '4', 'https://leo.design', 'I would love to write about the business of design.', 'pending');

insert into public.categories (id, name, slug, description, icon, article_count)
values
 (c_tech, 'Technology', 'technology', 'The tools and systems shaping our world.', 'cpu', 3),
 (c_ai, 'AI & ML', 'ai-ml', 'Models, agents, and the frontier of machine intelligence.', 'sparkles', 3),
 (c_start, 'Startups', 'startups', 'Building companies from zero to scale.', 'rocket', 1),
 (c_culture, 'Culture', 'culture', 'The human side of technology and code.', 'users', 2),
 (c_sci, 'Science', 'science', 'Discoveries and the method behind them.', 'flask', 2),
 (c_innov, 'Innovation', 'innovation', 'New ideas reshaping old industries.', 'lightbulb', 1),
 (c_health, 'Health', 'health', 'Data, medicine, and wellbeing.', 'heart', 1),
 (c_biz, 'Business', 'business', 'Markets, strategy, and the bottom line.', 'briefcase', 1);

insert into public.articles (id, author_id, title, subtitle, slug, content, content_html, excerpt, cover_image_url, category_id, tags, status, reading_time_minutes, word_count, view_count, like_count, comment_count, share_count, is_featured, published_at)
values
 (a1, v_ada, 'The Quiet Rise of Edge Computing', 'Why the future of compute is closer to you than ever', 'edge-computing-rise', '{"blocks":[{"type":"paragraph","text":"Edge computing moves work to where data is born."}]}'::jsonb, '<p>Edge computing moves work to where data is born. Instead of round-tripping every request to a distant region, we now push inference and filtering to the network edge.</p><p>The result is lower latency, lower egress cost, and a dramatically better experience for users far from traditional data centers.</p>', 'Edge computing moves work to where data is born.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', c_tech, '["Edge","Infrastructure","Latency"]', 'published', 6, 1100, 4200, 312, 14, 58, true, now() - interval '12 days'),
 (a2, v_ada, 'What LLMs Actually Remember', 'Memory, context, and the limits of attention', 'what-llms-remember', '{"blocks":[{"type":"paragraph","text":"Context windows are not memory."}]}'::jsonb, '<p>Context windows are not memory. They are a scratchpad that resets the moment a session ends.</p><p>Production systems increasingly pair models with retrieval and explicit state so that what matters persists beyond a single prompt.</p>', 'Context windows are not memory.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200', c_ai, '["LLM","Memory","Retrieval"]', 'published', 7, 1300, 3800, 290, 9, 41, true, now() - interval '9 days'),
 (a3, v_alan, 'Turing Tests in the Age of Agents', 'When the subject is no longer a single model', 'turing-tests-agents', '{"blocks":[{"type":"paragraph","text":"Agents complicate the classic test."}]}'::jsonb, '<p>The original Turing test imagined a single interlocutor. Agents complicate this: a system that plans, calls tools, and delegates undermines the premise of a single minded entity.</p><p>We need evaluations that measure competence over conversations, not cleverness in one reply.</p>', 'Agents complicate the classic test.', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200', c_ai, '["Agents","Evaluation","AI"]', 'published', 8, 1500, 5100, 401, 22, 77, true, now() - interval '7 days'),
 (a4, v_alan, 'Reversible Computing Explained', 'Computing that gives energy back', 'reversible-computing', '{"blocks":[{"type":"paragraph","text":"Reversible gates lose no information."}]}'::jsonb, '<p>Reversible computing builds circuits whose gates lose no information, sidestepping part of Landauers limit.</p><p>It remains niche, but as we hit thermal walls, reversible design returns to the spotlight.</p>', 'Reversible gates lose no information.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200', c_sci, '["Physics","Computing"]', 'published', 9, 1700, 2600, 188, 6, 19, false, now() - interval '20 days'),
 (a5, v_grace, 'Why Cobol Still Runs the World', 'Legacy that refuses to fail', 'cobol-runs-world', '{"blocks":[{"type":"paragraph","text":"Cobol powers core banking."}]}'::jsonb, '<p>Cobol powers core banking, payroll, and government systems that simply cannot fail.</p><p>The challenge is not replacing it but keeping a vanishing skill alive across generations of engineers.</p>', 'Cobol powers core banking.', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200', c_culture, '["Cobol","Legacy","Careers"]', 'published', 6, 1050, 3300, 240, 11, 33, false, now() - interval '15 days'),
 (a6, v_grace, 'Compilers as a Competitive Moat', 'The quiet advantage of owning your toolchain', 'compilers-moat', '{"blocks":[{"type":"paragraph","text":"A great compiler is a moat."}]}'::jsonb, '<p>A great compiler is a moat. It lets you extract performance your competitors cannot match without rebuilding the same depth of tooling.</p><p>Owning the toolchain turns a commodity language into a strategic asset.</p>', 'A great compiler is a moat.', 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200', c_biz, '["Compilers","Strategy"]', 'published', 7, 1250, 2100, 150, 4, 21, false, now() - interval '18 days'),
 (a7, v_ada, 'Bootstrapping a Dev Tools Company', 'Lessons from profitable zero-to-one', 'bootstrapping-devtools', '{"blocks":[{"type":"paragraph","text":"Charge from day one."}]}'::jsonb, '<p>Charge from day one. The discipline of real revenue sharpens product priorities faster than any advisor.</p><p>Bootstrap dev tools succeed when they save engineers time they can measure in dollars.</p>', 'Charge from day one.', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200', c_start, '["Startups","DevTools"]', 'published', 8, 1400, 2900, 210, 8, 27, false, now() - interval '5 days'),
 (a8, v_alan, 'Analog AI Chips Are Coming', 'In-memory compute for the power-constrained era', 'analog-ai-chips', '{"blocks":[{"type":"paragraph","text":"Analog compute is back."}]}'::jsonb, '<p>Analog in-memory compute is back, trading perfect precision for dramatic efficiency on the workloads that matter.</p><p>Expect hybrid systems where analog handles the heavy lifting and digital cleans up the edges.</p>', 'Analog compute is back.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200', c_innov, '["Hardware","AI","Efficiency"]', 'published', 7, 1280, 2400, 175, 5, 18, false, now() - interval '22 days'),
 (a9, v_grace, 'Data Standards Save Lives', 'Interoperability in modern healthcare', 'data-standards-health', '{"blocks":[{"type":"paragraph","text":"Standards are infrastructure."}]}'::jsonb, '<p>Standards are infrastructure. In healthcare, a shared schema can be the difference between a timely diagnosis and a lost record.</p><p>Interoperability is unglamorous work with outsized human impact.</p>', 'Standards are infrastructure.', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200', c_health, '["Health","Standards"]', 'published', 6, 1020, 1800, 130, 3, 12, false, now() - interval '25 days'),
 (a10, v_ada, 'Rust in the Linux Kernel', 'A cautious, pragmatic adoption', 'rust-linux-kernel', '{"blocks":[{"type":"paragraph","text":"Rust enters the kernel."}]}'::jsonb, '<p>Rusts entry into the kernel is cautious and pragmatic, starting with drivers where memory safety pays the largest dividend.</p><p>It is less a takeover and more a long-term bet on fewer CVEs.</p>', 'Rust enters the kernel.', 'https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200', c_tech, '["Rust","Linux","Safety"]', 'published', 7, 1320, 3600, 260, 12, 39, true, now() - interval '3 days'),
 (a11, v_alan, 'Quantum Error Correction Milestone', 'Crossing the threshold that matters', 'quantum-error-correction', '{"blocks":[{"type":"paragraph","text":"Below threshold at last."}]}'::jsonb, '<p>Recent experiments crossed the error-correction threshold that matters: logical qubits that improve as you add physical ones.</p><p>The path to useful machines is still long, but the signpost is real.</p>', 'Below threshold at last.', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200', c_sci, '["Quantum","Research"]', 'published', 9, 1650, 4100, 330, 17, 52, true, now() - interval '1 day'),
 (a12, v_grace, 'The Linguistics of Code', 'Why programming is also a written language', 'linguistics-of-code', '{"blocks":[{"type":"paragraph","text":"Code is read more than run."}]}'::jsonb, '<p>Code is read far more than it is run. Treating programs as literature improves maintainability more than any framework.</p><p>Naming, rhythm, and structure are linguistic choices with engineering consequences.</p>', 'Code is read more than run.', 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200', c_culture, '["Language","Craft"]', 'published', 6, 1000, 2200, 160, 7, 24, false, now() - interval '28 days');

insert into public.article_likes (user_id, article_id)
values
 (v_mia, a1), (v_leo, a1), (v_alan, a1), (v_grace, a1),
 (v_mia, a2), (v_leo, a2), (v_grace, a2),
 (v_mia, a3), (v_leo, a3), (v_ada, a3), (v_grace, a3),
 (v_mia, a10), (v_leo, a10), (v_alan, a10),
 (v_mia, a11), (v_ada, a11), (v_grace, a11),
 (v_mia, a7), (v_leo, a7);

insert into public.article_saves (user_id, article_id)
values
 (v_mia, a1), (v_mia, a2), (v_mia, a3), (v_mia, a10), (v_mia, a11),
 (v_leo, a5), (v_leo, a12), (v_leo, a6);

insert into public.article_views (article_id, user_id, session_id, read_duration_seconds, scroll_depth_pct)
values
 (a1, v_mia, 'sess-mia-1', 210, 92), (a1, v_leo, 'sess-leo-1', 180, 80), (a1, null, 'anon-1', 95, 40),
 (a2, v_mia, 'sess-mia-2', 240, 88), (a3, v_mia, 'sess-mia-3', 300, 95),
 (a10, v_mia, 'sess-mia-4', 260, 90), (a11, v_mia, 'sess-mia-5', 280, 85),
 (a5, v_leo, 'sess-leo-2', 200, 70), (a12, v_leo, 'sess-leo-3', 150, 60);

insert into public.comments (id, article_id, user_id, parent_id, content, like_count, moderation_status)
values
 ('d1000000-0000-0000-0000-000000000001', a1, v_mia, null, 'This finally made edge vs cloud click for me. Thank you!', 12, 'approved'),
 ('d1000000-0000-0000-0000-000000000002', a1, v_alan, 'd1000000-0000-0000-0000-000000000001', 'Glad it helped. The egress cost angle is underrated.', 4, 'approved'),
 ('d1000000-0000-0000-0000-000000000003', a3, v_leo, null, 'The evaluation point is spot on. Single replies fool everyone.', 8, 'approved'),
 ('d1000000-0000-0000-0000-000000000004', a11, v_grace, null, 'Exciting milestone, but the engineering gap is still enormous.', 6, 'approved'),
 ('d1000000-0000-0000-0000-000000000005', a10, v_mia, null, 'Cautious adoption is exactly the right call for the kernel.', 3, 'pending');

insert into public.comment_likes (user_id, comment_id)
values
 (v_ada, 'd1000000-0000-0000-0000-000000000001'),
 (v_grace, 'd1000000-0000-0000-0000-000000000001'),
 (v_mia, 'd1000000-0000-0000-0000-000000000003');

insert into public.follows (follower_id, following_id)
values
 (v_mia, v_ada), (v_mia, v_alan), (v_mia, v_grace),
 (v_leo, v_ada), (v_leo, v_grace),
 (v_alan, v_ada), (v_grace, v_alan);

insert into public.user_interests (user_id, category_id)
values
 (v_mia, c_tech), (v_mia, c_ai), (v_mia, c_sci),
 (v_leo, c_culture), (v_leo, c_biz), (v_leo, c_start),
 (v_ada, c_tech), (v_ada, c_ai);

insert into public.reading_sessions (user_id, article_id, duration_seconds, completed, created_at)
values
 (v_mia, a1, 210, true, now() - interval '6 days'),
 (v_mia, a2, 240, true, now() - interval '5 days'),
 (v_mia, a3, 300, true, now() - interval '5 days'),
 (v_mia, a10, 260, true, now() - interval '4 days'),
 (v_mia, a11, 280, true, now() - interval '3 days'),
 (v_mia, a7, 200, false, now() - interval '2 days'),
 (v_mia, a1, 190, true, now() - interval '1 day'),
 (v_mia, a3, 250, true, now() - interval '12 hours'),
 (v_mia, a10, 220, true, now() - interval '3 hours'),
 (v_leo, a5, 200, true, now() - interval '2 days'),
 (v_leo, a12, 150, false, now() - interval '1 day');

insert into public.reading_streaks (user_id, current_streak, longest_streak, last_read_date)
values
 (v_mia, 5, 12, now() - interval '3 hours'),
 (v_leo, 2, 8, now() - interval '1 day');

insert into public.reading_goals (user_id, daily_articles, weekly_minutes, weekly_comments, weekly_new_topics)
values
 (v_mia, 3, 150, 5, 2),
 (v_leo, 2, 90, 3, 1);

insert into public.notifications (id, user_id, type, title, content, actor_id, article_id, is_read, created_at)
values
 ('e1000000-0000-0000-0000-000000000001', v_mia, 'like', 'Alan Turing liked your comment', 'Alan Turing liked your comment on "The Quiet Rise of Edge Computing".', v_alan, a1, false, now() - interval '2 hours'),
 ('e1000000-0000-0000-0000-000000000002', v_mia, 'reply', 'Alan Turing replied to you', 'Alan Turing replied to your comment on "The Quiet Rise of Edge Computing".', v_alan, a1, false, now() - interval '1 hour'),
 ('e1000000-0000-0000-0000-000000000003', v_mia, 'follow', 'Leo Park started following you', 'Leo Park started following you.', v_leo, null, false, now() - interval '5 hours'),
 ('e1000000-0000-0000-0000-000000000004', v_mia, 'publish', 'Ada Lovelace published a new article', 'Ada Lovelace published "Rust in the Linux Kernel".', v_ada, a10, true, now() - interval '3 days'),
 ('e1000000-0000-0000-0000-000000000005', v_mia, 'system', 'Welcome to 026News', 'Set your reading goals to get a personalized feed.', null, null, true, now() - interval '40 days'),
 ('e1000000-0000-0000-0000-000000000006', v_ada, 'follow', 'Mia Chen started following you', 'Mia Chen started following you.', v_mia, null, false, now() - interval '6 hours'),
 ('e1000000-0000-0000-0000-000000000007', v_ada, 'earning', 'You earned $12.40 this week', 'Your earnings from "The Quiet Rise of Edge Computing" are in.', null, a1, false, now() - interval '1 day');

insert into public.notification_preferences (user_id, daily_digest, push_notifications, comment_replies, new_followers, likes_on_comments, weekly_recap, author_publishes)
values
 (v_mia, true, true, true, false, false, true, true),
 (v_ada, true, true, true, true, true, true, true);

insert into public.conversations (id, created_at, updated_at)
values (conv1, now() - interval '2 days', now() - interval '1 hour');

insert into public.conversation_participants (conversation_id, user_id, last_read_at)
values
 (conv1, v_mia, now() - interval '2 hours'),
 (conv1, v_ada, now() - interval '1 hour');

insert into public.messages (conversation_id, sender_id, content, is_read, created_at)
values
 (conv1, v_mia, 'Hi Ada, loved the edge computing piece. Any chance of a follow-up on caching strategies?', false, now() - interval '2 days'),
 (conv1, v_ada, 'Thanks Mia! Yes, a caching deep-dive is on my list for next month.', true, now() - interval '2 days' + interval '30 minutes'),
 (conv1, v_mia, 'Amazing, I will watch for it.', true, now() - interval '1 hour');

insert into public.earnings (id, author_id, article_id, amount_usd, source, period_start, period_end, created_at)
values
 ('f1000000-0000-0000-0000-000000000001', v_ada, a1, 42.10, 'ad_revenue', now() - interval '30 days', now() - interval '23 days', now() - interval '23 days'),
 ('f1000000-0000-0000-0000-000000000002', v_ada, a1, 38.50, 'subscriptions', now() - interval '23 days', now() - interval '16 days', now() - interval '16 days'),
 ('f1000000-0000-0000-0000-000000000003', v_ada, a2, 29.80, 'ad_revenue', now() - interval '16 days', now() - interval '9 days', now() - interval '9 days'),
 ('f1000000-0000-0000-0000-000000000004', v_ada, a10, 31.20, 'ad_revenue', now() - interval '9 days', now() - interval '2 days', now() - interval '2 days'),
 ('f1000000-0000-0000-0000-000000000005', v_alan, a3, 51.40, 'ad_revenue', now() - interval '16 days', now() - interval '9 days', now() - interval '9 days');

insert into public.payouts (id, author_id, amount_usd, amount_kes, exchange_rate, fee_usd, mpesa_phone, mpesa_transaction_id, status, processed_at, created_at)
values
 ('p1000000-0000-0000-0000-000000000001', v_ada, 80.00, 10240.00, 128.0, 1.50, '+254712345001', 'MPESA00ABC1', 'completed', now() - interval '20 days', now() - interval '22 days'),
 ('p1000000-0000-0000-0000-000000000002', v_ada, 60.00, 7680.00, 128.0, 1.25, '+254712345001', null, 'pending', null, now() - interval '1 day');

insert into public.moderation_queue (id, type, content_id, reported_by, reason, ai_confidence, ai_category, status, created_at)
values
 ('h1000000-0000-0000-0000-000000000001', 'comment', 'd1000000-0000-0000-0000-000000000005', '["anon"]', 'Possible spam link', 0.82, 'spam', 'pending', now() - interval '4 hours'),
 ('h1000000-0000-0000-0000-000000000002', 'article', 'a8', '["reader2"]', 'Off-topic report', 0.21, 'off_topic', 'pending', now() - interval '1 day');

insert into public.rss_feeds (id, name, url, category_id, refresh_interval_minutes, status, last_fetched_at, items_today, total_items_imported, created_at)
values
 ('i1000000-0000-0000-0000-000000000001', 'TechCrunch', 'https://techcrunch.com/feed/', c_tech, 60, 'active', now() - interval '30 minutes', 4, 312, now() - interval '60 days'),
 ('i1000000-0000-0000-0000-000000000002', 'Nature News', 'https://www.nature.com/nature/rss/news', c_sci, 120, 'active', now() - interval '90 minutes', 2, 140, now() - interval '55 days');

insert into public.rss_items (id, feed_id, guid, title, url, author, published_at, imported_at)
values
 ('j1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 'tc-1', 'Startups race to ship on-device models', 'https://techcrunch.com/2026/07/01/on-device', 'TechCrunch', now() - interval '3 hours', now() - interval '2 hours'),
 ('j1000000-0000-0000-0000-000000000002', 'i1000000-0000-0000-0000-000000000001', 'tc-2', 'The new economics of inference', 'https://techcrunch.com/2026/07/02/inference', 'TechCrunch', now() - interval '5 hours', now() - interval '4 hours'),
 ('j1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000002', 'nat-1', 'A fresh look at protein folding', 'https://nature.com/2026/07/01/folding', 'Nature', now() - interval '6 hours', now() - interval '5 hours');

insert into public.article_audio (id, article_id, audio_url, duration_seconds, voice_model)
values
 ('k1000000-0000-0000-0000-000000000001', a1, 'https://cdn.026news.com/audio/a1.mp3', 342, 'en-US-Neural2-D'),
 ('k1000000-0000-0000-0000-000000000002', a3, 'https://cdn.026news.com/audio/a3.mp3', 401, 'en-US-Neural2-D'),
 ('k1000000-0000-0000-0000-000000000003', a11, 'https://cdn.026news.com/audio/a11.mp3', 388, 'en-US-Neural2-F');

insert into public.security_events (id, user_id, event_type, ip_address, metadata, created_at)
values
 ('l1000000-0000-0000-0000-000000000001', v_admin, 'login_success', '196.12.4.10', '{"method":"password"}'::jsonb, now() - interval '1 day'),
 ('l1000000-0000-0000-0000-000000000002', v_mia, 'failed_login', '197.232.11.4', '{"attempts":3}'::jsonb, now() - interval '2 days'),
 ('l1000000-0000-0000-0000-000000000003', null, 'rate_limit_triggered', '41.90.5.22', '{"route":"/api/articles/feed"}'::jsonb, now() - interval '5 hours');

insert into public.platform_settings (key, value, updated_by, updated_at)
values
 ('site_announcement', '{"enabled":true,"message":"Welcome to the new 026News reading experience."}'::jsonb, v_admin, now()),
 ('moderation_auto_enabled', '{"value":true,"threshold":0.75}'::jsonb, v_admin, now());

end $seed$;