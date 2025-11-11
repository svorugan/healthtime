# Simple Deployment Guide - Development

## Option 1: Manual Git Pull (Recommended for Development)

### Initial Setup (One-time)

1. **SSH into EC2**:
```powershell
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

2. **Clone repository**:
```bash
cd /home/ubuntu
git clone https://github.com/your-username/healthtime.git
cd healthtime
```

3. **Setup backend**:
```bash
cd backend-node
npm install
nano .env  # Add your environment variables
pm2 start src/server.js --name healthtime-backend
pm2 save
```

4. **Setup frontend**:
```bash
cd ../frontend-angular
npm install
npm run build
sudo cp -r dist/healthtime-angular/* /var/www/html/
```

### Deploy Updates (Every time you push changes)

**Simple 3-step process:**

```bash
# 1. SSH into EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# 2. Pull latest code
cd /home/ubuntu/healthtime
git pull

# 3. Restart services
cd backend-node
npm install  # Only if package.json changed
pm2 restart healthtime-backend

cd ../frontend-angular
npm install  # Only if package.json changed
npm run build
sudo cp -r dist/healthtime-angular/* /var/www/html/
```

**Time**: ~2-3 minutes per deployment

---

## Option 2: GitHub Actions (Automated - No Jenkins)

**Better than Jenkins for this use case.** Already integrated with GitHub.

### Setup (One-time)

1. **Create deployment script on EC2**:

```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Create deployment script
nano /home/ubuntu/deploy.sh
```

Add this to `deploy.sh`:
```bash
#!/bin/bash
cd /home/ubuntu/healthtime

# Pull latest code
git pull

# Deploy backend
cd backend-node
npm install
pm2 restart healthtime-backend

# Deploy frontend
cd ../frontend-angular
npm install
npm run build
sudo cp -r dist/healthtime-angular/* /var/www/html/

echo "Deployment completed at $(date)"
```

```bash
# Make it executable
chmod +x /home/ubuntu/deploy.sh
```

2. **Add GitHub Actions workflow**:

Create `.github/workflows/deploy-dev.yml` in your repository:

```yaml
name: Deploy to EC2 Development

on:
  push:
    branches: [ main, develop ]  # Deploy when pushing to these branches
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to EC2
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.EC2_HOST }}
        username: ubuntu
        key: ${{ secrets.EC2_SSH_KEY }}
        script: |
          /home/ubuntu/deploy.sh
```

3. **Add GitHub Secrets**:
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add secrets:
     - `EC2_HOST`: Your EC2 public IP
     - `EC2_SSH_KEY`: Contents of your .pem file

### Deploy Updates

**Just push to GitHub:**
```bash
git add .
git commit -m "Update feature"
git push
```

GitHub Actions automatically deploys to EC2!

**Time**: Automatic, ~2-3 minutes

---

## Option 3: Simple Bash Script (Local to EC2)

**For quick deployments without SSH.**

### Setup

Create `deploy-to-ec2.ps1` in your project root:

```powershell
# deploy-to-ec2.ps1
param(
    [string]$KeyPath = "path\to\your-key.pem",
    [string]$EC2Host = "your-ec2-ip"
)

Write-Host "Deploying to EC2..." -ForegroundColor Green

# Push to GitHub first
git add .
git commit -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push

# SSH and deploy
ssh -i $KeyPath ubuntu@$EC2Host "bash /home/ubuntu/deploy.sh"

Write-Host "Deployment complete!" -ForegroundColor Green
```

### Usage

```powershell
.\deploy-to-ec2.ps1
```

---

## Comparison

| Method | Setup Time | Deploy Time | Automation | Best For |
|--------|-----------|-------------|------------|----------|
| Manual Git Pull | 5 min | 2-3 min | None | Learning, testing |
| GitHub Actions | 15 min | 2-3 min | Full | Development, production |
| Bash Script | 10 min | 2-3 min | Semi | Quick iterations |

---

## Why NOT Jenkins for Your Case?

❌ **Overkill** - Too complex for simple deployments  
❌ **Extra server** - Needs separate EC2 or runs on your dev machine  
❌ **Maintenance** - Requires updates, plugins, configuration  
❌ **Learning curve** - Steep for simple use case  

✅ **GitHub Actions is better because:**
- Already integrated with GitHub
- No extra infrastructure needed
- Free for public repos (2000 min/month for private)
- Easier to configure
- Industry standard

---

## My Recommendation

### For Development (Now):
**Use Option 1 (Manual Git Pull)**
- Simple and fast
- No setup complexity
- Learn the deployment process
- Easy to debug

### When Ready (Later):
**Migrate to Option 2 (GitHub Actions)**
- Automate deployments
- Deploy on every push
- Professional workflow
- Easy to add testing, linting, etc.

---

## Quick Start Commands

### First Time Setup
```bash
# 1. SSH into EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# 2. Clone and setup
cd /home/ubuntu
git clone https://github.com/your-username/healthtime.git
cd healthtime/backend-node
npm install
pm2 start src/server.js --name healthtime-backend
pm2 save

cd ../frontend-angular
npm install
npm run build
sudo cp -r dist/healthtime-angular/* /var/www/html/
```

### Every Deployment
```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Update
cd /home/ubuntu/healthtime
git pull
cd backend-node && pm2 restart healthtime-backend
cd ../frontend-angular && npm run build && sudo cp -r dist/healthtime-angular/* /var/www/html/
```

---

## Troubleshooting

### If git pull fails (permission issues):
```bash
cd /home/ubuntu/healthtime
git config --global --add safe.directory /home/ubuntu/healthtime
git pull
```

### If PM2 not found:
```bash
sudo npm install -g pm2
```

### If Nginx not serving updated files:
```bash
sudo systemctl restart nginx
# Or clear browser cache
```

### Check logs:
```bash
# Backend logs
pm2 logs healthtime-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## Next Steps

1. ✅ Start with manual deployment (Option 1)
2. ✅ Once comfortable, add GitHub Actions (Option 2)
3. ✅ Later, add automated testing before deployment
4. ✅ Eventually, implement blue-green deployments

Keep it simple for now, automate later!
