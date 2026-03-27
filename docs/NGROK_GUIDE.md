# Ngrok 使用指南

## 📖 什么是 Ngrok？

Ngrok 是一个反向代理工具，可以将本地开发服务器安全地暴露到公网，获得一个公开的 HTTPS URL。

## 🎯 在本项目中的应用场景

### 1. **测试 Stripe Webhooks**
- Stripe 需要发送支付事件到您的服务器
- 本地开发时，Stripe 无法直接访问 localhost
- Ngrok 提供公网 URL，让 Stripe 能够发送 webhook 到本地

### 2. **测试 Clerk Webhooks**
- Clerk 用户事件（注册、更新等）需要 webhook 通知
- 本地开发时需要接收这些事件

### 3. **移动设备测试**
- 使用手机测试支付流程
- 测试响应式设计

### 4. **团队协作演示**
- 快速分享本地开发进度给团队成员
- 无需部署即可展示功能

## 🚀 快速开始

### 安装 Ngrok

#### macOS (使用 Homebrew)
```bash
brew install ngrok/ngrok/ngrok
```

#### Windows (使用 Chocolatey)
```bash
choco install ngrok
```

#### Linux
```bash
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
  sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
  echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
  sudo tee /etc/apt/sources.list.d/ngrok.list && \
  sudo apt update && sudo apt install ngrok
```

#### 或直接下载
访问：https://ngrok.com/download

### 注册并获取 Token

1. 访问 https://dashboard.ngrok.com/signup
2. 注册免费账户
3. 获取 Auth Token
4. 配置 Token：
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

## 📋 基本使用

### 1. 启动本地开发服务器

```bash
npm run dev
# 服务运行在 http://localhost:3000
```

### 2. 启动 Ngrok

在新终端窗口运行：

```bash
ngrok http 3000
```

您会看到类似输出：

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        Asia Pacific (ap)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**重要信息：**
- **公网 URL**: `https://abc123.ngrok-free.app` (每次启动都会变化)
- **Web 控制台**: http://127.0.0.1:4040 (查看请求日志)

### 3. 使用固定域名（付费功能）

```bash
ngrok http 3000 --domain=your-custom-domain.ngrok-free.app
```

## 🔧 配置 Webhooks

### Stripe Webhook 配置

#### 方法 1: 使用 Stripe CLI (推荐)

```bash
# 安装 Stripe CLI
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Stripe CLI 会自动创建 webhook 密钥，复制显示的密钥到 `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

#### 方法 2: 使用 Ngrok

1. 启动 ngrok:
```bash
ngrok http 3000
```

2. 复制 ngrok URL（如 `https://abc123.ngrok-free.app`）

3. 访问 Stripe Dashboard:
   - https://dashboard.stripe.com/test/webhooks
   - 点击 "Add endpoint"
   - 输入：`https://abc123.ngrok-free.app/api/webhooks/stripe`
   - 选择要监听的事件：
     * `checkout.session.completed`
     * `payment_intent.succeeded`
     * `customer.subscription.created`
     * `customer.subscription.updated`
     * `customer.subscription.deleted`

4. 复制 Webhook 签名密钥到 `.env.local`

### Clerk Webhook 配置

1. 启动 ngrok:
```bash
ngrok http 3000
```

2. 访问 Clerk Dashboard:
   - https://dashboard.clerk.com/
   - 选择您的应用
   - 进入 **Webhooks**
   - 点击 "Add Endpoint"

3. 配置 Webhook:
   - **Endpoint URL**: `https://abc123.ngrok-free.app/api/webhooks/clerk`
   - **Events to listen**:
     * `user.created`
     * `user.updated`
     * `user.deleted`

4. 复制 Signing Secret 到 `.env.local`:
```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

## 🛠️ 高级用法

### 使用配置文件

创建 `ngrok.yml` 配置文件：

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  saas-payment:
    proto: http
    addr: 3000
    hostname: your-custom-domain.ngrok-free.app # 付费功能
    inspect: true
    bind_tls: true
```

启动：
```bash
ngrok start saas-payment
```

### 查看请求日志

访问 Ngrok Web 界面：http://127.0.0.1:4040

功能：
- 查看所有 HTTP 请求和响应
- 重放请求（Replay）
- 查看请求详情（Headers、Body）
- 调试 Webhook

### 使用环境变量

```bash
# 设置区域（减少延迟）
ngrok http 3000 --region=ap  # Asia Pacific

# 添加基础认证
ngrok http 3000 --auth="username:password"

# 自定义子域名（付费功能）
ngrok http 3000 --subdomain=myapp
```

## 📝 项目集成示例

### 完整工作流

1. **启动本地服务**
```bash
# 终端 1: 启动开发服务器
npm run dev
```

2. **启动 Ngrok**
```bash
# 终端 2: 启动 ngrok
ngrok http 3000
```

3. **配置环境变量**

更新 `.env.local`，添加 ngrok URL:
```env
# 将 ngrok URL 设置为应用 URL（用于回调）
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

4. **重启开发服务器**（加载新环境变量）
```bash
# 停止并重启
Ctrl + C
npm run dev
```

5. **配置 Webhooks**（参考上文）

6. **测试支付流程**
   - 访问：`https://abc123.ngrok-free.app`
   - 注册/登录
   - 测试充值功能
   - 在 Ngrok 控制台查看 webhook 请求

## ⚠️ 注意事项

### 免费版限制

- ✅ HTTPS 加密
- ✅ 基本隧道功能
- ❌ 固定域名（每次重启 URL 会变）
- ❌ 自定义域名
- ⚠️ 每分钟请求数限制

### 安全建议

1. **不要在生产环境使用 Ngrok**
   - Ngrok 仅用于开发和测试
   - 生产环境使用正式域名和 SSL

2. **保护敏感端点**
   - 考虑添加基础认证
   - 不要暴露数据库管理界面

3. **定期更换 Auth Token**
   - 如果 Token 泄露，立即在 Dashboard 重置

4. **使用环境变量**
   - 不要将 ngrok URL 硬编码到代码中
   - 使用 `NEXT_PUBLIC_APP_URL` 环境变量

## 🐛 常见问题

### 1. Ngrok URL 无法访问

**原因**：防火墙或网络限制

**解决**：
```bash
# 尝试不同区域
ngrok http 3000 --region=us
ngrok http 3000 --region=eu
ngrok http 3000 --region=ap
```

### 2. Webhook 接收不到

**检查清单**：
- ✅ Ngrok 是否正在运行
- ✅ 本地服务器是否运行
- ✅ Webhook URL 配置正确（包含 `/api/webhooks/stripe`）
- ✅ 在 Ngrok 控制台查看是否收到请求
- ✅ 检查服务器日志

### 3. 每次重启 URL 都变

**解决方案**：
- 升级到付费计划获取固定域名
- 或使用 Stripe CLI 的 `stripe listen` 命令（无需 ngrok）

### 4. 请求超时

**原因**：网络延迟或区域选择不当

**解决**：
```bash
# 选择最近的区域
ngrok http 3000 --region=ap  # 亚太
```

## 📚 相关资源

- [Ngrok 官方文档](https://ngrok.com/docs)
- [Stripe Webhook 测试](https://stripe.com/docs/webhooks/test)
- [Clerk Webhook 配置](https://clerk.com/docs/webhooks/overview)
- [Ngrok Dashboard](https://dashboard.ngrok.com/)

## 🔗 相关文档

- [项目 README](../README.md)
- [部署文档](./DEPLOYMENT.md)
- [环境变量配置](./ENV_VARIABLES.md)

---

**最后更新**: 2026-03-27
**维护者**: Development Team
