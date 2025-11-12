# Deployment Workflow Guide

## Every Time You Make Code Changes

Follow these steps to deploy your changes to AWS EC2.

---

## Frontend Changes Only

### 1. Update Environment Variables (if needed)
```bash
# Edit frontend/.env for your EC2 IP
REACT_APP_BACKEND_URL=http://18.188.225.209
```

### 2. Build the Frontend
```powershell
cd frontend
npm run build
```

### 3. Verify Build
```powershell
# Should show EC2 IP, not localhost
findstr /s "18.188.225.209" build\static\js\*.js

# Should return nothing (exit code 1)
findstr /s "localhost:8000" build\static\js\*.js
```

### 4. Deploy to EC2
```powershell
# Copy build to EC2
scp -i "C:\Users\svoru\Downloads\healthtime.pem" -r build ubuntu@18.188.225.209:/home/ubuntu/healthtime/frontend/
```

### 5. On EC2, Deploy Build
```bash
ssh -i "C:\Users\svoru\Downloads\healthtime.pem" ubuntu@18.188.225.209

# Deploy to nginx
sudo cp -r /home/ubuntu/healthtime/frontend/build/* /var/www/html/

# Exit
exit
```

### 6. Test
- Open browser: `http://18.188.225.209`
- Hard refresh: `Ctrl + Shift + R` or `Ctrl + F5`
- Test your changes

---

## Backend Changes Only

### 1. Commit and Push Changes
```powershell
cd c:\Srinivas\Cursor\Healthtime

git add .
git commit -m "Your commit message"
git push origin main
```

### 2. Pull Changes on EC2
```bash
ssh -i "C:\Users\svoru\Downloads\healthtime.pem" ubuntu@18.188.225.209

cd /home/ubuntu/healthtime
git pull origin main

cd backend-node
npm install  # Only if you added new dependencies

# Restart backend
pm2 restart healthtime-backend

# Check logs
pm2 logs healthtime-backend --lines 20
# Press Ctrl+C to exit logs

# Verify backend is running
pm2 status

exit
```

### 3. Test
- Test your API endpoints
- Check browser console for errors

---

## Both Frontend and Backend Changes

### 1. Backend First
```powershell
# Commit and push
git add .
git commit -m "Your commit message"
git push origin main
```

```bash
# SSH to EC2
ssh -i "C:\Users\svoru\Downloads\healthtime.pem" ubuntu@18.188.225.209

# Pull and restart backend
cd /home/ubuntu/healthtime
git pull origin main
cd backend-node
npm install
pm2 restart healthtime-backend
pm2 status
exit
```

### 2. Frontend Second
```powershell
# Build frontend
cd frontend
npm run build

# Deploy to EC2
scp -i "C:\Users\svoru\Downloads\healthtime.pem" -r build ubuntu@18.188.225.209:/home/ubuntu/healthtime/frontend/
```

```bash
# SSH and deploy
ssh -i "C:\Users\svoru\Downloads\healthtime.pem" ubuntu@18.188.225.209
sudo cp -r /home/ubuntu/healthtime/frontend/build/* /var/www/html/
exit
```

### 3. Test
- Open `http://18.188.225.209`
- Hard refresh browser
- Test all changes

---

## Quick Reference Commands

### Check Backend Status on EC2
```bash
pm2 status
pm2 logs healthtime-backend --lines 30
```

### Restart Backend
```bash
pm2 restart healthtime-backend
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Test Backend Locally on EC2
```bash
curl http://localhost:8000/api
```

---

## Common Issues & Solutions

### Issue: Frontend shows old code
**Solution**: Hard refresh browser (`Ctrl + Shift + R`) or clear cache

### Issue: Backend not responding
**Solution**: 
```bash
pm2 restart healthtime-backend
pm2 logs healthtime-backend
```

### Issue: CORS errors
**Solution**: Check backend `.env` has correct CORS_ORIGINS:
```bash
cat /home/ubuntu/healthtime/backend-node/.env
```

### Issue: 404 errors on API
**Solution**: 
1. Verify route exists in backend code
2. Pull latest code: `git pull origin main`
3. Restart backend: `pm2 restart healthtime-backend`

### Issue: Database connection errors
**Solution**: Check DATABASE_URL in backend `.env` on EC2

---

## Environment Files (DO NOT COMMIT)

### Frontend `.env` (Local Development)
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Frontend `.env.production` (Production Build)
```env
REACT_APP_BACKEND_URL=http://18.188.225.209
```

### Backend `.env` (On EC2)
```env
DATABASE_URL=postgresql://admin:Admin00@localhost:5432/healthtime
JWT_SECRET=xlksiewKxldfJLLDkNNKDl.x032lL
CORS_ORIGINS=http://18.188.225.209,http://18.188.225.209:3000
PORT=8000
NODE_ENV=production
```

---

## Automated Deployment Script (Optional)

Use the provided script for faster deployment:

```powershell
.\deploy-production.ps1 -EC2_IP "18.188.225.209" -KEY_PATH "C:\Users\svoru\Downloads\healthtime.pem"
```

---

## Best Practices

1. ✅ **Always test locally first** before deploying
2. ✅ **Commit backend changes to git** before deploying
3. ✅ **Build frontend fresh** for each deployment
4. ✅ **Check PM2 logs** after backend restart
5. ✅ **Hard refresh browser** after frontend deployment
6. ✅ **Keep `.env` files secure** - never commit them
7. ✅ **Use meaningful commit messages**
8. ✅ **Test after every deployment**

---

## Emergency Rollback

If something breaks:

### Backend Rollback
```bash
cd /home/ubuntu/healthtime
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>
cd backend-node
pm2 restart healthtime-backend
```

### Frontend Rollback
Keep a backup of your last working build locally, then redeploy it.

---

## Monitoring

### Check Application Health
```bash
# Backend status
pm2 status

# Backend logs (live)
pm2 logs healthtime-backend

# Nginx status
sudo systemctl status nginx

# Disk space
df -h

# Memory usage
free -h
```

---

## Need Help?

- Check logs: `pm2 logs healthtime-backend`
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Test backend: `curl http://localhost:8000/api`
- Verify environment: `cat /home/ubuntu/healthtime/backend-node/.env`
