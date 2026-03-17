# CRM App Deployment Example

This directory contains a complete, working example of deployment documentation and configuration files for the CRM application.

## Files in This Example

### Configuration Files
- **docker-compose.yml** - Orchestrates the CRM app (Next.js) and PostgreSQL database
- **Dockerfile** - Multi-stage build for Next.js application
- **nginx.conf.example** - Production-ready Nginx reverse proxy configuration
- **.env.example** - Environment variables template

### Automation
- **setup-docker.sh** - Automated VPS setup script (installs Docker, Nginx, Certbot)

## Quick Reference

### What Each File Does

| File | Purpose |
|------|---------|
| docker-compose.yml | Defines and runs both the app and database containers |
| Dockerfile | Builds the Next.js app image with multi-stage optimization |
| nginx.conf.example | Routes traffic to the Docker container with SSL/caching/security |
| .env.example | Template for database and app configuration |
| setup-docker.sh | Automates installation of all required VPS tools |

### Directory Structure on VPS

```
/var/docker/apps/crm-app/
├── docker-compose.yml
├── Dockerfile
├── .env.production         (copy from .env.example, fill in your values)
├── nginx.conf.example      (copy to /etc/nginx/sites-available/crm-app)
├── setup-docker.sh         (run on VPS: sudo bash setup-docker.sh)
├── app/
│   ├── api/
│   ├── clients/
│   └── page.js
├── prisma/
│   └── schema.prisma
└── ... (rest of Next.js app files)
```

## Deployment Workflow

### 1. Initial Setup (One-Time)
```bash
# On your VPS
sudo bash setup-docker.sh
```

### 2. Configuration
```bash
# Copy template and customize
cp .env.example .env.production

# Edit with your database password, domain, etc.
nano .env.production

# Secure the file
chmod 600 .env.production
```

### 3. Build & Deploy
```bash
# Build image and start containers
docker-compose up -d

# Check if running
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Nginx Setup
```bash
# Copy to Nginx sites-available
sudo cp nginx.conf.example /etc/nginx/sites-available/crm-app

# Edit domain name
sudo nano /etc/nginx/sites-available/crm-app

# Enable the site
sudo ln -s /etc/nginx/sites-available/crm-app /etc/nginx/sites-enabled/crm-app

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL Certificate
```bash
# Get certificate from Let's Encrypt
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal is set up automatically
sudo systemctl enable certbot.timer
```

## Environment Variables Explained

### Database Configuration
- **DB_USER**: PostgreSQL username (not default!)
- **DB_PASSWORD**: Strong, random password (generate with `openssl rand -base64 32`)
- **DB_NAME**: Database name for the app
- **DATABASE_URL**: Full PostgreSQL connection string

### Application Configuration
- **NODE_ENV**: Must be `production` for deployment
- **NEXTAUTH_SECRET**: (Optional) Encryption key for sessions
- **NEXTAUTH_URL**: Your domain with https:// (matches Nginx domain)

## Common Tasks

### View Logs
```bash
docker-compose logs -f          # All services
docker-compose logs -f crm-app  # Just the app
docker-compose logs -f postgres # Just the database
```

### Update Application
```bash
git pull origin main
docker-compose build
docker-compose up -d
docker-compose exec crm-app npm run prisma:migrate
```

### Database Backup
```bash
docker-compose exec postgres pg_dump -U crm_user crm_db > backup-$(date +%Y%m%d).sql
```

### Restart Services
```bash
docker-compose restart              # Restart all
docker-compose restart crm-app      # Restart just the app
```

## Production Checklist

- [ ] Strong database password set (20+ characters)
- [ ] Domain name points to VPS
- [ ] Nginx config has correct domain name
- [ ] SSL certificate obtained and valid
- [ ] Environment variables configured
- [ ] Docker containers running `docker-compose ps`
- [ ] Nginx routing traffic `curl https://yourdomain.com`
- [ ] Database accessible from app container
- [ ] Backups scheduled

## Architecture

```
Internet → HTTPS (Port 443)
    ↓
Nginx Reverse Proxy
    ↓ HTTP (Port 3000)
Docker Container: crm-app (Next.js)
    ↓
Docker Container: postgres (Database)
    ↓
Persistent Volume: postgres_data
```

## Troubleshooting

### Containers won't start
```bash
docker-compose logs   # Check errors
docker-compose ps     # See status
```

### Database connection failed
```bash
# Verify database is running
docker-compose exec postgres psql -U crm_user -d crm_db

# Check connection string in .env.production
cat .env.production | grep DATABASE_URL
```

### Nginx not working
```bash
# Test config
sudo nginx -t

# Check logs
sudo tail -f /var/log/nginx/crm-app-error.log

# Verify proxy port
curl http://localhost:3000
```

## Scale to Multiple Apps

To host multiple apps on the same VPS:

1. Create separate docker-compose.yml files with different ports (3001, 3002)
2. Create separate Nginx configs for each domain
3. Use subdomains:
   - crm.yourdomain.com → port 3000
   - app2.yourdomain.com → port 3001
   - app3.yourdomain.com → port 3002

See: `../../../NGINX_ADVANCED_CONFIG.md` for multi-app Nginx setup.

## Security Notes

- Never commit `.env.production` to git
- Use strong database passwords
- Keep Nginx security headers enabled
- Regularly backup your database
- Update Docker images monthly
- Monitor logs for suspicious activity
- Use UFW firewall to restrict ports

## Learning Resources

- Docker Compose Documentation: https://docs.docker.com/compose/
- Nginx Documentation: https://nginx.org/en/docs/
- Let's Encrypt / Certbot: https://letsencrypt.org/
- PostgreSQL in Docker: https://hub.docker.com/_/postgres

## Support

For detailed deployment instructions, refer to the skill's main documentation:
- `../DOCKER_DEPLOYMENT.md`
- `../DEPLOYMENT_CHECKLIST.md`
- `../DOCKER_FILES_SUMMARY.md`
- `../NGINX_ADVANCED_CONFIG.md`
