#!/bin/bash

# ===================================
# VPS Setup Script for Docker Deployment
# ===================================
# This script automates the installation of:
# - Docker & Docker Compose
# - Nginx
# - Certbot (Let's Encrypt SSL)
# - Basic firewall configuration
#
# Run with: sudo bash setup-docker.sh
# ===================================

set -e  # Exit on any error

echo "========================================="
echo "  VPS Setup for Docker Deployment"
echo "========================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "ERROR: Please run as root (use sudo)"
    exit 1
fi

# ===================================
# Update System
# ===================================
echo ""
echo "[1/6] Updating system packages..."
apt update && apt upgrade -y

# ===================================
# Install Docker
# ===================================
echo ""
echo "[2/6] Installing Docker..."

# Remove old versions if they exist
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install prerequisites
apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Verify Docker installation
docker --version
echo "✓ Docker installed successfully"

# ===================================
# Install Docker Compose (standalone)
# ===================================
echo ""
echo "[3/6] Installing Docker Compose..."

# Get latest version
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)

# Download and install
curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
echo "✓ Docker Compose installed successfully"

# ===================================
# Install Nginx
# ===================================
echo ""
echo "[4/6] Installing Nginx..."

apt install -y nginx

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

# Verify installation
nginx -v
echo "✓ Nginx installed successfully"

# ===================================
# Install Certbot (Let's Encrypt)
# ===================================
echo ""
echo "[5/6] Installing Certbot for SSL certificates..."

apt install -y certbot python3-certbot-nginx

# Verify installation
certbot --version
echo "✓ Certbot installed successfully"

# ===================================
# Configure Firewall (UFW)
# ===================================
echo ""
echo "[6/6] Configuring firewall..."

# Install UFW if not present
apt install -y ufw

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (IMPORTANT: Don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP and HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall (with confirmation)
echo "y" | ufw enable

# Show status
ufw status
echo "✓ Firewall configured successfully"

# ===================================
# Create Docker Apps Directory
# ===================================
echo ""
echo "Creating Docker apps directory..."
mkdir -p /var/docker/apps
echo "✓ Directory created: /var/docker/apps"

# ===================================
# Optional: Add current user to docker group
# ===================================
if [ -n "$SUDO_USER" ]; then
    echo ""
    echo "Adding $SUDO_USER to docker group..."
    usermod -aG docker $SUDO_USER
    echo "✓ User added to docker group (re-login required)"
fi

# ===================================
# Summary
# ===================================
echo ""
echo "========================================="
echo "  Setup Complete!"
echo "========================================="
echo ""
echo "Installed Components:"
echo "  ✓ Docker: $(docker --version)"
echo "  ✓ Docker Compose: $(docker-compose --version)"
echo "  ✓ Nginx: $(nginx -v 2>&1)"
echo "  ✓ Certbot: $(certbot --version | head -n1)"
echo ""
echo "Firewall Status:"
ufw status numbered
echo ""
echo "Next Steps:"
echo "  1. Clone your application repository to /var/docker/apps/"
echo "  2. Configure your .env.production file"
echo "  3. Run: docker-compose up -d --build"
echo "  4. Configure Nginx (copy nginx.conf.example to /etc/nginx/sites-available/)"
echo "  5. Install SSL: sudo certbot --nginx -d your-domain.com"
echo ""
echo "Note: If you were added to the docker group, log out and back in"
echo "      to run Docker commands without sudo."
echo ""
echo "========================================="

# ===================================
# Optional: System Information
# ===================================
echo ""
echo "System Information:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Kernel: $(uname -r)"
echo "  Memory: $(free -h | awk '/^Mem:/ {print $2}')"
echo "  Disk: $(df -h / | awk 'NR==2 {print $2}')"
echo ""

exit 0
