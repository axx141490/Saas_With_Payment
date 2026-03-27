# SSL 证书配置指南（使用 Let's Encrypt）

本指南帮助你为部署在自己服务器上的应用配置免费的 SSL 证书。

## 前置要求

- 已有域名（如 `example.com`）
- 域名 DNS 已解析到服务器 IP
- 服务器开放 80 和 443 端口

## 方法 1：使用 Certbot（推荐）

### 1. 安装 Certbot

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install certbot
```

**CentOS/RHEL:**
```bash
sudo yum install certbot
```

**macOS:**
```bash
brew install certbot
```

### 2. 停止 Nginx（如果正在运行）

```bash
docker compose stop nginx
```

### 3. 获取证书

```bash
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

证书将保存在：
- `/etc/letsencrypt/live/your-domain.com/fullchain.pem`
- `/etc/letsencrypt/live/your-domain.com/privkey.pem`

### 4. 更新 nginx.conf

编辑 `nginx.conf`，将 `your-domain.com` 替换为你的实际域名。

### 5. 重启 Nginx

```bash
docker compose up -d nginx
```

### 6. 设置自动续期

Let's Encrypt 证书有效期为 90 天，需要定期续期。

创建续期脚本 `/etc/cron.daily/certbot-renew`:

```bash
#!/bin/bash
certbot renew --quiet --pre-hook "docker compose -f /path/to/your/project/docker-compose.yml stop nginx" --post-hook "docker compose -f /path/to/your/project/docker-compose.yml start nginx"
```

给脚本执行权限：

```bash
sudo chmod +x /etc/cron.daily/certbot-renew
```

---

## 方法 2：使用 Docker + Certbot

### 1. 创建 docker-compose-ssl.yml

```yaml
version: '3.8'

services:
  certbot:
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

### 2. 获取初始证书

```bash
docker compose -f docker-compose-ssl.yml run --rm certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d your-domain.com \
  -d www.your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive
```

### 3. 启动自动续期服务

```bash
docker compose -f docker-compose-ssl.yml up -d
```

---

## 方法 3：使用云服务商提供的 SSL

### 阿里云

1. 登录阿里云控制台
2. 进入 **SSL 证书服务**
3. 申请免费证书（有效期 1 年）
4. 下载证书文件
5. 将证书文件放到 `./ssl` 目录

### 腾讯云

1. 登录腾讯云控制台
2. 进入 **SSL 证书管理**
3. 申请免费证书（有效期 1 年）
4. 下载证书文件（选择 Nginx 格式）
5. 将证书文件放到 `./ssl` 目录

### AWS Certificate Manager

1. 在 AWS Console 中创建证书
2. 验证域名所有权
3. 配置到 Application Load Balancer

### Cloudflare（推荐）

1. 将域名 NS 记录指向 Cloudflare
2. 在 Cloudflare 中开启 SSL（免费）
3. 设置 SSL 模式为 **Full** 或 **Full (Strict)**
4. Cloudflare 会自动处理 SSL 证书

---

## Nginx 配置说明

### SSL 配置优化

编辑 `nginx.conf`，确保包含以下配置：

```nginx
# 强制使用 HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 协议和加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 其他安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # 代理到 Next.js 应用
    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 测试 SSL 配置

### 1. 测试 SSL 评分

访问 [SSL Labs](https://www.ssllabs.com/ssltest/) 并输入你的域名，检查 SSL 配置安全性。

### 2. 检查证书有效期

```bash
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -noout -dates
```

### 3. 验证 HTTPS 访问

```bash
curl -I https://your-domain.com
```

应该看到 `200 OK` 响应。

---

## 常见问题

### 1. 证书获取失败？

- 确认域名 DNS 已正确解析
- 确认 80 端口可访问
- 检查防火墙设置

### 2. Nginx 启动失败？

- 检查证书路径是否正确
- 查看 Nginx 日志：`docker compose logs nginx`

### 3. 浏览器显示"不安全"？

- 检查证书是否过期
- 确认证书域名与访问域名匹配
- 清除浏览器缓存

---

## 推荐的 SSL 配置检查清单

- [ ] 证书已成功获取
- [ ] Nginx 配置已更新域名
- [ ] HTTPS 可正常访问（https://your-domain.com）
- [ ] HTTP 自动重定向到 HTTPS
- [ ] SSL Labs 评分 A 或以上
- [ ] 自动续期已配置（Let's Encrypt）
- [ ] Webhook URL 已更新为 HTTPS（Clerk + Stripe）
