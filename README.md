# SaaS Pay - 支持微信支付和支付宝的 SaaS 平台

一站式 SaaS 订阅管理平台，集成微信支付、支付宝等主流支付方式，助力你快速上线付费功能。

## 技术栈

- **框架**: Next.js 14 (App Router) + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **认证**: Clerk
- **数据库**: PostgreSQL + Prisma ORM
- **支付**: Stripe（支持微信支付、支付宝、银行卡）

## 功能

- 用户注册/登录（Clerk 认证）
- 三级订阅方案（Free / Pro / Enterprise）
- 微信支付、支付宝、银行卡支付
- Stripe Checkout 集成
- Stripe Customer Portal（管理订阅）
- Webhook 处理（Clerk + Stripe）
- 订阅状态管理和权限门控
- 响应式 UI 设计

## 本地开发

### 1. 克隆仓库

```bash
git clone https://github.com/axx141490/Saas_With_Payment.git
cd Saas_With_Payment
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，并填入你的配置：

```bash
cp .env.example .env.local
```

需要配置以下服务的密钥：
- **Clerk**: 注册 [Clerk](https://clerk.com) 获取 API Key
- **Stripe**: 注册 [Stripe](https://stripe.com) 获取 API Key
- **数据库**: 使用 [Supabase](https://supabase.com) 或 [Neon](https://neon.tech) 获取 PostgreSQL 连接字符串

### 4. 同步数据库

```bash
npx prisma db push
```

### 5. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## Stripe 配置

### 启用支付方式

1. 登录 [Stripe Dashboard](https://dashboard.stripe.com)
2. 进入 Settings → Payment methods
3. 启用 **Alipay** 和 **WeChat Pay**

### 创建产品和价格

1. 进入 Products 页面，创建产品
2. 为 Pro 方案创建 ¥99/月 的价格，复制 Price ID 到 `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
3. 为 Enterprise 方案创建 ¥299/月 的价格，复制 Price ID 到 `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`

### 配置 Webhook

1. 进入 Developers → Webhooks
2. 添加 Endpoint: `https://your-domain.com/api/webhooks/stripe`
3. 监听以下事件：
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. 复制 Webhook Secret 到 `STRIPE_WEBHOOK_SECRET`

### 配置 Customer Portal

1. 进入 Settings → Billing → Customer portal
2. 启用并配置允许的操作（取消订阅、更换方案等）

## Clerk 配置

### 创建应用

1. 注册 [Clerk](https://clerk.com) 并创建应用
2. 复制 Publishable Key 和 Secret Key 到环境变量

### 配置 Webhook

1. 进入 Clerk Dashboard → Webhooks
2. 添加 Endpoint: `https://your-domain.com/api/webhooks/clerk`
3. 监听 `user.created` 事件
4. 复制 Signing Secret 到 `CLERK_WEBHOOK_SECRET`

## 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置所有环境变量
4. 部署完成后更新 Stripe 和 Clerk 的 Webhook URL

## 项目结构

```
├── prisma/
│   └── schema.prisma
├── public/
│   └── icons/
│       ├── alipay.svg
│       ├── wechat-pay.svg
│       └── card.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── stripe/
│   │   │   │   ├── checkout/route.ts
│   │   │   │   └── portal/route.ts
│   │   │   └── webhooks/
│   │   │       ├── clerk/route.ts
│   │   │       └── stripe/route.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/          (shadcn/ui 组件)
│   │   ├── navbar.tsx
│   │   ├── pricing-card.tsx
│   │   ├── payment-method-selector.tsx
│   │   ├── manage-subscription-button.tsx
│   │   ├── subscription-badge.tsx
│   │   └── subscription-gate.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── stripe.ts
│   │   └── subscription.ts
│   └── middleware.ts
├── .env.example
├── .env.local
└── README.md
```

## License

Apache-2.0
