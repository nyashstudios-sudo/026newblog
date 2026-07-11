import { createClient } from '@supabase/supabase-js';

const BUCKETS = {
  ARTICLES: 'article-images',
  AVATARS: 'avatars',
  ATTACHMENTS: 'attachments',
} as const;

export { BUCKETS };

export function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  ).storage;
}

export function getAdminStorageClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  ).storage;
}

export async function uploadImage(
  bucket: string,
  path: string,
  file: File | Blob,
  upsert = false,
) {
  const storage = getAdminStorageClient();
  const { data, error } = await storage.from(bucket).upload(path, file, { upsert });
  if (error) throw error;
  const { data: { publicUrl } } = storage.from(bucket).getPublicUrl(data.path);
  return { path: data.path, url: publicUrl };
}

export async function deleteImage(bucket: string, path: string) {
  const storage = getAdminStorageClient();
  const { error } = await storage.from(bucket).remove([path]);
  if (error) throw error;
}
