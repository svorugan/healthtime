# Deployment Quick Start Guide

## 🎯 Recommended Approach for Development

**Use GitHub Actions** - Automated, simple, no Jenkins needed!

---

## Setup (One-time, ~10 minutes)

### 1. Setup EC2 Deployment Script

SSH into your EC2 instance:
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

Create deployment script:
```bash
nano /home/ubuntu/deploy.sh
```

Copy the contents from `ec2-deploy.sh` in this repo, then:
```bash
chmod +x /home/ubuntu/deploy.sh
```

### 2. Add GitHub Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions**

Add these secrets:
- **EC2_HOST**: Your EC2 public IP address
- **EC2_SSH_KEY**: Contents of your `.pem` file (entire file content)

### 3. Done!

The GitHub Actions workflow is already in `.github/workflows/deploy-to-ec2.yml`

---

## Deploy Your Code

### Method 1: Automatic (Recommended)

Just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```

✨ **That's it!** GitHub Actions will automatically deploy to EC2.

Watch the deployment: **GitHub repo → Actions tab**

---

### Method 2: Manual (Backup option)

If GitHub Actions fails or you want manual control:

```bash
# SSH into EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Run deployment script
/home/ubuntu/deploy.sh
```

---

### Method 3: PowerShell Script (From your PC)

Edit `deploy-to-ec2.ps1` and set your EC2 details, then:

```powershell
.\deploy-to-ec2.ps1
```

---

## Verify Deployment

After deployment, check:

1. **Frontend**: `http://your-ec2-ip`
2. **Backend API**: `http://your-ec2-ip:8000/api`
3. **Backend logs**: SSH to EC2 and run `pm2 logs healthtime-backend`

---

## Common Commands

### On EC2 (via SSH)

```bash
# Check backend status
pm2 status

# View backend logs
pm2 logs healthtime-backend

# Restart backend
pm2 restart healthtime-backend

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log

# Manual deployment
/home/ubuntu/deploy.sh
```

### On Your PC

```bash
# Push and auto-deploy
git push

# Manual PowerShell deploy
.\deploy-to-ec2.ps1

# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip
```

---

## Troubleshooting

### GitHub Actions fails

1. Check **Actions** tab in GitHub for error details
2. Verify secrets are set correctly (EC2_HOST, EC2_SSH_KEY)
3. Ensure EC2 security group allows SSH from GitHub IPs

### Deployment script fails

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Check if git pull works
cd /home/ubuntu/healthtime
git pull

# Check PM2
pm2 status
pm2 logs healthtime-backend

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
```

### Frontend not updating

```bash
# SSH to EC2
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# Manually rebuild
cd /home/ubuntu/healthtime/frontend-angular
npm run build
sudo cp -r dist/healthtime-angular/* /var/www/html/
sudo systemctl restart nginx
```

---

## Why This Approach?

✅ **Simple** - No Jenkins, no complex CI/CD  
✅ **Free** - GitHub Actions free tier is generous  
✅ **Fast** - Deploy in 2-3 minutes  
✅ **Automated** - Push and forget  
✅ **Reliable** - Industry standard  
✅ **Scalable** - Easy to add tests, staging, etc.  

---

## Next Steps

Once comfortable:

1. ✅ Add automated tests before deployment
2. ✅ Add staging environment
3. ✅ Implement blue-green deployments
4. ✅ Add Slack/Discord notifications
5. ✅ Monitor with CloudWatch

---

## File Reference

- **`.github/workflows/deploy-to-ec2.yml`** - GitHub Actions workflow
- **`ec2-deploy.sh`** - Deployment script (copy to EC2)
- **`deploy-to-ec2.ps1`** - PowerShell deployment script
- **`SIMPLE_DEPLOYMENT.md`** - Detailed deployment guide
- **`AWS_SETUP.md`** - EC2 setup instructions

---

## Summary

**For development, use GitHub Actions:**
1. Set up once (10 min)
2. Push to GitHub
3. Auto-deploys to EC2
4. No Jenkins needed!

Simple, automated, professional. 🚀
