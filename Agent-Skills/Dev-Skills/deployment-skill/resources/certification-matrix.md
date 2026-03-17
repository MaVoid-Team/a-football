# Deployment Certification Matrix

## Checklist Categories

### Pre-Deployment (Environment Prep)
- [ ] System updated to latest packages
- [ ] Docker and Docker Compose installed
- [ ] Nginx installed on host
- [ ] Certbot installed for SSL
- [ ] Domain name registered and pointing to VPS
- [ ] VPS has adequate resources (2GB+ RAM, 20GB+ disk)

### Environment Configuration
- [ ] `.env.production` created from `.env.example`
- [ ] Database credentials are strong (20+ chars, random)
- [ ] Database URL is correct
- [ ] `NODE_ENV=production` set
- [ ] All required variables are defined
- [ ] `.env.production` is in `.gitignore`
- [ ] Permissions set: `chmod 600 .env.production`

### Docker Build & Deployment
- [ ] Dockerfile build completes without errors
- [ ] docker-compose.yml syntax is valid
- [ ] Containers start: `docker-compose up -d`
- [ ] All services show as "Up" in `docker-compose ps`
- [ ] No critical errors in logs
- [ ] Database migrations complete successfully

### Nginx Configuration
- [ ] nginx.conf copied to `/etc/nginx/sites-available/`
- [ ] Domain name updated in config
- [ ] SSL paths reference correct certificates
- [ ] Syntax validated: `sudo nginx -t`
- [ ] Nginx restarted: `sudo systemctl restart nginx`
- [ ] Site symlinked in sites-enabled

### SSL Certificate Setup
- [ ] Certificate obtained from Let's Encrypt
- [ ] Certificate file paths correct in nginx config
- [ ] HTTPS works without browser warnings
- [ ] HTTP redirects to HTTPS
- [ ] Certbot auto-renewal configured
- [ ] Renewal test passes: `sudo certbot renew --dry-run`

### Post-Deployment Testing
- [ ] Application loads without errors
- [ ] Forms submit successfully
- [ ] API endpoints return data
- [ ] Database queries work
- [ ] Static assets load (CSS, JS, images)
- [ ] No console errors in browser DevTools
- [ ] Test on mobile device

### Security Verification
- [ ] Database password is not in .env committed to git
- [ ] Security headers present in Nginx responses
- [ ] SSL certificate valid and not self-signed
- [ ] Firewall restricts to ports 22, 80, 443 only
- [ ] No test data with real customer information
- [ ] Admin credentials changed from defaults

### Monitoring & Maintenance
- [ ] Log files are being written
- [ ] Log rotation is configured
- [ ] Disk space is monitored
- [ ] Database backups scheduled
- [ ] Update schedule established
- [ ] On-call procedures documented

## Deployment Phases

| Phase | Status | Notes |
|-------|--------|-------|
| Infrastructure | ⬜ | VPS ready, Docker installed |
| Configuration | ⬜ | .env setup, secrets configured |
| Build & Deploy | ⬜ | Docker containers running |
| Proxy Setup | ⬜ | Nginx routing traffic |
| SSL/TLS | ⬜ | HTTPS enforced, certs valid |
| Testing | ⬜ | All features verified |
| Production | ⬜ | Live and monitoring |

## Certification Sign-Off

- **Deployed By:** _________________
- **Date:** _________________
- **Environment:** Production / Staging / Development
- **All Checklists Completed:** Yes / No
- **Notes:** _________________
