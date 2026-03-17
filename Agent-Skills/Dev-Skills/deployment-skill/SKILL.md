---
name: deployment-skill
description: Expert Docker and Nginx deployment assistant. Use for Docker configuration, containerization, VPS deployment, infrastructure setup, SSL certificates, docker-compose files, nginx reverse proxy, deployment guides, infrastructure documentation, cloud deployment, container orchestration, production deployment, environment configuration, dockerfiles, server setup, deployment checklists.
---

# Deployment Documentation Skill

This skill generates professional-grade deployment documentation for applications deployed on VPS/server infrastructure with Docker and Nginx. It produces actionable guides, checklists, and configuration templates.

## Overview

When creating deployment documentation, the agent produces:

- **DOCKER_DEPLOYMENT.md** - Complete deployment guide with step-by-step instructions
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment verification checklists
- **nginx.conf.example** - Production-ready reverse proxy configuration
- **.env.example** - Environment variables template
- **setup-docker.sh** - Automated setup script for VPS
- **DOCKER_FILES_SUMMARY.md** - Overview of all created files and purposes
- **NGINX_ADVANCED_CONFIG.md** - Alternative Nginx setups for complex scenarios

## Prerequisites Analysis

Before generating documentation, analyze the project for:

- **Framework**: Node.js, Python, Go, etc.
- **Database**: PostgreSQL, MySQL, SQLite, MongoDB, etc.
- **Current Configuration**: Existing environment files, docker files, package.json
- **Scale**: Single app vs. multi-app VPS setup
- **SSL/TLS**: Certificate strategy (Let's Encrypt, custom certs, etc.)

## Generation Workflow

### 1. Project Analysis Phase
```bash
# Check for existing Docker files
find . -name "Dockerfile" -o -name "docker-compose*" -o -name "*.conf"

# Identify database provider
grep -r "DATABASE_URL\|postgres\|mysql\|mongodb" . --include="*.md" --include="*.js" --include="*.ts" --include="*.prisma"

# Check environment files
ls -la | grep -E "\.env|config"

# Examine package.json for build/start scripts
cat package.json | grep -A 5 '"scripts"'
```

### 2. Documentation Structure

#### **DOCKER_DEPLOYMENT.md**
Include these sections:
- Prerequisites (Docker, Docker Compose, Nginx, SSL certs)
- Environment Variables with explanations
- Step-by-step deployment (clone, setup, build, start)
- Nginx configuration instructions
- SSL/TLS setup with Let's Encrypt/Certbot
- Database management (backups, migrations)
- Application management (logs, updates, monitoring)
- Troubleshooting section with common issues and solutions
- Security best practices
- Multi-app hosting hints

#### **DEPLOYMENT_CHECKLIST.md**
Create organized checklists for:
- [ ] Pre-Deployment Tasks
- [ ] Environment Configuration
- [ ] Docker Build & Deployment
- [ ] Nginx Setup
- [ ] SSL Certificate Setup
- [ ] Post-Deployment Testing
- [ ] Security Verification
- [ ] Monitoring Setup
- [ ] Backup & Recovery
- [ ] Ongoing Maintenance

#### **nginx.conf.example**
Configure:
- HTTP to HTTPS redirect
- SSL/TLS with security protocols
- Security headers (HSTS, CSP, X-Frame-Options)
- Gzip compression
- Static file caching (60+ days for versioned assets)
- Proxy settings with correct headers for app type
- Rate limiting (optional)
- Log file paths
- Comments for customization points

#### **.env.example**
Template with:
- Database credentials (username, password, name, connection string)
- Node/runtime environment (NODE_ENV, etc.)
- Application URLs (NEXTAUTH_URL, API_BASE_URL)
- Secrets (NEXTAUTH_SECRET, API_KEYS)
- Optional features (auth, features flags)
- Comments explaining each variable
- Warnings about sensitive defaults

#### **Dockerfile**
Options based on stack:
- **Node.js/Next.js**: Multi-stage Alpine build
- **Python**: Python slim image with pip dependencies
- **Go**: Multi-stage for minimal binary size
- Include:
  - Non-root user for security
  - Health checks if applicable
  - Proper signal handling (dumb-init for Node.js)
  - Layer optimization for caching

#### **docker-compose.yml**
Structure:
- Service definitions (app + database + optional services)
- Environment variables from .env file
- Ports (internal mapping only, expose through Nginx)
- Volumes for persistent data
- Health checks with dependencies
- Networks for service isolation
- Restart policies

#### **setup-docker.sh**
Automate:
- System package updates
- Docker installation
- Docker Compose installation
- Nginx installation
- Certbot (Let's Encrypt) installation
- Directory creation
- User setup (add to docker group)
- Interactive next steps

#### **DOCKER_FILES_SUMMARY.md**
Document:
- Purpose of each file
- Environment variables explained
- Deployment architecture diagram
- Quick start commands
- Performance considerations
- Security features
- Troubleshooting quick links

#### **NGINX_ADVANCED_CONFIG.md**
Provide alternatives for:
- Subdomain routing (crm.domain.com)
- Subpath routing (domain.com/crm)
- Multiple nginx server blocks
- Load balancing across multiple containers
- SSL certificate generation for multiple domains
- Common multi-app issues and solutions

### 3. Customization Points

The agent should identify and document:

- **Domain name**: Replace example.com with actual domain
- **Database credentials**: Generate strong defaults, note to change
- **Ports**: Internal app ports (3000, 3001) vs external (80, 443)
- **Database provider**: PostgreSQL recommended for production
- **SSL certificates**: Let's Encrypt setup for HTTPS
- **Multi-app scaling**: Instructions for hosting multiple apps
- **Backup strategy**: Database backup frequency and retention

### 4. Content Quality Standards

✅ **Do**:
- Use specific commands (not abstractions)
- Include error scenarios and solutions
- Provide working examples that can be copy-pasted
- Add comments explaining "why" not just "how"
- Link between related documentation
- Use tables for quick reference
- Include security warnings where applicable
- Provide step counts (Step 1/6, etc.) for long processes

❌ **Don't**:
- Assume user knows Docker terminology
- Provide incomplete commands
- Skip error handling instructions
- Use Windows-specific paths (always use /)
- Omit SSL/TLS discussion
- Ignore security best practices

### 5. Validation Checklist

After generating documentation, verify:
- [ ] All files are valid for their format (yaml, markdown, bash)
- [ ] Code blocks are properly formatted and executable
- [ ] No hardcoded secrets in example files
- [ ] Paths use forward slashes (/)
- [ ] Database provider matches project requirements
- [ ] Nginx config includes security headers
- [ ] Setup script has execute permissions
- [ ] Checklists cover pre-deployment through post-deployment
- [ ] Troubleshooting section covers common Docker/Nginx issues
- [ ] Multi-app examples provided if VPS setup with multiple apps

### 6. Common Patterns by Framework

#### Next.js (Node.js)
- Use Node.js Alpine image
- Build: `npm run build`
- Start: `npm start`
- Database: Usually PostgreSQL with Prisma ORM
- Ports: 3000 default
- Features: Automatic static export, API routes, middleware

#### Python (Flask/Django)
- Use Python slim image
- Install: `pip install -r requirements.txt`
- Database: PostgreSQL or MySQL
- Ports: 5000 (Flask), 8000 (Gunicorn)
- Features: Virtual environment, WSGI server (Gunicorn/uWSGI)

#### Go
- Multi-stage build optimal (produces small binary)
- Single binary deployment
- Database: PostgreSQL, MySQL, or embedded
- Ports: Configurable, default often 8080
- Features: Built-in HTTP server, no external runtime

### 7. Error Handling Instructions

If deployment documentation needs troubleshooting, follow this pattern:

1. **Identify the layer**: Docker, Nginx, Application, Database?
2. **Check logs**: `docker-compose logs <service>` or check Nginx error logs
3. **Validate configuration**: Run `nginx -t`, `docker-compose config`
4. **Common fixes**: Restart services, check .env file, verify ports
5. **Debug deeper**: Access container shell, run migrations, check database

## Examples Reference

See the CRM app deployment example in `./examples/crm-app-deployment/` for:
- Complete working docker-compose.yml
- Production-ready Nginx configuration
- Shell scripts for automated setup
- Real environment configuration templates
- Actual deployment checklist from production setup

## Resources

- Docker Compose: https://docs.docker.com/compose/
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt/Certbot: https://letsencrypt.org/
- PostgreSQL Running in Docker: https://hub.docker.com/_/postgres
- Node.js Docker Best Practices: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

## Output Format

Generate a structured directory in `.agent/skills/deployment-documentation/` containing:

```
deployment-documentation/
├── SKILL.md (this file)
├── resources/
│   ├── docker-compose-template.yml
│   ├── dockerfile-nodejs
│   ├── dockerfile-python
│   ├── dockerfile-go
│   ├── nginx-config-template.conf
│   ├── env-example-template
│   ├── setup-script-template.sh
│   └── certification-matrix.md
└── examples/
    └── crm-app-deployment/
        ├── docker-compose.yml
        ├── Dockerfile
        ├── nginx.conf.example
        ├── .env.example
        ├── setup-docker.sh
        ├── DOCKER_DEPLOYMENT.md
        ├── DEPLOYMENT_CHECKLIST.md
        ├── DOCKER_FILES_SUMMARY.md
        └── NGINX_ADVANCED_CONFIG.md
```

## Integration Notes

When using this skill:
1. Analyze project structure first
2. Identify all external services (databases, caches, queues)
3. Determine environment variables needed
4. Create Dockerfile and docker-compose.yml
5. Generate Nginx configuration for the app type
6. Create comprehensive deployment documentation
7. Provide step-by-step guides for operators
8. Include troubleshooting for common issues
9. Document ongoing maintenance procedures
10. Provide security hardening checklist

Use this skill whenever deployment infrastructure documentation is needed for production server setups.
