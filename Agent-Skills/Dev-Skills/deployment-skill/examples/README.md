# Deployment Examples

This directory contains real-world deployment examples from VPS-deployed applications. Each example demonstrates a complete Docker + Nginx deployment configuration that can be used as a reference for similar projects.

## Purpose

These examples serve as:
- **Reference implementations** for the deployment-documentation skill
- **Templates** for new deployments with similar tech stacks
- **Learning resources** for understanding production deployment patterns
- **Validation** that generated documentation matches real-world scenarios

## Folder Structure

Each example follows this standardized structure:

```
example-name/
├── README.md                 # Overview, quick reference, and deployment workflow
├── docker-compose.yml        # Container orchestration (app + services)
├── Dockerfile               # Application container build instructions
├── nginx.conf.example       # Reverse proxy configuration
├── .env.example             # Environment variables template (if applicable)
├── setup-docker.sh          # VPS automation script
└── [additional files]       # Stack-specific files (e.g., Caddyfile, k8s configs)
```

## Required Files

### 1. README.md
Each example must have a README that includes:
- **Project Overview**: What the app does and its tech stack
- **File Inventory**: Table listing all files and their purposes
- **VPS Directory Structure**: Expected layout on the production server
- **Deployment Workflow**: Step-by-step commands to deploy
- **Tech Stack Summary**: Framework, database, reverse proxy, etc.

### 2. docker-compose.yml
Defines:
- Application service configuration
- Database/cache services (PostgreSQL, Redis, etc.)
- Volume mappings for persistence
- Network configuration
- Environment variable references

### 3. Dockerfile
Contains:
- Multi-stage build (if applicable)
- Base image selection
- Dependency installation
- Build process
- Production startup command

### 4. nginx.conf.example
Includes:
- HTTP → HTTPS redirect
- SSL/TLS configuration
- Proxy headers
- Static file serving
- Security headers
- Rate limiting (if needed)
- Cache control

### 5. setup-docker.sh
Automates:
- Docker installation
- Docker Compose installation
- Nginx installation
- Certbot/Let's Encrypt setup
- Firewall configuration
- System updates

### 6. .env.example (Optional)
Template for:
- Database credentials
- API keys and secrets
- Application URLs
- Feature flags
- Runtime environment settings

## Current Examples

| Example | Tech Stack | Database | Notes |
|---------|-----------|----------|-------|
| [crm-app-deployment](./crm-app-deployment/) | Next.js | PostgreSQL | Full-stack CRM with Prisma ORM |

## Adding New Examples

### Quick Start

1. **Create a new folder** with a descriptive name (use kebab-case):
   ```bash
   mkdir examples/your-app-name-deployment
   cd examples/your-app-name-deployment
   ```

2. **Copy files from your VPS** or create them based on your actual deployment:
   ```bash
   # From your VPS
   scp user@your-vps:/var/docker/apps/your-app/docker-compose.yml .
   scp user@your-vps:/var/docker/apps/your-app/Dockerfile .
   scp user@your-vps:/etc/nginx/sites-available/your-app nginx.conf.example
   ```

3. **Sanitize sensitive data**:
   - Remove real passwords, API keys, domains
   - Replace with placeholders like `your_database_password`, `your_domain.com`
   - Use example emails like `admin@example.com`

4. **Create the README.md** using this template:
   ```markdown
   # [App Name] Deployment Example
   
   This directory contains deployment configuration for [brief description].
   
   ## Tech Stack
   - **Framework**: [e.g., Next.js 14, Django 4.2, etc.]
   - **Database**: [e.g., PostgreSQL 15, MySQL 8.0, MongoDB 6.0]
   - **Reverse Proxy**: [e.g., Nginx, Caddy]
   - **Container Runtime**: Docker + Docker Compose
   
   ## Files in This Example
   
   | File | Purpose |
   |------|---------|
   | docker-compose.yml | [Description] |
   | Dockerfile | [Description] |
   | nginx.conf.example | [Description] |
   | .env.example | [Description] |
   | setup-docker.sh | [Description] |
   
   ## VPS Directory Structure
   
   \```
   /var/docker/apps/your-app/
   ├── docker-compose.yml
   ├── Dockerfile
   ├── .env.production
   └── ... (app files)
   \```
   
   ## Quick Deployment
   
   \```bash
   # 1. Clone your repo
   git clone https://github.com/yourusername/your-app.git
   cd your-app
   
   # 2. Configure environment
   cp .env.example .env.production
   nano .env.production
   
   # 3. Build and start
   docker-compose up -d --build
   \```
   
   ## Notes
   - [Any special considerations]
   - [Known issues or workarounds]
   - [Performance tips]
   ```

5. **Update this README** by adding your example to the "Current Examples" table

### Validation Checklist

Before committing a new example, ensure:
- [ ] All sensitive data is removed or replaced with placeholders
- [ ] Files follow the standardized naming convention
- [ ] README.md is complete and follows the template
- [ ] docker-compose.yml has comments explaining services
- [ ] Dockerfile uses multi-stage builds (when applicable)
- [ ] nginx.conf.example includes security headers
- [ ] setup-docker.sh is executable and well-commented
- [ ] Configuration actually works (test it first!)

## Example Categories

### By Framework
- **Next.js**: crm-app-deployment
- **Django**: *(coming soon)*
- **Express.js**: *(coming soon)*
- **Go**: *(coming soon)*

### By Database
- **PostgreSQL**: crm-app-deployment
- **MySQL**: *(coming soon)*
- **MongoDB**: *(coming soon)*

### By Complexity
- **Single Container**: *(coming soon)*
- **Multi-Container (App + DB)**: crm-app-deployment
- **Multi-App VPS**: *(coming soon)*
- **With Redis/Cache**: *(coming soon)*

## Usage for the Skill

The deployment-documentation skill references these examples to:
1. **Verify accuracy** of generated documentation
2. **Provide context** about real deployment patterns
3. **Suggest improvements** based on working configurations
4. **Customize templates** for specific tech stacks

When the skill analyzes a project, it can:
```markdown
"I see you're using Next.js with PostgreSQL. The crm-app-deployment example uses 
a similar stack. I'll base the documentation on that proven pattern."
```

## Best Practices

### Security
- Never commit real credentials or API keys
- Use placeholder values that clearly indicate replacement needed
- Include security headers in Nginx configs
- Document SSL/TLS setup procedures

### Documentation
- Write for someone who has basic VPS knowledge
- Include troubleshooting sections
- Add comments in configuration files
- Link to official documentation when referencing specific tools

### Organization
- One example per deployment scenario
- Keep examples focused and minimal
- Include only files directly related to deployment
- Use consistent naming across all examples

### Maintenance
- Update examples when underlying tools have breaking changes
- Mark deprecated examples clearly
- Test examples periodically to ensure they still work
- Document the date when the example was last verified

## Contributing

When adding examples from your own deployments:
1. Ensure the deployment is stable and production-tested
2. Remove all sensitive information
3. Add comprehensive comments
4. Test the sanitized version works before committing
5. Update the tables in this README

## Questions?

If you're unsure about:
- Which files to include → Look at crm-app-deployment as a reference
- How to sanitize data → Replace with obvious placeholders like `YOUR_PASSWORD_HERE`
- Folder naming → Use kebab-case with `-deployment` suffix
- README format → Copy and adapt from existing examples
