# Deployment Documentation Skill

A comprehensive Antigravity agent skill for generating production-ready deployment documentation, Docker configurations, and Nginx setup guides for containerized applications.

## Skill Overview

This skill enables the agent to:
- Analyze project structure and dependencies
- Generate complete Docker configurations (Dockerfile, docker-compose.yml)
- Create production-ready Nginx reverse proxy configurations
- Produce step-by-step deployment guides
- Create deployment checklists and verification procedures
- Provide security hardening guidelines
- Support multi-app VPS setups

## Directory Structure

```
deployment-documentation/
├── SKILL.md                    # Skill definition and instructions (THIS SKILL)
│
├── resources/                  # Reusable templates and components
│   ├── docker-compose-template.yml
│   ├── dockerfile-nodejs
│   ├── dockerfile-python
│   ├── dockerfile-go
│   ├── nginx-config-template.conf
│   ├── env-example-template
│   ├── setup-script-template.sh
│   └── certification-matrix.md
│
└── examples/                   # Real-world working examples
    └── crm-app-deployment/     # Complete CRM app example
        ├── docker-compose.yml
        ├── Dockerfile
        ├── nginx.conf.example
        ├── .env.example
        ├── setup-docker.sh
        └── README.md
```

## How to Use This Skill

### 1. For Analyzing an Existing Project

Ask the agent to:
> "Analyze my project and generate deployment documentation for Docker and Nginx setup."

The skill will:
1. Examine your project structure
2. Identify technology stack (Node.js, Python, Go, database, etc.)
3. Analyze existing environment configurations
4. Create appropriate Dockerfile
5. Generate docker-compose.yml with correct services
6. Produce Nginx configuration
7. Create comprehensive deployment guides

### 2. For Creating New Deployment Docs

Ask the agent to:
> "Create deployment documentation and Docker setup for my [framework] application."

The skill provides templates from `/resources/` directory.

### 3. For Reference Implementation

Check the `/examples/crm-app-deployment/` folder to see:
- Working docker-compose.yml
- Production Dockerfile
- Complete Nginx configuration
- All environment templates
- Automated setup script

## What Gets Generated

### Docker Files
- **Dockerfile** - Multi-stage build optimized for production
- **docker-compose.yml** - Container orchestration with database
- **.dockerignore** - Optimized build context
- **setup-docker.sh** - Automated VPS setup script

### Configuration
- **.env.example** - All required environment variables with explanations
- **nginx.conf.example** - Reverse proxy with SSL, caching, security headers
- **.gitignore** - Secure patterns to prevent committing secrets

### Documentation
- **DOCKER_DEPLOYMENT.md** - Complete step-by-step guide
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment verification
- **DOCKER_FILES_SUMMARY.md** - Overview of all files
- **NGINX_ADVANCED_CONFIG.md** - Alternative setups for complex scenarios
- **DEPLOYMENT_CHECKLIST.md** - Emergency procedures and maintenance

## Key Features

### ✅ Security-First
- Non-root users in containers
- SSL/TLS with Let's Encrypt
- Security headers (HSTS, CSP, X-Frame-Options)
- Environment variable encapsulation
- Database isolation in docker network

### ✅ Production-Ready
- Multi-stage Docker builds for minimal images
- Health checks and automatic restarts
- Database data persistence
- Automated migrations
- Professional logging

### ✅ Comprehensive
- Step-by-step guides for operators
- Troubleshooting section with common issues
- Database backup and recovery procedures
- Monitoring and maintenance instructions
- Multi-app hosting support

### ✅ Flexible
- Templates for Node.js, Python, Go
- Support for multiple databases (PostgreSQL, MySQL, SQLite)
- Subdomain and subpath routing options
- Single-app and multi-app configurations

## Usage Patterns

### Pattern 1: Generate for Existing Project
```
User: "I have a Next.js app with PostgreSQL. Generate deployment docs."
Agent: 
  1. Reads package.json → identifies Next.js
  2. Reads prisma/schema.prisma → identifies PostgreSQL
  3. Uses SKILL to generate files
  4. Creates complete deployment package
```

### Pattern 2: Template-Based Generation
```
User: "Create a Python Flask deployment setup"
Agent:
  1. References resources/dockerfile-python
  2. References resources/nginx-config-template.conf
  3. Generates complete setup for Python/Flask
```

### Pattern 3: Multi-App VPS Setup
```
User: "I'm hosting 3 apps on same VPS. How do I configure them?"
Agent:
  1. Uses NGINX_ADVANCED_CONFIG.md section on multi-app
  2. Provides separate docker-compose.yml for each app
  3. Generates Nginx config with subdomains
  4. Documents port assignments
```

## File Purpose Reference

| File | Used For | Framework |
|------|----------|-----------|
| docker-compose-template.yml | Base orchestration | Universal |
| dockerfile-nodejs | Node.js/Next.js/Express apps | JavaScript/TypeScript |
| dockerfile-python | Flask/Django apps | Python |
| dockerfile-go | Go applications | Go |
| nginx-config-template.conf | Reverse proxy setup | Universal |
| env-example-template | Config documentation | Universal |
| setup-script-template.sh | VPS automation | Linux |
| certification-matrix.md | Deployment verification | Universal |

## Critical Sections in SKILL.md

1. **Prerequisites Analysis** - What to check before generating docs
2. **Generation Workflow** - Step-by-step process
3. **Documentation Structure** - What each file contains
4. **Customization Points** - Variables to replace
5. **Content Quality Standards** - Quality guidelines
6. **Common Patterns by Framework** - Framework-specific guidance
7. **Error Handling** - Troubleshooting workflow

## Working with the Skill

### When to Use
- Setting up production deployment infrastructure
- Creating Docker configurations
- Configuring Nginx as reverse proxy
- Documenting deployment procedures
- Blue-green or multi-environment setups
- Scaling from local to VPS

### When NOT to Use
- Debugging existing Docker issues (use Docker docs)
- Optimizing Docker image performance (use Alpine optimization guides)
- Kubernetes setup (use Kubernetes skill if available)
- CI/CD pipeline setup (may need separate skill)

## Integration Points

This skill connects with:
- **Project Analysis Skills** - Understanding app structure
- **Database Skills** - Database setup and backup procedures
- **Security Skills** - SSL/TLS, authentication, hardening
- **Monitoring Skills** - Logging, alerting, metrics
- **Infrastructure Skills** - VPS setup, networking

## Examples Walkthrough

### CRM App Example (crm-app-deployment/)

This is a complete, production-ready deployment for a Next.js + PostgreSQL CRM application.

**Files:**
- `docker-compose.yml` - Sets up Next.js app + PostgreSQL
- `Dockerfile` - Multi-stage Node.js build
- `nginx.conf.example` - Complete reverse proxy setup
- `.env.example` - Database + app configuration
- `setup-docker.sh` - Automated VPS setup
- `README.md` - Quick reference guide

**To use this example:**
1. Copy all files to your VPS
2. Modify `.env.example` → `.env.production`
3. Run `sudo bash setup-docker.sh`
4. Follow README.md for Nginx setup

## Best Practices

### Docker Configuration
```
✅ Multi-stage builds       (reduce image size)
✅ Non-root users          (security)
✅ Health checks           (reliability)
✅ Environment variables   (flexibility)
✅ Volume mounts           (persistence)

❌ Running as root         (security risk)
❌ Single-stage builds     (bloated images)
❌ Hardcoded secrets       (security risk)
```

### Nginx Configuration
```
✅ SSL/TLS enabled         (HTTPS)
✅ Security headers        (attack prevention)
✅ Gzip compression        (performance)
✅ Cache headers           (speed)
✅ Error logging           (debugging)

❌ HTTP only               (insecure)
❌ Missing HSTS            (no HTTPS enforcement)
❌ No caching              (slower)
❌ World-readable logs     (privacy)
```

### Documentation
```
✅ Step-by-step guides     (clear)
✅ Working examples        (reference)
✅ Troubleshooting section (support)
✅ Security checklist      (compliance)
✅ Operations procedures   (maintenance)

❌ Vague instructions      (confusing)
❌ Hardcoded values        (not reproducible)
❌ Missing prerequisites   (incomplete)
❌ No error handling       (problematic)
```

## Customization Examples

### Adding New Database Type
1. Update SKILL.md PostgreSQL references to include MySQL/MongoDB
2. Modify docker-compose-template.yml service definitions
3. Add environment variable examples
4. Update docker-compose variables

### Adding New Framework
1. Create new dockerfile-[framework] in resources/
2. Update SKILL.md section on framework patterns
3. Add to examples/ with working reference
4. Document framework-specific considerations

### Adding New Deployment Strategy
1. Document pattern in NGINX_ADVANCED_CONFIG.md
2. Add corresponding nginx template
3. Update workflow in SKILL.md
4. Create example showing the strategy

## Maintenance

This skill should be reviewed/updated when:
- Docker best practices change
- New Node/Python versions released
- Nginx security recommendations update
- PostgreSQL/MySQL versions change
- Let's Encrypt certificate requirements change
- New deployment patterns emerge

## Quick Reference

### Common Commands in Generated Setup
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Database backup
docker-compose exec postgres pg_dump -U user db > backup.sql

# Database restore
docker-compose exec -T postgres psql -U user db < backup.sql

# SSL renewal test
sudo certbot renew --dry-run

# Nginx validation
sudo nginx -t

# System cleanup
docker system prune -a --volumes
```

## Support Files

- See SKILL.md for detailed methodology
- See examples/crm-app-deployment/ for working reference
- See resources/ for templates and components

## Related Concepts

- **Containerization**: Docker fundamentals
- **Container Orchestration**: docker-compose
- **Reverse Proxying**: Nginx
- **SSL/TLS**: HTTPS and certificates
- **Infrastructure as Code**: Reproducible deployments
- **CI/CD**: Automated building and deployment
- **Monitoring**: Logging and alerting

---

**Skill Name**: deployment-documentation  
**Version**: 1.0  
**Last Updated**: 2026-03-05  
**Framework Support**: Node.js, Python, Go, others  
**Database Support**: PostgreSQL, MySQL, SQLite, MongoDB  
**Deployment Target**: VPS (Ubuntu/Debian), Cloud servers
