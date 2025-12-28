import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { compressImage } from '@/lib/images/compress';

const BUCKET = 'blog-images';

export type UploadArticleImageInput = {
  file: File;
  kind: 'cover' | 'inline';
  articleId?: string | null;
  draftKey?: string | null;
};

export type UploadArticleImageResult = {
  publicUrl: string;
  bucket: string;
  path: string;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
};

function safeFilename(name: string) {
  return name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9._-]+/g, '')
    .slice(0, 80);
}

export async function uploadArticleImage({
  file,
  kind,
  articleId,
  draftKey,
}: UploadArticleImageInput): Promise<UploadArticleImageResult> {
  const supabase = createSupabaseBrowserClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('未登录');

  const compressed = await compressImage(file, {
    maxWidth: kind === 'cover' ? 2400 : 1600,
    maxHeight: kind === 'cover' ? 2400 : 1600,
    mimeType: 'image/webp',
    quality: 0.82,
  });

  const ext = compressed.mimeType.includes('jpeg') ? 'jpg' : 'webp';
  const base =
    articleId ??
    (draftKey ? `draft-${draftKey}` : `draft-${auth.user.id}`);
  const path = `${base}/${kind}/${Date.now()}-${safeFilename(file.name || 'image')}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed.blob, {
      upsert: false,
      contentType: compressed.mimeType,
      cacheControl: '31536000',
    });
  if (uploadErr) {
    // Most common: bucket missing or not public.
    throw new Error(`图片上传失败：${uploadErr.message}（请确认 Supabase Storage 已创建 bucket: ${BUCKET}）`);
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const publicUrl = pub.publicUrl;

  const { error: insertErr } = await supabase.from('article_images').insert({
    article_id: articleId ?? null,
    draft_key: articleId ? null : draftKey ?? null,
    kind,
    storage_bucket: BUCKET,
    storage_path: path,
    public_url: publicUrl,
    mime_type: compressed.mimeType,
    size_bytes: compressed.blob.size,
    width: compressed.width,
    height: compressed.height,
  });
  if (insertErr) throw insertErr;

  return {
    publicUrl,
    bucket: BUCKET,
    path,
    width: compressed.width,
    height: compressed.height,
    sizeBytes: compressed.blob.size,
    mimeType: compressed.mimeType,
  };
}

export async function attachDraftImagesToArticle(draftKey: string, articleId: string) {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from('article_images')
    .update({ article_id: articleId, draft_key: null })
    .eq('draft_key', draftKey);
  if (error) throw error;
}

/**
 * 根据 Public URL 删除图片（同步从数据库和存储中删除）
 */
export async function deleteArticleImageByUrl(publicUrl: string) {
  const supabase = createSupabaseBrowserClient();

  // 1. 查找记录获取存储路径
  const { data: record, error: findErr } = await supabase
    .from('article_images')
    .select('storage_path, storage_bucket')
    .eq('public_url', publicUrl)
    .maybeSingle();

  if (findErr || !record) return;

  // 2. 从 Storage 中删除物理文件
  const { error: storageErr } = await supabase.storage
    .from(record.storage_bucket)
    .remove([record.storage_path]);

  if (storageErr) {
    console.error('⚠️ [Storage] 文件删除失败:', storageErr);
  }

  // 3. 从数据库中删除记录
  const { error: dbErr } = await supabase
    .from('article_images')
    .delete()
    .eq('public_url', publicUrl);

  if (dbErr) {
    console.error('⚠️ [DB] 记录删除失败:', dbErr);
  } else {
    console.log('✅ 图片已从云端彻底清理:', publicUrl);
  }
}


