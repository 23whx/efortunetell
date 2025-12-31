# RAG (检索增强生成) 功能使用指南

本项目已集成 RAG 功能，允许用户基于网站文章内容进行智能问答。

## 功能特性

- ✅ **免费方案**：使用 Supabase pgvector（免费）+ DeepSeek API（低成本）
- ✅ **智能问答**：基于文章内容回答用户问题
- ✅ **向量检索**：使用语义搜索找到最相关的内容
- ✅ **多语言支持**：支持中文、英文、日语、韩语、阿拉伯语

## 1. 环境配置

### 1.1 获取 DeepSeek API Key

1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册/登录账号
3. 获取 API Key
4. 添加到 `.env.local` 文件：

```bash
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxx
```

### 1.2 启用 Supabase pgvector

在 Supabase SQL Editor 中执行以下 SQL：

```bash
# 执行 pgvector 扩展迁移
supabase/migrations/20241231_enable_pgvector.sql
```

或者在 Supabase Dashboard > SQL Editor 中手动执行该文件中的 SQL。

## 2. 向量化文章

在使用 RAG 功能前，需要先将文章内容向量化。

### 方法 A：批量向量化所有文章（推荐）

以管理员身份登录后，调用 API：

```bash
curl -X POST http://localhost:14761/api/rag/embed-all \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

### 方法 B：向量化单篇文章

```bash
curl -X POST http://localhost:14761/api/rag/embed-article \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"article_id": "your-article-uuid"}'
```

**注意**：
- 必须以管理员身份登录
- DeepSeek API 有速率限制，批量处理时会自动添加延迟
- 建议在文章发布后自动触发向量化（可在 `/admin/write` 页面添加）

## 3. 使用 AI 问答

### 3.1 访问 AI 问答页面

用户可以通过以下方式访问：

1. 导航栏点击 "AI问答" 链接
2. 直接访问 `/ai-chat` 路径

### 3.2 API 调用

```javascript
// 非流式响应
const response = await fetch('/api/rag/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: '如何通过八字看婚姻？',
    language: 'zh', // zh | en | ja | ko | ar
    stream: false,
  }),
});

const data = await response.json();
console.log(data.answer); // AI 回答
console.log(data.sources); // 参考来源
```

## 4. 架构说明

### 4.1 数据流程

```
用户问题 
  → 生成查询向量 (DeepSeek Embeddings API)
  → pgvector 向量检索 (Supabase)
  → 找到最相关的文章片段
  → 构建上下文提示词
  → 生成回答 (DeepSeek Chat API)
  → 返回答案和来源
```

### 4.2 文件结构

```
src/
├── lib/
│   ├── deepseek/
│   │   └── client.ts          # DeepSeek API 客户端
│   └── rag/
│       ├── embeddings.ts       # 文章分块和向量化
│       └── search.ts           # RAG 检索和问答
├── app/
│   ├── api/rag/
│   │   ├── embed-article/      # 向量化单篇文章
│   │   ├── embed-all/          # 批量向量化
│   │   └── chat/               # AI 问答接口
│   └── ai-chat/
│       └── page.tsx            # AI 问答页面
└── components/
    └── rag/
        └── AIChatBox.tsx       # AI 问答组件

supabase/
└── migrations/
    └── 20241231_enable_pgvector.sql  # pgvector 初始化
```

## 5. 性能优化

### 5.1 向量检索参数

在 `src/lib/rag/search.ts` 中调整：

```typescript
{
  matchThreshold: 0.7,  // 相似度阈值 (0-1)
  matchCount: 5,        // 返回结果数量
}
```

### 5.2 文章分块策略

在 `src/lib/rag/embeddings.ts` 中调整：

```typescript
splitTextIntoChunks(
  text,
  chunkSize: 500,    // 每块字符数
  overlap: 50        // 重叠字符数
)
```

## 6. 成本估算

### DeepSeek API 定价（2024年12月）

- Embeddings: ~¥0.0002/千token
- Chat: ~¥0.001/千token

**示例**：
- 100 篇文章（每篇 2000 字）
- 生成向量：约 ¥0.08
- 用户提问 1000 次：约 ¥2-5

**结论**：RAG 功能成本极低，完全可以免费使用！

## 7. 故障排查

### 问题 1：pgvector 扩展未安装

**错误**：`extension "vector" does not exist`

**解决**：
1. 确认 Supabase 项目已启用 pgvector 扩展
2. 在 Supabase Dashboard > Database > Extensions 中启用 vector

### 问题 2：DeepSeek API 错误

**错误**：`DEEPSEEK_API_KEY is not set`

**解决**：
1. 确认 `.env.local` 中已设置 `DEEPSEEK_API_KEY`
2. 重启开发服务器

### 问题 3：向量检索无结果

**可能原因**：
1. 文章尚未向量化
2. 查询相似度阈值过高

**解决**：
1. 先执行向量化：`POST /api/rag/embed-all`
2. 降低 `matchThreshold` 参数（如改为 0.6）

## 8. 生产部署建议

1. **自动向量化**：在文章发布时自动调用向量化 API
2. **定时同步**：使用 cron job 定期同步新文章
3. **缓存策略**：对热门问题进行缓存，减少 API 调用
4. **速率限制**：对 `/api/rag/chat` 添加速率限制
5. **监控告警**：监控 DeepSeek API 使用量和错误率

## 9. 未来扩展

- [ ] 流式响应（实时显示 AI 回答）
- [ ] 对话历史记录
- [ ] 多轮对话支持
- [ ] 用户反馈系统（回答质量评分）
- [ ] 自动向量化新文章
- [ ] 更多向量数据库选项（Pinecone, Weaviate）

## 支持

如有问题，请查阅：
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Supabase pgvector 文档](https://supabase.com/docs/guides/ai/vector-columns)
- [项目 GitHub Issues](https://github.com/your-repo/issues)

