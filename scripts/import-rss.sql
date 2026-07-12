DO $$
DECLARE
    sys_author UUID;
    imported INT := 0;
BEGIN
    -- Get system author
    SELECT id INTO sys_author FROM public.users WHERE email = 'admin@026newsblog.com' LIMIT 1;
    
    IF sys_author IS NULL THEN
        RAISE NOTICE 'System author not found';
        RETURN;
    END IF;
    
    -- Get existing URLs
    CREATE TEMP TABLE existing_urls AS 
    SELECT source_url FROM articles WHERE source_url IS NOT NULL;
    
    -- Import RSS items as articles
    INSERT INTO articles (author_id, title, slug, content, content_html, excerpt, 
                          category_id, tags, status, reading_time_minutes, word_count,
                          source_name, source_url, cover_image_url, published_at)
    SELECT 
        sys_author,
        ri.title,
        lower(regexp_replace(ri.title, '[^a-z0-9]+', '-', 'g')) || '-' || encode(gen_random_bytes(4), 'hex'),
        jsonb_build_object('type', 'doc', 'content', jsonb_build_array(
            jsonb_build_object('type', 'paragraph', 'content', jsonb_build_array(
                jsonb_build_object('type', 'text', 'text', ri.description)
            ))
        )),
        '<p>' || ri.description || '</p><hr><p><em>Sourced from <a href="' || ri.url || '" target="_blank">' || f.name || '</a></em></p>',
        ri.description,
        f.category_id,
        ARRAY['sourced', lower(regexp_replace(f.name, '\s+', '-', 'g'))],
        'published',
        GREATEST(1, ceil(length(ri.description) / 200.0)),
        length(ri.description),
        f.name,
        ri.url,
        ri.url,
        ri.published_at
    FROM rss_items ri
    JOIN rss_feeds f ON ri.feed_id = f.id
    WHERE ri.url NOT IN (SELECT source_url FROM existing_urls)
    AND f.status = 'active'
    ON CONFLICT (slug) DO NOTHING;
    
    GET DIAGNOSTICS imported = ROW_COUNT;
    RAISE NOTICE 'Imported % articles', imported;
END $$;