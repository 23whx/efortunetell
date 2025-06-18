# 🏗️ 易经预测博客系统架构说明书

## 📋 项目概述

这是一个基于前后端分离的易经预测博客系统，采用现代化的云原生架构。

### 🎯 核心功能
- 易经预测服务
- 博客文章管理
- 用户认证与管理
- 预约服务系统
- 管理后台

## 🌐 系统架构图

```
用户浏览器
    ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                           │
│  ┌─────────────────┐              ┌─────────────────────┐   │
│  │ www.efortunetell │              │ api.efortunetell    │   │
│  │ .blog           │              │ .blog               │   │
│  └─────────────────┘              └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │ 直连                                 │ 代理
         │ (仅DNS)                              │ (橙云)
         ↓                                      ↓
┌─────────────────┐                   ┌─────────────────────┐
│     Vercel      │                   │    VPS Server       │
│   (前端托管)     │                   │ (172.245.144.253)   │
│                 │                   │                     │
│  Next.js 应用   │                   │  ┌───────────────┐  │
│  - 博客页面     │                   │  │    Nginx      │  │
│  - 用户界面     │                   │  │ (反向代理+SSL) │  │
│  - 管理后台     │                   │  └───────────────┘  │
│                 │                   │         │           │
└─────────────────┘                   │         ↓           │
                                      │  ┌───────────────┐  │
                                      │  │ Docker Compose│  │
                                      │  │               │  │
                                      │  │ ┌───────────┐ │  │
                                      │  │ │  Node.js  │ │  │
                                      │  │ │  Express  │ │  │
                                      │  │ │    API    │ │  │
                                      │  │ │ :5000     │ │  │
                                      │  │ └───────────┘ │  │
                                      │  │               │  │
                                      │  │ ┌───────────┐ │  │
                                      │  │ │ MongoDB   │ │  │
                                      │  │ │ Database  │ │  │
                                      │  │ │ :27017    │ │  │
                                      │  │ └───────────┘ │  │
                                      │  └───────────────┘  │
                                      └─────────────────────┘
```

## 🔧 技术栈详细说明

### 前端 (E-Front-end)
- **框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **样式**: TailwindCSS
- **部署平台**: Vercel
- **域名**: www.efortunetell.blog
- **CDN**: 通过Cloudflare (仅DNS模式)

#### 关键配置文件
```bash
E-Front-end/
├── next.config.mjs     # Next.js配置，API代理设置
├── vercel.json         # Vercel部署配置
├── src/config/api.ts   # API基础URL配置
└── src/app/            # 页面和路由
```

### 后端 (E-Backend-Project)
- **框架**: Express.js (Node.js)
- **数据库**: MongoDB
- **认证**: JWT + bcrypt
- **文件上传**: 支持图片上传到本地存储
- **部署**: Docker + Docker Compose
- **服务器**: VPS (Ubuntu)
- **域名**: api.efortunetell.blog

#### 关键配置文件
```bash
E-Backend-Project/
├── docker-compose.prod.yml    # 生产环境Docker配置
├── src/app.js                 # Express应用入口
├── src/config/                # 数据库、CORS等配置
├── src/routes/                # API路由定义
├── src/controllers/           # 业务逻辑控制器
├── src/models/                # MongoDB数据模型
└── public/images/             # 文章图片存储目录
```

## 🌍 域名与DNS配置

### Cloudflare DNS记录
```
类型    名称                    内容                      代理状态
A       @                      172.245.144.253           🟠 已代理
A       api                    172.245.144.253           🟠 已代理  
CNAME   www                    cname.vercel-dns.com      🔘 仅DNS
CAA     efortunetell.blog      0 issue letsencrypt.org   🔘 仅DNS
NS      efortunetell.blog      ns1.vercel-dns.com        🔘 仅DNS
NS      efortunetell.blog      ns2.vercel-dns.com        🔘 仅DNS
```

### 域名访问流程
1. **www.efortunetell.blog** → 直连Vercel → 前端应用
2. **efortunetell.blog** → Cloudflare → VPS → 301重定向到www
3. **api.efortunetell.blog** → Cloudflare → VPS → Nginx → Express API

## 🔒 SSL/TLS配置

### Cloudflare设置
- **SSL模式**: Full (Strict) 
- **加密**: 端到端HTTPS加密
- **证书**: Cloudflare通用SSL证书

### VPS SSL配置
- **证书提供商**: Let's Encrypt
- **域名覆盖**: api.efortunetell.blog, efortunetell.blog
- **自动续期**: 通过crontab设置
- **Nginx配置**: 监听443端口，SSL终止

## 📦 部署配置

### 前端部署 (Vercel)
```json
// vercel.json
{
  "redirects": [
    {
      "source": "/api/:path*",
      "destination": "https://api.efortunetell.blog/api/:path*"
    }
  ],
  "rewrites": [
    {
      "source": "/images/:path*", 
      "destination": "https://api.efortunetell.blog/images/:path*"
    }
  ]
}
```

### 后端部署 (Docker)
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  yi-backend-prod:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - yi-mongodb-prod
      
  yi-mongodb-prod:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
```

### Nginx反向代理配置
```nginx
# /etc/nginx/sites-available/production

# 根域名重定向
server {
    listen 443 ssl;
    server_name efortunetell.blog;
    ssl_certificate /etc/letsencrypt/live/api.efortunetell.blog/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.efortunetell.blog/privkey.pem;
    return 301 https://www.efortunetell.blog$request_uri;
}

# API服务器
server {
    listen 443 ssl;
    server_name api.efortunetell.blog;
    ssl_certificate /etc/letsencrypt/live/api.efortunetell.blog/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.efortunetell.blog/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔄 数据流详解

### 1. 前端页面访问
```
用户访问 www.efortunetell.blog
    ↓
Cloudflare DNS解析 (仅DNS模式)
    ↓
直连Vercel服务器
    ↓
返回Next.js渲染的页面
```

### 2. API调用流程
```
前端发起API请求 (/api/*)
    ↓
Next.js rewrites规则
    ↓
重写为 https://api.efortunetell.blog/api/*
    ↓
Cloudflare CDN (橙云代理)
    ↓
VPS Nginx反向代理
    ↓
Docker容器中的Express应用
    ↓
MongoDB数据库操作
    ↓
返回JSON响应
```

### 3. 图片资源访问
```
前端请求图片 (/images/*)
    ↓
Next.js rewrites规则
    ↓
重写为 https://api.efortunetell.blog/images/*
    ↓
Cloudflare CDN缓存
    ↓
VPS静态文件服务
    ↓
返回图片文件
```

## 🛠️ 环境变量配置

### 前端环境变量
```bash
# .env.local (可选，有默认值)
NEXT_PUBLIC_API_URL=https://api.efortunetell.blog
NEXT_PUBLIC_ENVIRONMENT=production
```

### 后端环境变量
```bash
# .env (VPS上必需)
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://username:password@mongodb:27017/yi-divination?authSource=admin
JWT_SECRET=your_64_character_random_jwt_secret
SESSION_SECRET=your_64_character_random_session_secret
CORS_ORIGIN=https://www.efortunetell.blog
BCRYPT_ROUNDS=12
```

## 🔍 监控与维护

### 健康检查端点
- **后端API**: `https://api.efortunetell.blog/api/ping`
- **预期响应**: `{"success":true,"message":"pong","timestamp":"..."}`

### 日志位置
```bash
# VPS上的日志位置
/home/yiuser/E-Backend-Project/
├── docker logs yi-backend-prod     # 后端应用日志
├── docker logs yi-mongodb-prod     # 数据库日志
└── /var/log/nginx/                  # Nginx访问和错误日志
```

### SSL证书自动续期
```bash
# crontab设置
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🚨 故障排查指南

### 常见问题及解决方案

#### 1. 前端无法访问
- 检查Vercel部署状态
- 确认DNS记录中www指向cname.vercel-dns.com
- 检查Cloudflare代理状态（应为灰云）

#### 2. API调用失败
- 检查VPS上Docker容器状态：`docker ps`
- 检查Nginx配置：`sudo nginx -t`
- 检查SSL证书有效性：`curl -I https://api.efortunetell.blog/api/ping`

#### 3. 重定向循环
- 确认efortunetell.blog在Cloudflare中指向VPS（橙云）
- 确认efortunetell.blog不在Vercel域名配置中
- 检查Nginx重定向配置

#### 4. 图片加载失败
- 确认图片存在于VPS的/home/yiuser/E-Backend-Project/public/images/
- 检查Nginx静态文件服务配置
- 验证Next.js的rewrites规则

## 📈 性能优化建议

### CDN缓存策略
- 静态资源通过Cloudflare CDN缓存
- API响应设置合适的Cache-Control头

### 数据库优化
- MongoDB索引优化
- 定期备份数据库

### 安全措施
- JWT令牌定期轮换
- API速率限制
- CORS策略严格控制
- HTTPS强制使用

## 🔄 更新部署流程

### 前端更新
```bash
# 本地开发环境
cd E-Front-end
git add .
git commit -m "feat: 更新内容"
git push origin main
# Vercel自动部署，约1-2分钟完成
```

### 后端更新
```bash
# VPS上更新
ssh yiuser@172.245.144.253
cd /home/yiuser/E-Backend-Project
git pull origin main
sudo docker-compose -f docker-compose.prod.yml down
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

## 📞 联系信息

### 服务器访问
- **VPS IP**: 172.245.144.253
- **SSH用户**: yiuser
- **项目路径**: /home/yiuser/E-Backend-Project

### 域名管理
- **域名注册商**: [填写你的域名注册商]
- **DNS管理**: Cloudflare
- **SSL证书**: Let's Encrypt (自动续期)

---

## 🤖 AI助手使用说明

当你需要AI协助排查问题时，请提供以下信息：

1. **具体错误信息**：完整的错误日志或错误消息
2. **问题发生的环节**：前端、后端、还是域名访问
3. **最近的修改**：是否有代码更新或配置变更
4. **当前状态**：各服务的运行状态

AI可以根据此架构说明书快速理解系统结构，提供准确的故障排查建议。

---

**文档版本**: v1.0  
**最后更新**: 2025年6月18日  
**维护者**: 系统管理员 