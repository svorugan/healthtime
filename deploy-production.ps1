# Production Deployment Script for Windows
# This script builds the frontend and deploys to EC2

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2_IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KEY_PATH,
    
    [Parameter(Mandatory=$false)]
    [string]$EC2_USER = "ubuntu"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Healthtime Production Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Update frontend .env.production
Write-Host "[1/5] Updating frontend configuration..." -ForegroundColor Yellow
$envContent = "# Production Backend API URL`nREACT_APP_BACKEND_URL=http://${EC2_IP}:8000"
Set-Content -Path "frontend\.env.production" -Value $envContent
Write-Host "✓ Updated frontend/.env.production" -ForegroundColor Green

# Step 2: Build frontend
Write-Host "`n[2/5] Building frontend for production..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend build completed" -ForegroundColor Green
Set-Location ..

# Step 3: Copy build to EC2
Write-Host "`n[3/5] Copying build to EC2..." -ForegroundColor Yellow
scp -i $KEY_PATH -r frontend\build ${EC2_USER}@${EC2_IP}:/home/${EC2_USER}/healthtime/frontend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to copy build to EC2!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build copied to EC2" -ForegroundColor Green

# Step 4: Deploy on EC2
Write-Host "`n[4/5] Deploying on EC2..." -ForegroundColor Yellow
ssh -i $KEY_PATH ${EC2_USER}@${EC2_IP} "sudo cp -r /home/${EC2_USER}/healthtime/frontend/build/* /var/www/html/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to deploy on EC2!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Deployed to /var/www/html/" -ForegroundColor Green

# Step 5: Restart nginx
Write-Host "`n[5/5] Restarting nginx..." -ForegroundColor Yellow
ssh -i $KEY_PATH ${EC2_USER}@${EC2_IP} "sudo systemctl restart nginx"
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Warning: Failed to restart nginx" -ForegroundColor Yellow
} else {
    Write-Host "✓ Nginx restarted" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nYour application is available at:" -ForegroundColor White
Write-Host "  http://${EC2_IP}" -ForegroundColor Cyan
Write-Host "`nMake sure your backend is running on EC2:" -ForegroundColor Yellow
Write-Host "  ssh -i $KEY_PATH ${EC2_USER}@${EC2_IP}" -ForegroundColor White
Write-Host "  cd /home/${EC2_USER}/healthtime/backend-node" -ForegroundColor White
Write-Host "  pm2 status" -ForegroundColor White
Write-Host ""
