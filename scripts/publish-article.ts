/**
 * Publish a Markdown article straight to Supabase, without logging in to the admin.
 *
 *   npm run article -- path/to/post.md            # save as draft
 *   npm run article -- path/to/post.md --publish  # publish
 *   npm run article -- path/to/post.md --dry-run  # parse only, write nothing
 *
 * Needs .env.local (never commit it) with:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...   (Supabase dashboard → Project Settings → API → service_role)
 *
 * The file may start with front matter; every field is optional:
 *   ---
 *   title: 八字入门：如何看日主强弱
 *   slug: bazi-day-master-strength
 *   summary: 一句话摘要
 *   category: 八字            (八字 / 大六壬 / 阴盘奇门 / 风水 / 起名 / 梅花易数 / 杂谈)
 *   tags: 八字, 日主
 *   cover: ./cover.jpg       (local file or URL; omitted = preset by category: 八字→bazi, 阴盘奇门→qimen, others→bagua)
 *   ---
 * Without a title, the first "# heading" is used. Local images (![](./a.png)) are uploaded.
 * Running it again with the same slug updates that article instead of creating a new one.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, basename, extname } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';

const BUCKET = 'blog-images';
const SITE = 'https://fortunetell.oumashu.top';
const CATEGORIES = ['八字', '大六壬', '阴盘奇门', '风水', '起名', '梅花易数', '杂谈'];
/** Preset cover used when the article brings none */
const DEFAULT_COVER: Record<string, string> = { 八字: '/cover/bazi.webp', 阴盘奇门: '/cover/qimen.webp' };
const FALLBACK_COVER = '/cover/bagua.webp';
const MIME: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const name of ['.env.local', '.env']) {
    if (!existsSync(name)) continue;
    for (const line of readFileSync(name, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !(m[1] in env)) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  return { ...env, ...process.env } as Record<string, string>;
}

/** Same rule as the admin editor */
function slugify(input: string) {
  return input.trim().toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9一-龥]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function parse(source: string) {
  const meta: Record<string, string> = {};
  let body = source.replace(/^﻿/, '');
  const fm = body.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fm) {
    for (const line of fm[1].split(/\r?\n/)) {
      const m = line.match(/^(\w+)\s*:\s*(.*)$/);
      if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    }
    body = body.slice(fm[0].length);
  }
  if (!meta.title) {
    const h = body.match(/^\s*#\s+(.+)\s*$/m);
    if (h) {
      meta.title = h[1].trim();
      body = body.replace(h[0], '');
    }
  }
  return { meta, body: body.trim() };
}

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const publish = args.includes('--publish');
  const dryRun = args.includes('--dry-run');
  if (!file || !existsSync(file)) {
    console.error('用法: npm run article -- <文章.md> [--publish] [--dry-run]');
    process.exit(1);
  }

  const { meta, body } = parse(readFileSync(file, 'utf8'));
  if (!meta.title) throw new Error('缺少标题：在 front matter 写 title:，或在正文第一行写 "# 标题"');
  if (!body) throw new Error('正文为空');
  if (meta.category && !CATEGORIES.includes(meta.category)) {
    console.warn(`⚠ 分类「${meta.category}」不在网站分类里（${CATEGORIES.join(' / ')}），文章不会出现在分类筛选中`);
  }
  const slug = meta.slug ? slugify(meta.slug) : slugify(meta.title) || `post-${Date.now()}`;
  const tags = (meta.tags || '').split(/[，,]/).map((t) => t.trim()).filter(Boolean);

  // local images are uploaded later; remember them in order
  const baseDir = dirname(resolve(file));
  const localImages = new Map<string, string>(); // markdown src -> absolute path
  for (const m of body.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)) {
    const src = m[1];
    if (/^(https?:|data:|\/)/.test(src)) continue;
    const abs = resolve(baseDir, decodeURI(src));
    if (!existsSync(abs)) throw new Error(`找不到图片: ${src}`);
    localImages.set(src, abs);
  }
  const coverLocal = meta.cover && !/^(https?:|\/)/.test(meta.cover) ? resolve(baseDir, meta.cover) : null;
  if (coverLocal && !existsSync(coverLocal)) throw new Error(`找不到封面: ${meta.cover}`);

  let html = await marked.parse(body, { gfm: true, breaks: false });
  // block ends become spaces, inline tags vanish, so **bold** words don't get padded
  const summary = meta.summary || html.replace(/<\/(p|h\d|li|blockquote|pre)>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 100);

  console.log(`标题: ${meta.title}\n网址: /blog/${slug}\n分类: ${meta.category || '（无）'}  标签: ${tags.join(', ') || '（无）'}`);
  console.log(`封面: ${meta.cover || `（默认）${DEFAULT_COVER[meta.category] ?? FALLBACK_COVER}`}`);
  console.log(`摘要: ${summary}${meta.summary ? '' : '（自动截取正文）'}\n正文: ${html.length} 字节 HTML，${localImages.size} 张本地图片${coverLocal ? '，1 张本地封面' : ''}`);
  if (dryRun) {
    console.log('\n--dry-run：未写入任何数据');
    return;
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('.env.local 里缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: existing, error: findErr } = await db.from('articles').select('id, status').eq('slug', slug).maybeSingle();
  if (findErr) throw findErr;

  // images go under the article id once known; new articles use a temporary folder like the editor's drafts
  const folder = existing?.id ?? `cli-${Date.now()}`;
  const uploaded: { path: string; publicUrl: string; kind: 'cover' | 'inline'; mime: string; size: number }[] = [];
  const upload = async (abs: string, kind: 'cover' | 'inline') => {
    const ext = extname(abs).toLowerCase();
    const mime = MIME[ext];
    if (!mime) throw new Error(`不支持的图片格式: ${basename(abs)}`);
    const bytes = readFileSync(abs);
    const name = basename(abs, ext).replace(/[^a-zA-Z0-9._-]+/g, '').slice(0, 60) || 'image';
    const path = `${folder}/${kind}/${Date.now()}-${name}${ext}`;
    const { error } = await db.storage.from(BUCKET).upload(path, bytes, { contentType: mime, cacheControl: '31536000', upsert: false });
    if (error) throw new Error(`图片上传失败 ${basename(abs)}: ${error.message}`);
    const publicUrl = db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    uploaded.push({ path, publicUrl, kind, mime, size: bytes.length });
    console.log(`  ↑ ${basename(abs)}`);
    return publicUrl;
  };

  for (const [src, abs] of localImages) {
    const remote = await upload(abs, 'inline');
    html = html.split(`src="${src}"`).join(`src="${remote}"`).split(`src="${encodeURI(src)}"`).join(`src="${remote}"`);
  }
  // an update without a cover keeps the article's current one
  const cover = coverLocal ? await upload(coverLocal, 'cover') : meta.cover || (existing ? null : DEFAULT_COVER[meta.category] ?? FALLBACK_COVER);

  const status = publish ? 'published' : existing?.status === 'published' ? 'published' : 'draft';
  const fields = {
    title: meta.title,
    slug,
    summary,
    content_html: html,
    category: meta.category || null,
    tags,
    status,
    ...(cover ? { cover_image_url: cover } : {}),
  };

  let id: string;
  if (existing) {
    const { error } = await db.from('articles').update(fields).eq('id', existing.id);
    if (error) throw error;
    id = existing.id;
  } else {
    const { data: admin, error: adminErr } = await db.from('profiles').select('id').eq('role', 'admin').order('created_at').limit(1).maybeSingle();
    if (adminErr || !admin) throw new Error('找不到管理员账号作为作者');
    const { data, error } = await db.from('articles').insert({ ...fields, author_id: admin.id }).select('id').single();
    if (error) throw error;
    id = data.id;
  }

  if (uploaded.length) {
    const { error } = await db.from('article_images').insert(uploaded.map((u) => ({
      article_id: id,
      kind: u.kind,
      storage_bucket: BUCKET,
      storage_path: u.path,
      public_url: u.publicUrl,
      mime_type: u.mime,
      size_bytes: u.size,
    })));
    if (error) console.warn(`⚠ 图片记录写入失败（图片本身已上传）: ${error.message}`);
  }

  console.log(`\n✓ ${existing ? '已更新' : '已创建'}文章（${status === 'published' ? '已发布' : '草稿'}）`);
  console.log(`  后台编辑: ${SITE}/admin/write?id=${id}`);
  if (status === 'published') console.log(`  文章地址: ${SITE}/zh/blog/${encodeURIComponent(slug)}（首页列表最多 10 分钟后出现）`);
}

main().catch((e) => {
  console.error(`✗ ${e instanceof Error ? e.message : JSON.stringify(e)}`);
  process.exit(1);
});
