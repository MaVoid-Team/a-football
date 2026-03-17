# Deployment Skill - Team Guide

Welcome to the **Deployment Documentation Skill**! This guide helps your team use and share this skill effectively.

## 📋 Quick Start

### What This Skill Does
This skill automatically activates when you ask the agent about:
- 🐳 Docker configuration, Dockerfiles, docker-compose
- 🌐 Nginx reverse proxy, web server setup
- 🚀 VPS deployment, server deployment, infrastructure
- 🔐 SSL certificates, HTTPS, Let's Encrypt
- 📝 Deployment guides, deployment documentation
- ⚙️ Environment configuration, .env files
- 🐘 PostgreSQL, MySQL, and database setup

### Trigger Keywords
The agent will automatically use this skill when you mention:
- "deploy to VPS"
- "docker setup"
- "nginx configuration"
- "SSL certificate"
- "deployment guide"
- "dockerize my app"
- "infrastructure setup"
- "container orchestration"

## 📁 Folder Structure

```
deployment-skill/
├── SKILL.md                 # Skill definition (what agent reads)
├── TEAM_GUIDE.md           # This file
├── README.md               # Skill overview
├── STRUCTURE.md            # Detailed technical structure
│
├── resources/              # Reusable templates for all projects
│   ├── docker-compose-template.yml
│   ├── dockerfile-nodejs
│   ├── dockerfile-python
│   ├── dockerfile-go
│   ├── nginx-config-template.conf
│   ├── env-example-template
│   ├── setup-script-template.sh
│   └── certification-matrix.md
│
└── examples/               # Real working deployments from production
    ├── 44-Mashraba-St/      # Rails + React application
    ├── Al-Atmor/            # Next.js + Node.js
    ├── El-Hassan-Glasses/   # MERN stack
    ├── Sinai-Vibes/         # React + Rails property listing
    └── README.md            # Guide for adding new examples
```

## 🚀 How to Use (For Team Members)

### 1. **I need to deploy my app to a VPS**
```
User: "I have a Next.js app and I want to deploy it to my VPS with Docker and Nginx. 
       Can you help me set it up?"

Agent will automatically activate the deployment skill and:
✓ Analyze your project
✓ Create a Dockerfile
✓ Generate docker-compose.yml
✓ Create Nginx configuration
✓ Provide deployment instructions
✓ Create environment templates
```

### 2. **I need Docker configuration files**
```
User: "Create a docker-compose.yml for my Node.js app with PostgreSQL"

The skill will:
✓ Generate complete docker-compose configuration
✓ Include health checks and volumes
✓ Create corresponding .env template
✓ Provide setup instructions
```

### 3. **I need to understand deployment**
```
User: "What's the best way to deploy using Docker and Nginx?"

The skill will:
✓ Explain architecture
✓ Reference working examples
✓ Provide best practices
✓ Link to real implementations
```

### 4. **I need a complete deployment guide**
```
User: "Generate a complete deployment guide for my Python Django app 
       with PostgreSQL and Nginx"

The skill will create:
✓ DOCKER_DEPLOYMENT.md (step-by-step guide)
✓ docker-compose.yml (with all services)
✓ Dockerfile (optimized build)
✓ nginx.conf.example (with SSL setup)
✓ .env.example (all variables)
✓ setup-docker.sh (automated VPS setup)
✓ DEPLOYMENT_CHECKLIST.md (verification steps)
```

## 📚 Reference Examples

### Available Examples in `/examples/`

Each example folder contains a complete, working deployment from production:

#### **44-Mashraba-St**
- **Framework**: Rails (Ruby) + React
- **Database**: PostgreSQL
- **Features**: Devise JWT auth, Rails Active Storage
- **Status**: Production-tested

#### **Al-Atmor**
- **Framework**: Next.js + Node.js backend
- **Database**: PostgreSQL
- **Features**: Full-stack TypeScript
- **Status**: Production-tested

#### **El-Hassan-Glasses**
- **Framework**: MERN Stack (Node.js + React)
- **Database**: MongoDB
- **Features**: Cloudinary integration, JWT auth
- **Status**: Production-tested

#### **Sinai-Vibes**
- **Framework**: React + Rails
- **Database**: PostgreSQL
- **Features**: Multi-service setup, complex routing
- **Status**: Production-tested

### How to Use Examples

1. **Find a similar project** in the examples folder
2. **Copy the relevant files** as a starting point
3. **Customize** for your needs (domain, port, variables)
4. **Follow the README** in that example folder
5. **Refer back** to SKILL.md for variations

## 🔄 Sharing with Team

### Setup Checklist for New Team Members

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/default-agent-skills.git
   cd default-agent-skills
   ```

2. **Familiarize with structure**
   - Read this TEAM_GUIDE.md
   - Look at examples in `skills/deployment-skill/examples/`
   - Review templates in `skills/deployment-skill/resources/`

3. **Start using the skill**
   - Ask the agent about deployment
   - Keywords will automatically trigger the skill
   - Reference examples for your tech stack

4. **Contribute your own deployment**
   - Add to `examples/` when you deploy something new
   - Update the examples README
   - Keep sensitive data sanitized

### For Team Leads

1. **Distribute this repository** to your team
2. **Point to TEAM_GUIDE.md** as the onboarding resource
3. **Reference examples** during code reviews that involve deployment
4. **Contribute back** new deployments to the examples folder

### Version Control Best Practices

```bash
# Clone once for team access
git clone <repo-url>

# Keep it updated
cd default-agent-skills
git pull origin main  # Get new examples and improvements

# Never commit sensitive data
# Only commit .env.example and sanitized configs
```

## 💡 Common Use Cases

### Use Case 1: "Create deployment files for a new project"
```
"I'm starting a Django project with PostgreSQL. 
 Create deployment documentation and Docker setup."

Result: Complete docker-compose, Dockerfile, nginx config, guides
```

### Use Case 2: "Reference an existing deployment"
```
"I need to deploy a Rails app similar to 44-Mashraba-St. 
 Can you adapt that example for my domain?"

Result: Customized files based on proven working example
```

### Use Case 3: "Troubleshoot deployment issue"
```
"My Docker container won't start. Check my Dockerfile 
 and docker-compose.yml against best practices."

Result: Issues identified, solutions provided, improvements suggested
```

### Use Case 4: "Scale deployment"
```
"I need to deploy multiple apps on the same VPS. 
 How should I structure Docker and Nginx?"

Result: Architecture guide, multi-app configuration, port management
```

## 🎯 Key Features

### ✅ Security
- Non-root users in containers
- SSL/TLS with Let's Encrypt
- Security headers configured
- Environment variable isolation
- `.env` templates prevent accidents

### ✅ Production-Ready
- Multi-stage Docker builds
- Health checks configured
- Auto-restart policies
- Volume management for persistence
- Proper signal handling

### ✅ Developer-Friendly
- Clear comments in all configs
- Step-by-step guides
- Troubleshooting sections
- Real working examples
- Copy-paste ready templates

### ✅ Team-Ready
- Shared resources in `resources/`
- Real examples in `examples/`
- Clear documentation
- Easy to customize
- Version-controlled

## 🛠️ Customization Guide

### Modifying the Skill Description

To add more trigger keywords, update the `description` in [SKILL.md](SKILL.md):

```yaml
description: [Add keywords here that represent your use case]
```

### Adding New Examples

1. **Navigate to** `skills/deployment-skill/examples/`
2. **Create a folder** with app name (kebab-case)
3. **Add files**:
   - `docker-compose.yml`
   - `Dockerfile`
   - `nginx.conf.example`
   - `.env.example`
   - `setup-docker.sh`
   - `README.md`
4. **Sanitize** all sensitive data
5. **Update** `examples/README.md` with new example

### Using Templates for Quick Setup

Templates are in `resources/`:
- `dockerfile-nodejs` - Node.js multi-stage build
- `dockerfile-python` - Python Django/Flask setup
- `dockerfile-go` - Go binary optimization
- `docker-compose-template.yml` - Service orchestration
- `nginx-config-template.conf` - Web server config
- `setup-script-template.sh` - VPS automation

Copy and customize these for new projects!

## 📖 Documentation Hierarchy

```
SKILL.md ← Agent reads this to understand when/how to help
  ↓
README.md ← Overview and feature list
  ↓
TEAM_GUIDE.md ← This file (team onboarding)
  ↓
STRUCTURE.md ← Technical deep-dive
  ↓
examples/ ← Real implementations
  ↓
resources/ ← Reusable templates
```

## ❓ FAQ

**Q: How does the agent know to use this skill?**
A: The `description` in SKILL.md contains keywords. When you mention them, the agent automatically activates this skill.

**Q: Can I add my own examples?**
A: Yes! Add to `examples/` folder. Make sure to sanitize sensitive data first.

**Q: What if I need a different tech stack?**
A: Check `resources/` for templates. The agent will adapt them for your stack.

**Q: How do I update this for my team?**
A: Use Git to push updates. Team members pull to get latest examples.

**Q: Can I use this offline?**
A: Yes! Clone the repo and it's a self-contained reference.

## 🤝 Contributing Back

Found a working deployment? Want to share with the team?

1. **Create a new example folder** in `examples/`
2. **Copy your deployment files**
3. **Sanitize sensitive data** (passwords, API keys, domains)
4. **Write a clear README**
5. **Update examples/README.md**
6. **Commit and push** for team access

## 📞 Getting Help

- **Questions about Docker?** → Ask agent "How do I..." or "Explain..."
- **Need an example?** → Check `examples/` folder
- **Need a template?** → Check `resources/` folder
- **Need guidance?** → Read STRUCTURE.md for technical details
