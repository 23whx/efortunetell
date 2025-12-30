# E-Fortune Tell

一个现代化的命理网站，基于 Next.js 16 和 Supabase 构建。

**作者**: 23whx

## 功能特性

- 📝 富文本文章编辑器（基于 Tiptap）
- 🌐 多语言支持（中文、英文、日文、韩文、阿拉伯文）
- 🔐 用户认证和授权（Supabase Auth）
- 📊 后台管理系统
- 🎨 响应式设计
- 🔍 SEO 优化
- 📱 移动端适配

## 技术栈

- **前端框架**: Next.js 16 (App Router)
- **UI 组件**: React 19, Tailwind CSS
- **富文本编辑器**: Tiptap
- **后端服务**: Supabase (Auth, Database, Storage)
- **部署平台**: Vercel

## 开发环境配置

### 1. 环境变量

创建 `.env.local` 文件并配置以下变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器会在 [http://localhost:14761](http://localhost:14761) 启动。

**⚠️ 重要说明**:
- 使用 `npm run dev` 启动开发服务器，它会自动检测端口占用并询问是否清理
- 开发服务器使用端口 14761
- **新功能**: 启动时会自动检测端口占用，并询问你是否清理

### 4. 进程管理 ⭐ 交互式端口检测

本项目包含智能进程管理功能：

- **交互式检测**: 启动时自动检查端口，如果被占用会询问是否清理
- **安全提示**: 显示占用端口的进程信息，让你决定是否终止
- **自动清理**: 终端关闭时自动释放端口
- **异常处理**: 处理进程异常退出情况
- **信号捕获**: 捕获 SIGINT、SIGTERM、SIGHUP 等信号

详细说明请查看 [`scripts/README.md`](scripts/README.md)。

## 项目结构

```
efortunetell/
├── src/
│   ├── app/              # Next.js App Router 页面
│   ├── components/       # React 组件
│   ├── contexts/         # React Context (语言、主题等)
│   ├── lib/              # 工具库和配置
│   └── utils/            # 工具函数
├── public/               # 静态资源
├── scripts/              # 开发脚本
├── supabase/             # Supabase 数据库 Schema
└── .vscode/              # VS Code 配置
```

## 可用脚本

- `npm run dev` - 启动开发服务器（自动管理进程）
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行 ESLint 检查
- `npm run clean-port` - 清理被占用的端口

## 常见问题

### 端口被占用

如果遇到 `EADDRINUSE: address already in use :::14761` 错误：

**方式 1**（推荐）：重新运行 `npm run dev`，脚本会自动检测并询问是否清理

**方式 2**：手动清理端口
```bash
npm run clean-port
npm run dev
```

**交互示例**：
```
⚠️  警告：端口 14761 正在被使用！
发现以下进程占用端口：
  - PID: 12345

是否清理端口并重新启动？(Y/n): y

✓ 端口已清理，准备启动...
```

### 环境变量未配置

如果看到 Supabase 相关错误，请确保：
1. 已创建 `.env.local` 文件
2. 配置了正确的 Supabase URL 和密钥
3. 重启开发服务器

### 图片上传失败

确保 Supabase Storage 中已创建 `blog-images` bucket，并配置了正确的访问策略。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
