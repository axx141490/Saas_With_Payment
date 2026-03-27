# Docker 部署配置

本目录包含使用 Docker 部署 SaaS Payment 应用所需的所有配置文件。

## 📁 文件说明

- **Dockerfile** - Docker 镜像构建配置（多阶段构建）
- **docker-compose.yml** - Docker Compose 服务编排配置
- **nginx.conf** - Nginx 反向代理配置（SSL 终止）
- **deploy-docker.sh** - 一键部署脚本
- **SSL_SETUP.md** - SSL 证书配置详细指南

## 🚀 快速开始

### 1. 准备环境变量

在**项目根目录**（不是 docker 目录）创建 `.env.production` 文件：

```bash
cd ..  # 回到项目根目录
cp .env.example .env.production
# 编辑 .env.production，填入真实的配置
```

### 2. 运行部署脚本

```bash
cd docker  # 进入 docker 目录
./deploy-docker.sh
```

脚本会自动：
- 检查 Docker 环境
- 构建 Docker 镜像
- 启动所有服务（应用、数据库、Nginx）
- 运行数据库迁移

### 3. 配置 SSL（可选但推荐）

参考 [SSL_SETUP.md](SSL_SETUP.md) 配置 HTTPS 证书。

## 📋 手动部署步骤

如果你不想使用自动脚本，可以手动执行以下命令：

```bash
# 1. 进入 docker 目录
cd docker

# 2. 构建镜像
docker compose build

# 3. 启动服务
docker compose up -d

# 4. 运行数据库迁移
docker compose exec app npx prisma db push

# 5. 查看日志
docker compose logs -f app
```

## 🔧 常用命令

```bash
# 查看运行状态
docker compose ps

# 查看应用日志
docker compose logs -f app

# 查看所有服务日志
docker compose logs -f

# 重启服务
docker compose restart

# 停止服务
docker compose down

# 停止并删除数据卷（慎用！）
docker compose down -v

# 进入应用容器
docker compose exec app sh

# 进入数据库容器
docker compose exec db psql -U postgres -d saas_payment
```

## 🗂️ 目录结构

部署后的项目结构：

```
Saas_With_Payment/
├── docker/                    # Docker 配置目录（当前目录）
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   ├── deploy-docker.sh
│   ├── SSL_SETUP.md
│   └── README.md
├── ssl/                       # SSL 证书目录（需要手动创建）
│   ├── fullchain.pem
│   └── privkey.pem
├── certbot/                   # Let's Encrypt 证书目录（自动创建）
│   ├── conf/
│   └── www/
├── .env.production            # 生产环境配置（在根目录）
└── ...                        # 其他项目文件
```

## ⚙️ 配置说明

### docker-compose.yml

主要服务：
- **app**: Next.js 应用（端口 3000）
- **db**: PostgreSQL 数据库（端口 5432）
- **nginx**: 反向代理（端口 80, 443）

### 环境变量

所有环境变量从项目根目录的 `.env.production` 文件读取。

### 数据持久化

PostgreSQL 数据保存在 Docker 卷 `postgres-data` 中，即使删除容器也不会丢失数据。

### 网络

所有服务运行在 `app-network` 网络中，可以通过服务名互相访问（如 `http://app:3000`）。

## 🔍 故障排查

### 构建失败

```bash
# 清理缓存重新构建
docker compose build --no-cache
```

### 容器启动失败

```bash
# 查看详细日志
docker compose logs app
```

### 数据库连接失败

```bash
# 检查数据库是否启动
docker compose ps db

# 查看数据库日志
docker compose logs db

# 测试数据库连接
docker compose exec db psql -U postgres -d saas_payment
```

### Nginx 配置错误

```bash
# 测试 Nginx 配置
docker compose exec nginx nginx -t

# 重新加载配置
docker compose exec nginx nginx -s reload
```

## 🌐 访问应用

### 本地访问

- HTTP: http://localhost:3000
- HTTPS: https://localhost:443（配置 SSL 后）

### 生产访问

配置域名和 SSL 后，访问你的域名：
- https://your-domain.com

## 📚 相关文档

- [完整部署指南](../DEPLOYMENT.md) - 包含 Vercel 等其他部署方案
- [SSL 配置指南](SSL_SETUP.md) - Let's Encrypt 证书配置
- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)

## ⚠️ 注意事项

1. **不要将 .env.production 提交到 Git**
2. **定期备份数据库**（使用 `docker compose exec db pg_dump ...`）
3. **监控容器资源使用**（内存、CPU、磁盘）
4. **定期更新镜像**（`docker compose pull && docker compose up -d`）
5. **配置防火墙**（只开放必要端口：80, 443）

## 🔐 安全建议

- 使用强密码配置数据库
- 启用 HTTPS（不要在生产环境使用 HTTP）
- 定期更新 Docker 镜像和依赖
- 使用 `.dockerignore` 避免暴露敏感文件
- 配置 Nginx 安全头（已在 nginx.conf 中配置）
- 限制数据库仅在内部网络访问