# 部署指南

## 📋 部署前准备

### 1. 准备第三方服务

确保你已经配置好以下服务：

- ✅ **Clerk** 账号和应用（用户认证）
- ✅ **Stripe** 账号（支付处理）
- ✅ **PostgreSQL 数据库**（推荐 Neon 或 Supabase）

### 2. 环境变量清单

部署时需要配置以下环境变量（参考 `.env.example`）：

```env
# 应用 URL（部署后更新为实际域名）
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Clerk 认证
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe 支付
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxx
NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID=price_xxx

# 数据库连接
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## 🌐 方案 1：部署到 Vercel（推荐）

### 为什么选择 Vercel？
- ✅ Next.js 官方平台，零配置
- ✅ 自动 CI/CD，每次推送自动部署
- ✅ 全球 CDN，访问速度快
- ✅ 免费额度充足（Hobby 计划）
- ✅ 自带 SSL 证书

### 部署步骤

#### 1. 推送代码到 GitHub

```bash
# 如果还未创建远程仓库，先在 GitHub 上创建
git add .
git commit -m "准备部署到 Vercel"
git push origin main
```

#### 2. 在 Vercel 上导入项目

1. 访问 [vercel.com](https://vercel.com)，使用 GitHub 账号登录
2. 点击 **"Add New Project"**
3. 选择你的 GitHub 仓库 `Saas_With_Payment`
4. 配置项目：
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（保持默认）
   - **Build Command**: `npm run build`（自动填充）
   - **Output Directory**: `.next`（自动填充）

#### 3. 配置环境变量

在 Vercel 项目设置中，进入 **Settings → Environment Variables**，添加所有环境变量：

- `NEXT_PUBLIC_APP_URL`（先填 `https://your-project.vercel.app`，部署后更新）
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
- `DATABASE_URL`

#### 4. 部署

点击 **"Deploy"** 按钮，Vercel 会自动构建和部署你的应用。

#### 5. 部署后配置

##### 5.1 更新 Webhook URL

**Clerk Webhook：**
1. 进入 [Clerk Dashboard](https://dashboard.clerk.com)
2. 选择你的应用 → **Webhooks**
3. 添加 Endpoint: `https://your-project.vercel.app/api/webhooks/clerk`
4. 选择事件：`user.created`
5. 复制 Signing Secret 并更新 Vercel 中的 `CLERK_WEBHOOK_SECRET`

**Stripe Webhook：**
1. 进入 [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers → Webhooks → Add endpoint**
3. Endpoint URL: `https://your-project.vercel.app/api/webhooks/stripe`
4. 选择事件：
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. 复制 Signing Secret 并更新 Vercel 中的 `STRIPE_WEBHOOK_SECRET`

##### 5.2 初始化数据库

在 Vercel 项目的 **Settings → General** 中，找到你的项目 URL，然后：

```bash
# 本地运行数据库迁移（确保 DATABASE_URL 指向生产数据库）
npx prisma db push
```

或者使用 Vercel CLI：

```bash
npx vercel env pull .env.production.local
npx prisma db push
```

##### 5.3 配置自定义域名（可选）

1. 在 Vercel 项目中，进入 **Settings → Domains**
2. 添加你的域名
3. 按照提示配置 DNS 记录（添加 A 或 CNAME 记录）
4. 更新 `NEXT_PUBLIC_APP_URL` 为你的自定义域名

---

## 🐳 方案 2：部署到自己的服务器（Docker）

### 适用场景
- 你有自己的云服务器（阿里云、腾讯云、AWS 等）
- 需要更多控制权
- 希望节省成本

### 前置要求
- 一台服务器（建议 2GB+ 内存）
- 已安装 Docker 和 Docker Compose
- 已配置域名和 SSL 证书（推荐使用 Nginx + Let's Encrypt）

### 快速部署

所有 Docker 相关配置文件已放置在 `docker/` 目录下。

#### 1. 准备环境变量

在项目根目录创建 `.env.production` 文件：

```bash
cp .env.example .env.production
# 编辑 .env.production，填入生产环境配置
```

#### 2. 运行一键部署脚本

```bash
cd docker
./deploy-docker.sh
```

#### 3. 配置 SSL 证书

参考 [`docker/SSL_SETUP.md`](docker/SSL_SETUP.md) 配置 HTTPS。

### 详细文档

完整的 Docker 部署文档请参考：
- **[docker/README.md](docker/README.md)** - Docker 部署完整指南
- **[docker/SSL_SETUP.md](docker/SSL_SETUP.md)** - SSL 证书配置指南

### 包含的配置文件

- `docker/Dockerfile` - 应用镜像构建配置
- `docker/docker-compose.yml` - 服务编排配置
- `docker/nginx.conf` - Nginx 反向代理配置
- `docker/deploy-docker.sh` - 一键部署脚本

---

## 🔧 方案 3：部署到其他平台

### Railway
- 类似 Vercel，支持 GitHub 自动部署
- [railway.app](https://railway.app)

### Render
- 免费额度，自动 SSL
- [render.com](https://render.com)

### Netlify
- 支持 Next.js，但部署配置稍复杂
- [netlify.com](https://netlify.com)

---

## 📊 部署后检查清单

部署完成后，请验证以下功能：

- [ ] 访问首页，确认页面正常加载
- [ ] 测试用户注册和登录（Clerk）
- [ ] 访问 `/pricing` 页面
- [ ] 测试订阅购买流程（使用 Stripe 测试卡号）
- [ ] 检查 Webhook 是否正常工作：
  - Clerk webhook: 注册新用户后检查数据库
  - Stripe webhook: 完成支付后检查订阅状态
- [ ] 访问 `/dashboard`，确认订阅状态显示正确
- [ ] 测试 Stripe Customer Portal（管理订阅）

### Stripe 测试卡号

- **成功支付**: `4242 4242 4242 4242`
- **失败支付**: `4000 0000 0000 0002`
- **需要 3D 验证**: `4000 0025 0000 3155`
- CVC: 任意 3 位数字
- 过期日期: 任意未来日期

---

## 🐛 常见问题

### 1. Webhook 没有触发？

**检查步骤：**
- 确认 Webhook URL 正确（`https://` 开头，不是 `http://`）
- 查看 Clerk/Stripe Dashboard 中的 Webhook 日志
- 确认 Webhook Secret 配置正确
- 检查服务器日志（Vercel: Runtime Logs）

### 2. 数据库连接失败？

- 确认 `DATABASE_URL` 格式正确
- 检查数据库服务商（Neon/Supabase）的连接限制
- 确保已运行 `prisma db push`

### 3. Clerk 认证报错？

- 确认所有 Clerk 环境变量都已配置
- 检查 `NEXT_PUBLIC_APP_URL` 是否与实际域名匹配
- 在 Clerk Dashboard 中添加部署域名到 **Allowed Origins**

### 4. Stripe 支付失败？

- 确认 Stripe 处于 **Live Mode**（生产环境）或 **Test Mode**（测试环境）
- 检查 Price ID 是否正确
- 确认已启用 Alipay 和 WeChat Pay 支付方式

---

## 📚 相关文档

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 部署指南](https://vercel.com/docs)
- [Clerk 部署指南](https://clerk.com/docs/deployments/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment)
