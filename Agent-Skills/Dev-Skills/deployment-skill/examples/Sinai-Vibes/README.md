# [App Name] Deployment Example

This directory contains deployment configuration for [brief description of the application].

## Tech Stack
- **Framework**: [e.g., Next.js 14, Django 4.2, Express.js 5, Go 1.21]
- **Database**: [e.g., PostgreSQL 15, MySQL 8.0, MongoDB 6.0, SQLite]
- **Reverse Proxy**: [e.g., Nginx, Caddy]
- **Container Runtime**: Docker + Docker Compose
- **Additional Services**: [e.g., Redis, RabbitMQ, Elasticsearch - if applicable]

## Files in This Example

| File | Purpose |
|------|---------|
| docker-compose.yml | Describes and orchestrates the application and database containers |
| Dockerfile | Multi-stage build configuration for the application |
| nginx.conf.example | Production-ready reverse proxy with SSL, security headers, and caching |
| .env.example | Environment variables template with all required configuration |
| setup-docker.sh | Automated VPS setup script (Docker, Nginx, Certbot installation) |

## VPS Directory Structure

```
/var/docker/apps/[app-name]/
├── docker-compose.yml
├── Dockerfile
├── .env.production           # Copy from .env.example and fill in real values
├── nginx.conf.example        # Copy to /etc/nginx/sites-available/[app-name]
├── setup-docker.sh          # Run once: sudo bash setup-docker.sh
├── [app-specific-folders]/  # Your application code
│   ├── src/
│   ├── public/
│   └── ...
└── data/                    # Docker volumes (created automatically)
    ├── postgres/            # Database persistent storage
    └── uploads/             # Application file uploads (if applicable)
```

## Quick Deployment

### 1. Initial VPS Setup (One-Time)
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Run the automated setup script
sudo bash setup-docker.sh

# Verify installations
docker --version
docker-compose --version
nginx -v
```

### 2. Deploy Application
```bash
# Create app directory
sudo mkdir -p /var/docker/apps/[app-name]
cd /var/docker/apps/[app-name]

# Clone your repository
git clone https://github.com/yourusername/[app-name].git .

# Configure environment
cp .env.example .env.production
nano .env.production  # Fill in your actual values

# Build and start containers
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

### 3. Configure Nginx
```bash
# Copy Nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/[app-name]

# Update the configuration with your domain
sudo nano /etc/nginx/sites-available/[app-name]
# Change 'your-domain.com' to your actual domain

# Enable the site
sudo ln -s /etc/nginx/sites-available/[app-name] /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 4. Setup SSL Certificate
```bash
# Install SSL certificate with Let's Encrypt
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certbot will automatically modify your Nginx config
# and set up auto-renewal
```

### 5. Verify Deployment
```bash
# Check if containers are running
docker-compose ps

# Test the application
curl -I https://your-domain.com

# View logs
docker-compose logs app
docker-compose logs db
```

## Environment Variables

Required variables in `.env.production`:

```bash
# Database Configuration
DATABASE_URL=postgresql://db_user:db_password@db:5432/db_name
POSTGRES_USER=db_user
POSTGRES_PASSWORD=db_password
POSTGRES_DB=db_name

# Application Configuration
NODE_ENV=production
PORT=3000
APP_URL=https://your-domain.com

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# [Add any additional environment variables specific to your app]
```

## Management Commands

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Clean old images
docker image prune -f
```

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U db_user db_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker-compose exec -T db psql -U db_user db_name < backup_20260306_120000.sql
```

### Stop/Start
```bash
# Stop all containers
docker-compose down

# Start containers
docker-compose up -d

# Stop and remove volumes (CAUTION: This deletes data!)
docker-compose down -v
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check if port is already in use
sudo netstat -tulpn | grep :3000

# Rebuild from scratch
docker-compose down
docker-compose up -d --build --force-recreate
```

### Database Connection Issues
```bash
# Verify database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection from app container
docker-compose exec app ping db
```

### SSL Certificate Issues
```bash
# Renew certificate manually
sudo certbot renew --dry-run

# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

### Nginx Configuration Errors
```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

## Notes

- **Last Verified**: [Date when this configuration was last tested]
- **Special Considerations**: 
  - [Any specific requirements or limitations]
  - [Performance considerations]
  - [Known issues or workarounds]

## Related Resources

- Official Documentation: [Link to framework/tool docs]
- Docker Hub Images: [Link to any custom or specific images used]
- Related Examples: [Link to similar examples if applicable]
