#!/bin/bash
# EC2 Deployment Script
# This script should be placed at /home/ubuntu/deploy.sh on your EC2 instance
# Make it executable: chmod +x /home/ubuntu/deploy.sh

set -e  # Exit on any error

echo "========================================="
echo "  Starting Deployment"
echo "========================================="
echo "Time: $(date)"
echo ""

# Navigate to project directory
cd /home/ubuntu/healthtime

# Pull latest changes
echo "[1/4] Pulling latest code from GitHub..."
git pull origin main
echo "✓ Code updated"
echo ""

# Deploy Backend
echo "[2/4] Deploying backend..."
cd backend-node

# Install dependencies (only if package.json changed)
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo "  - Installing dependencies..."
    npm install --production
else
    echo "  - No dependency changes detected"
fi

# Restart backend
echo "  - Restarting backend service..."
pm2 restart healthtime-backend

# Check if backend is running
if pm2 list | grep -q "healthtime-backend.*online"; then
    echo "✓ Backend deployed and running"
else
    echo "✗ Backend deployment failed!"
    exit 1
fi
echo ""

# Deploy Frontend
echo "[3/4] Deploying frontend..."
cd ../frontend-angular

# Install dependencies (only if package.json changed)
if git diff HEAD@{1} --name-only | grep -q "package.json"; then
    echo "  - Installing dependencies..."
    npm install
else
    echo "  - No dependency changes detected"
fi

# Build frontend
echo "  - Building Angular app..."
npm run build

# Copy to Nginx directory
echo "  - Copying files to web server..."
sudo cp -r dist/healthtime-angular/* /var/www/html/

echo "✓ Frontend deployed"
echo ""

# Restart Nginx
echo "[4/4] Restarting web server..."
sudo systemctl restart nginx

if sudo systemctl is-active --quiet nginx; then
    echo "✓ Web server restarted"
else
    echo "✗ Web server restart failed!"
    exit 1
fi

echo ""
echo "========================================="
echo "  ✓ Deployment Completed Successfully!"
echo "========================================="
echo "Time: $(date)"
echo ""
echo "Services status:"
pm2 list | grep healthtime-backend
echo ""
echo "Check your application at:"
echo "  - Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "  - Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000/api"
echo ""
