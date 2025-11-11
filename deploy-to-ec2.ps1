# Simple deployment script for EC2
# Usage: .\deploy-to-ec2.ps1

param(
    [string]$KeyPath = "",
    [string]$EC2Host = "",
    [string]$Message = "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Check if key path and host are provided
if ([string]::IsNullOrEmpty($KeyPath) -or [string]::IsNullOrEmpty($EC2Host)) {
    Write-Error "Please provide EC2 key path and host!"
    Write-Info "Usage: .\deploy-to-ec2.ps1 -KeyPath 'path\to\key.pem' -EC2Host 'your-ec2-ip'"
    Write-Info "Or edit this file and set default values"
    exit 1
}

Write-Info "========================================="
Write-Info "  Deploying to EC2"
Write-Info "========================================="

# Step 1: Commit and push to GitHub
Write-Info "`n[1/3] Pushing to GitHub..."
git add .
git commit -m $Message
git push

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to push to GitHub. Aborting deployment."
    exit 1
}

Write-Success "✓ Code pushed to GitHub"

# Step 2: SSH into EC2 and pull latest code
Write-Info "`n[2/3] Pulling latest code on EC2..."
$pullCommand = "cd /home/ubuntu/healthtime && git pull"
ssh -i $KeyPath ubuntu@$EC2Host $pullCommand

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to pull code on EC2. Check SSH connection."
    exit 1
}

Write-Success "✓ Code pulled on EC2"

# Step 3: Deploy backend and frontend
Write-Info "`n[3/3] Deploying application..."
$deployCommand = @"
cd /home/ubuntu/healthtime/backend-node && \
npm install --production && \
pm2 restart healthtime-backend && \
cd ../frontend-angular && \
npm install && \
npm run build && \
sudo cp -r dist/healthtime-angular/* /var/www/html/ && \
sudo systemctl restart nginx && \
echo 'Deployment completed successfully!'
"@

ssh -i $KeyPath ubuntu@$EC2Host $deployCommand

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed. Check logs on EC2."
    exit 1
}

Write-Success "`n========================================="
Write-Success "  ✓ Deployment Successful!"
Write-Success "========================================="
Write-Info "Your app is live at: http://$EC2Host"
