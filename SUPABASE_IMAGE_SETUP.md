# Supabase 图片存储配置指南

## 问题诊断
拖拽上传的图片无法显示，可能是以下原因：
1. Storage bucket 未创建或配置错误
2. RLS 策略缺失或配置错误
3. 图片 URL 无法被公开访问

## 修复步骤

### 1. 执行 SQL 更新
在 Supabase Dashboard > SQL Editor 中执行 `supabase/schema.sql` 的最新版本，其中已包含完整的 Storage RLS 策略。

### 2. 检查/创建 Storage Bucket

前往 **Supabase Dashboard > Storage**:

1. 检查是否存在名为 `blog-images` 的 bucket
2. 如果不存在，点击 **New Bucket**：
   - **Name**: `blog-images`
   - **Public bucket**: ✅ **勾选**（重要！允许公开访问）
   - **File size limit**: 10 MB（可选）
   - **Allowed MIME types**: 留空或填写 `image/*`

3. 如果已存在但是私有的，需要修改为公开：
   - 点击 bucket 右侧的 **⋮** (三个点)
   - 选择 **Edit bucket**
   - 勾选 **Public bucket**
   - 保存

### 3. 验证 RLS 策略

前往 **Supabase Dashboard > Storage > Policies**，确认以下策略存在：

**For `blog-images` bucket:**
- ✅ `Admin can upload images` (INSERT) - 仅管理员可上传
- ✅ `Admin can update images` (UPDATE) - 仅管理员可更新
- ✅ `Admin can delete images` (DELETE) - 仅管理员可删除
- ✅ `Anyone can view blog images` (SELECT) - **所有人可查看**（包括匿名用户）

如果策略缺失，SQL 脚本应该已经创建了它们。如果仍然缺失，可以手动创建：

#### 示例：创建"所有人可查看"策略
```sql
create policy "Anyone can view blog images"
on storage.objects for select
to public
using (bucket_id = 'blog-images');
```

### 4. 测试上传

1. 登录管理员账号
2. 进入 `/admin/write` 写文章页面
3. 拖拽一张图片到编辑器中
4. 应该看到：
   - 先显示 "🖼️ 上传中..."
   - 几秒后替换为实际图片
   - 图片可以正常显示和编辑

### 5. 检查上传记录

前往 **Supabase Dashboard > Storage > blog-images**，应该能看到上传的文件，结构如：
```
draft-<uuid>/
  ├── inline/
  │   └── <timestamp>-<filename>.webp
  └── cover/
      └── <timestamp>-<filename>.webp
```

### 6. 检查数据库记录

在 **SQL Editor** 中执行：
```sql
select * from public.article_images order by created_at desc limit 10;
```

应该能看到上传的图片记录，包含：
- `public_url`: 完整的公开访问 URL
- `storage_path`: Storage 中的路径
- `draft_key`: 草稿标识（发布后会转为 `article_id`）

## 常见问题

### Q1: 图片显示为损坏的图标
**A**: 可能是 bucket 未设置为 public。前往 Storage 设置，勾选 **Public bucket**。

### Q2: 上传失败，提示 "new row violates row-level security policy"
**A**: 确认您的账号 `profiles.role = 'admin'`。执行：
```sql
update public.profiles set role = 'admin' where id = auth.uid();
```

### Q3: 图片上传成功但无法查看
**A**: 检查 Storage RLS 的 SELECT 策略是否允许 `public` 访问。

### Q4: 拖拽显示 "上传中..." 后就没有反应了
**A**: 打开浏览器开发者工具 (F12) > Console 查看错误信息，通常是上传或 RLS 策略问题。

## 代码改进

本次更新的关键改进：

1. **拖拽上传优化**：
   - 先插入占位符 "🖼️ 上传中..."
   - 异步上传完成后替换为真实图片
   - 失败时显示错误信息

2. **Storage RLS 策略完整化**：
   - 添加了管理员的 INSERT/UPDATE/DELETE 权限
   - 添加了公开的 SELECT 权限（所有人可查看）

3. **图片配置增强**：
   - 添加 `inline: false` 确保图片独占一行
   - 添加 `loading: 'lazy'` 提升页面加载性能

## 验证清单

- [ ] SQL 脚本已执行（包含最新的 Storage RLS 策略）
- [ ] `blog-images` bucket 已创建且为 **Public**
- [ ] Storage RLS 策略完整（4 条策略）
- [ ] 管理员账号的 `role = 'admin'`
- [ ] 拖拽上传图片成功显示
- [ ] `article_images` 表有记录
- [ ] Storage 中有对应的文件

全部完成后，图片上传和显示功能应该正常工作了！

