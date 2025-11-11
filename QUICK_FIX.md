# Quick Fix for Your Current Issue

## Problem
Your React app is trying to connect to `http://localhost:8000` instead of your EC2 backend, and CORS is blocking the requests.

## Quick Solution (3 Steps)

### Step 1: Update Frontend Configuration

1. Open `frontend/.env.production` (already created for you)
2. Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 IP address:
   ```
   REACT_APP_BACKEND_URL=http://192.168.1.96:8000
   ```
   (Use your actual EC2 **public** IP, not the local IP shown in the error)

### Step 2: Rebuild Frontend

```powershell
cd frontend
npm run build
```

### Step 3: Redeploy to EC2

```powershell
# Copy build to EC2 (replace with your key path and EC2 IP)
scp -i your-key.pem -r build ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/healthtime/frontend/

# SSH into EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# On EC2, deploy the build
sudo cp -r /home/ubuntu/healthtime/frontend/build/* /var/www/html/
```

### Step 4: Fix Backend CORS (On EC2)

SSH into your EC2 and update backend configuration:

```bash
cd /home/ubuntu/healthtime/backend-node
nano .env
```

Add or update these lines (replace with your EC2 public IP):
```env
CORS_ORIGINS=http://YOUR_EC2_PUBLIC_IP,http://YOUR_EC2_PUBLIC_IP:3000
NODE_ENV=production
```

Restart your backend:
```bash
# If using PM2
pm2 restart healthtime-backend

# Or if running directly
# Stop current process and restart
npm start
```

## Automated Deployment (Recommended)

Use the deployment script I created:

```powershell
.\deploy-production.ps1 -EC2_IP "YOUR_EC2_PUBLIC_IP" -KEY_PATH "path\to\your-key.pem"
```

## Verify It Works

1. Open browser: `http://YOUR_EC2_PUBLIC_IP`
2. Try Admin Login
3. Check browser console - no CORS errors should appear

## Common Issues

### Still seeing localhost:8000?
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check that you rebuilt with `npm run build` after updating .env.production

### CORS errors persist?
- Verify backend .env has correct CORS_ORIGINS
- Restart backend after changing .env
- Check backend logs: `pm2 logs healthtime-backend`

### Can't connect to backend?
- Ensure backend is running: `pm2 status`
- Check EC2 security group allows port 8000
- Verify backend is listening on 0.0.0.0: Check server.js line 89
