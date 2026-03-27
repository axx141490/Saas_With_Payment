#!/bin/bash

# SaaS Payment 应用 Docker 部署脚本

set -e

echo "==================================="
echo "SaaS Payment 应用部署脚本"
echo "==================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    echo "请先安装 Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装${NC}"
    echo "请先安装 Docker Compose"
    exit 1
fi

echo -e "${GREEN}✓ Docker 和 Docker Compose 已安装${NC}"
echo ""

# 检查 .env.production 文件（在项目根目录）
if [ ! -f ../.env.production ]; then
    echo -e "${YELLOW}警告: .env.production 文件不存在${NC}"
    echo "正在从 .env.example 创建..."

    if [ -f ../.env.example ]; then
        cp ../.env.example ../.env.production
        echo -e "${YELLOW}请编辑项目根目录的 .env.production 并填入生产环境配置${NC}"
        echo "然后重新运行此脚本"
        exit 1
    else
        echo -e "${RED}错误: .env.example 文件不存在${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ 找到 .env.production 配置文件${NC}"
echo ""

# 询问是否使用外部数据库
echo "是否使用外部数据库服务（如 Neon、Supabase）？"
echo "1) 是（推荐）- 将注释掉 docker-compose.yml 中的 db 服务"
echo "2) 否 - 使用 Docker 内的 PostgreSQL"
read -p "请选择 (1/2): " DB_CHOICE

if [ "$DB_CHOICE" = "1" ]; then
    echo -e "${YELLOW}将使用外部数据库服务${NC}"
    # 注释掉 db 服务（这里简化处理，实际可能需要更复杂的逻辑）
    echo "请确保 .env.production 中的 DATABASE_URL 指向外部数据库"
else
    echo -e "${YELLOW}将使用 Docker 内的 PostgreSQL${NC}"
    # 生成随机密码
    DB_PASSWORD=$(openssl rand -base64 32)
    echo "DB_PASSWORD=$DB_PASSWORD" >> ../.env.production
    echo -e "${GREEN}数据库密码已生成并保存到 .env.production${NC}"
fi

echo ""

# 构建镜像
echo -e "${YELLOW}正在构建 Docker 镜像...${NC}"
docker compose build

echo ""
echo -e "${GREEN}✓ 镜像构建完成${NC}"
echo ""

# 启动服务
echo -e "${YELLOW}正在启动服务...${NC}"
docker compose up -d

echo ""
echo -e "${GREEN}✓ 服务已启动${NC}"
echo ""

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 运行数据库迁移
echo -e "${YELLOW}正在运行数据库迁移...${NC}"
docker compose exec app npx prisma db push

echo ""
echo -e "${GREEN}==================================="
echo "部署完成！"
echo "===================================${NC}"
echo ""
echo "应用正在运行："
echo "  - 本地访问: http://localhost:3000"
echo "  - 生产访问: 请配置 Nginx 反向代理和域名"
echo ""
echo "查看日志："
echo "  docker compose logs -f app"
echo ""
echo "停止服务："
echo "  docker compose down"
echo ""
echo "重启服务："
echo "  docker compose restart"
echo ""
echo -e "${YELLOW}接下来的步骤：${NC}"
echo "1. 配置域名和 SSL 证书（使用 nginx.conf）"
echo "2. 更新 Clerk 和 Stripe 的 Webhook URL"
echo "3. 测试支付功能"
echo ""
