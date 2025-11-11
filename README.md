# HealthTime

TX Cart's Health Time application - Healthcare platform for surgery booking and management.

## 🚀 Quick Start

### Local Development

**Backend:**
```bash
cd backend-node
npm install
cp .env.example .env  # Configure your environment
npm run dev
```

**Frontend:**
```bash
cd frontend-angular
npm install
npm start
```

## 📦 Deployment

### Simple Deployment Options

1. **Manual Deployment** - SSH and git pull (simplest)
2. **GitHub Actions** - Automated deployment on push (recommended)
3. **PowerShell Script** - One-command deployment from local machine

See [SIMPLE_DEPLOYMENT.md](SIMPLE_DEPLOYMENT.md) for detailed instructions.

### AWS Setup

- **Simple EC2 Setup**: See [AWS_SETUP.md](AWS_SETUP.md)
- **Deployment Options**: See [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md)

## 📚 Documentation

- [AWS_SETUP.md](AWS_SETUP.md) - AWS infrastructure setup (simplified for single EC2)
- [SIMPLE_DEPLOYMENT.md](SIMPLE_DEPLOYMENT.md) - Deployment guide for development
- [DEPLOYMENT_OPTIONS.md](DEPLOYMENT_OPTIONS.md) - Comparison of deployment architectures
- [DEPLOYMENT.md](DEPLOYMENT.md) - Advanced deployment configurations
- [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) - CI/CD setup

## 🛠️ Tech Stack

- **Frontend**: Angular 17, Angular Material
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Deployment**: AWS EC2, Nginx, PM2

## 📝 License

MIT
