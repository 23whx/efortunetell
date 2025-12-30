# 评论功能使用说明

## 功能概述

完整的文章评论系统，支持：
- ✅ 评论字数限制：6-66字
- ✅ 防刷机制：同一IP 5分钟内最多3条评论，同一用户1分钟内最多1条评论
- ✅ 嵌套回复：支持最多2层嵌套回复
- ✅ 匿名/登录评论：未登录用户可以匿名评论（需填写昵称）
- ✅ 评论管理：用户可以删除自己的评论
- ✅ 多语言支持：中文、英文、日文、韩文、阿拉伯文
- ✅ 实时验证：前端字数验证，后端频率限制
- ✅ 安全防护：SQL注入防护、XSS防护、RLS行级安全策略

## 数据库设置

### 步骤 1: 运行迁移脚本

在 Supabase SQL Editor 中执行以下文件：

```sql
-- 执行迁移脚本
supabase/migrations/20241230_create_comments.sql
```

### 步骤 2: 验证表创建

确认 `comments` 表已创建，并包含以下字段：
- `id` (uuid) - 主键
- `article_id` (uuid) - 文章ID
- `user_id` (uuid, nullable) - 用户ID（登录用户）
- `author_name` (text) - 作者昵称
- `author_email` (text, nullable) - 作者邮箱
- `content` (text) - 评论内容（6-66字限制）
- `parent_id` (uuid, nullable) - 父评论ID（回复功能）
- `status` (text) - 状态：approved/pending/spam/deleted
- `ip_address` (inet) - IP地址（用于频率限制）
- `user_agent` (text) - 用户代理
- `created_at` (timestamptz) - 创建时间
- `updated_at` (timestamptz) - 更新时间

## 功能特性详解

### 1. 字数限制

**前端验证：**
- 实时字符计数显示
- 少于6字时禁用提交按钮
- 超过66字时显示错误提示

**后端验证：**
```sql
content text not null check (char_length(content) >= 6 and char_length(content) <= 66)
```

### 2. 防刷机制

**频率限制规则：**
- 同一IP地址：5分钟内最多3条评论
- 同一用户：1分钟内最多1条评论

**实现方式：**
使用数据库函数 `check_comment_rate_limit()` 在插入前检查：

```sql
SELECT public.check_comment_rate_limit('192.168.1.1'::inet, auth.uid());
```

**建议配置：**
- 生产环境：获取真实客户端IP（通过 Edge Function 或 API Route）
- 开发环境：使用占位符IP '0.0.0.0'

### 3. 安全策略

**RLS（行级安全）策略：**
1. **读取权限**：所有人可以查看 `approved` 状态的评论
2. **创建权限**：
   - 登录用户：可以创建评论（user_id = auth.uid()）
   - 匿名用户：可以创建评论（需填写 author_email）
3. **更新权限**：用户只能在5分钟内编辑自己的评论
4. **删除权限**：用户只能删除自己的评论
5. **管理员权限**：管理员可以管理所有评论

**防护措施：**
- SQL注入防护：使用 Supabase 参数化查询
- XSS防护：React 自动转义用户输入
- CSRF防护：使用 Supabase Auth tokens
- 频率限制：防止垃圾评论和DDoS攻击

## 使用示例

### 前端集成

评论组件已自动集成到文章详情页：

```tsx
// src/app/blog/[id]/page.tsx
import Comments from '@/components/blog/Comments';

<Comments articleId={article.id} />
```

### 用户流程

**1. 匿名用户评论：**
```
1. 填写昵称（必填）
2. 填写邮箱（选填）
3. 输入评论内容（6-66字）
4. 点击提交
```

**2. 登录用户评论：**
```
1. 自动填充用户昵称
2. 输入评论内容（6-66字）
3. 点击提交
```

**3. 回复评论：**
```
1. 点击评论下方的"回复"按钮
2. 输入回复内容
3. 点击提交
```

**4. 删除评论：**
```
1. 点击自己评论旁的删除图标
2. 确认删除
```

## 管理和维护

### 评论审核

目前评论默认自动通过（status='approved'）。如需手动审核：

1. 修改默认状态为 'pending'：
```sql
-- 在 Comments.tsx 中
status: 'pending', // 改为 pending
```

2. 创建后台审核页面（TODO）：
   - 查看待审核评论
   - 批量通过/拒绝
   - 标记为垃圾评论

### 查看评论统计

```sql
-- 总评论数
SELECT COUNT(*) FROM public.comments WHERE status = 'approved';

-- 某篇文章的评论数
SELECT COUNT(*) FROM public.comments 
WHERE article_id = 'your-article-id' 
AND status = 'approved';

-- 最活跃的评论者
SELECT author_name, COUNT(*) as comment_count
FROM public.comments
WHERE status = 'approved'
GROUP BY author_name
ORDER BY comment_count DESC
LIMIT 10;
```

### 删除垃圾评论

```sql
-- 标记为垃圾评论
UPDATE public.comments
SET status = 'spam'
WHERE id = 'comment-id';

-- 永久删除垃圾评论
DELETE FROM public.comments
WHERE status = 'spam'
AND created_at < NOW() - INTERVAL '30 days';
```

## 故障排除

### 问题 1: 评论无法提交

**可能原因：**
- 字数不符合要求（少于6字或超过66字）
- 触发频率限制
- RLS策略权限问题

**解决方案：**
1. 检查浏览器控制台错误信息
2. 验证字数是否在6-66之间
3. 等待几分钟后重试
4. 检查 Supabase 日志

### 问题 2: 评论不显示

**可能原因：**
- 评论状态不是 'approved'
- RLS策略阻止查询
- 文章ID不匹配

**解决方案：**
1. 检查评论状态：
```sql
SELECT * FROM public.comments WHERE article_id = 'your-article-id';
```
2. 验证 RLS 策略是否正确配置
3. 确认前端传递的 articleId 正确

### 问题 3: 频率限制不生效

**可能原因：**
- IP地址未正确获取
- 数据库函数未创建

**解决方案：**
1. 验证函数存在：
```sql
SELECT proname FROM pg_proc WHERE proname = 'check_comment_rate_limit';
```
2. 在生产环境配置真实IP获取

## 未来改进

1. ✅ 评论表情包支持
2. ✅ 评论点赞功能
3. ✅ 评论举报功能
4. ✅ 后台评论管理页面
5. ✅ 评论通知（邮件/站内消息）
6. ✅ 敏感词过滤
7. ✅ 评论图片上传
8. ✅ 评论排序（最新/最热）
9. ✅ 评论搜索功能
10. ✅ AI辅助审核

## 技术栈

- **前端**：React 19, Next.js 16, TypeScript
- **UI组件**：Tailwind CSS, Lucide Icons
- **后端**：Supabase (PostgreSQL)
- **认证**：Supabase Auth
- **安全**：Row Level Security (RLS)
- **多语言**：自定义i18n系统

## 许可证

MIT License

