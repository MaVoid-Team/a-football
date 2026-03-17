#!/bin/bash

# CRM App Docker Deployment Setup Script
# Run this on your VPS: bash setup-docker.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  CRM App - Docker Deployment Setup Script              ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root${NC}"
   exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}[1/6] Updating system packages...${NC}"
apt update && apt upgrade -y > /dev/null 2>&1
echo -e "${GREEN}✓ System updated${NC}"

# Step 2: Install Docker
echo -e "${YELLOW}[2/6] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh > /dev/null 2>&1
    sh get-docker.sh > /dev/null 2>&1
    rm get-docker.sh
    usermod -aG docker $SUDO_USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "${YELLOW}[3/6] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d'"' -f4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose > /dev/null 2>&1
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Step 4: Install Nginx
echo -e "${YELLOW}[4/6] Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt install -y nginx > /dev/null 2>&1
    systemctl start nginx
    systemctl enable nginx
    echo -e "${GREEN}✓ Nginx installed and started${NC}"
else
    echo -e "${GREEN}✓ Nginx already installed${NC}"
fi

# Step 5: Install certbot
echo -e "${YELLOW}[5/6] Installing certbot for SSL...${NC}"
if ! command -v certbot &> /dev/null; then
    apt install -y certbot python3-certbot-nginx > /dev/null 2>&1
    echo -e "${GREEN}✓ Certbot installed${NC}"
else
    echo -e "${GREEN}✓ Certbot already installed${NC}"
fi

# Step 6: Create app directory
echo -e "${YELLOW}[6/6] Creating app directory...${NC}"
mkdir -p /var/docker/apps/crm-app
cd /var/docker/apps/crm-app

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Setup Complete! Next Steps:                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}1. Navigate to app directory:${NC}"
echo "   cd /var/docker/apps/crm-app"
echo ""
echo -e "${YELLOW}2. Clone your repository:${NC}"
echo "   git clone <your-repo-url> ."
echo ""
echo -e "${YELLOW}3. Create .env.production with your settings:${NC}"
echo "   cp .env.example .env.production"
echo "   nano .env.production"
echo ""
echo -e "${YELLOW}4. Build and start containers:${NC}"
echo "   docker-compose up -d"
echo ""
echo -e "${YELLOW}5. Setup Nginx:${NC}"
echo "   sudo cp nginx.conf.example /etc/nginx/sites-available/crm-app"
echo "   sudo nano /etc/nginx/sites-available/crm-app  # Edit domain"
echo "   sudo ln -s /etc/nginx/sites-available/crm-app /etc/nginx/sites-enabled/crm-app"
echo "   sudo nginx -t && sudo systemctl restart nginx"
echo ""
echo -e "${YELLOW}6. Setup SSL certificate:${NC}"
echo "   sudo certbot certonly --standalone -d yourdomain.com"
echo ""
echo -e "${GREEN}For detailed instructions, see: DOCKER_DEPLOYMENT.md${NC}"
echo ""
