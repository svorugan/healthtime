# AWS Infrastructure Setup Guide - Simple EC2 Deployment

This guide provides a simplified setup for deploying the healthtime platform on a single EC2 instance.

## Overview

**Simple Architecture:**
- **EC2 Instance**: Hosts both Angular frontend and Node.js backend
- **PostgreSQL**: Either on EC2 or RDS (recommended)
- **S3** (optional): File storage for uploads
- **Route 53** (optional): DNS management

**Estimated Cost**: $15-60/month depending on configuration

## Step 1: Launch EC2 Instance

1. **Navigate to EC2 Console** → Launch Instance
2. **Name**: `healthtime-server`
3. **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
4. **Instance type**: 
   - `t2.micro` (free tier, 1GB RAM) - for testing
   - `t3.small` (2GB RAM) - recommended for production (~$15/month)
   - `t3.medium` (4GB RAM) - for higher traffic (~$30/month)
5. **Key pair**: Create new or use existing (save the .pem file securely)
6. **Network settings**:
   - Allow SSH (port 22) from your IP
   - Allow HTTP (port 80) from anywhere (0.0.0.0/0)
   - Allow HTTPS (port 443) from anywhere (0.0.0.0/0)
   - Allow custom TCP (port 8000) from anywhere (for backend API)
7. **Storage**: 20-30 GB (adjust based on needs)
8. **Launch instance**

## Step 2: Connect to EC2 Instance

### Windows (using PowerShell):
```powershell
ssh -i "path\to\your-key.pem" ubuntu@your-ec2-public-ip
```

### Initial Setup on EC2:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Nginx (web server)
sudo apt install -y nginx

# Install PM2 (process manager for Node.js)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

## Step 3: Database Setup

### Option A: PostgreSQL on EC2 (Simpler)

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL prompt:
```sql
CREATE DATABASE healthtime;
CREATE USER healthtime_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE healthtime TO healthtime_admin;
\q
```

**Connection string**: `postgresql://healthtime_admin:your_secure_password@localhost:5432/healthtime`

### Option B: RDS PostgreSQL (Recommended for Production)

1. **Navigate to RDS Console** → Create Database
2. **Engine**: PostgreSQL
3. **Template**: Free tier (or Dev/Test)
4. **Settings**:
   - DB identifier: `healthtime-db`
   - Master username: `healthtime_admin`
   - Master password: (generate strong password)
5. **Instance**: `db.t3.micro` or `db.t4g.micro` (~$15-20/month)
6. **Storage**: 20 GB General Purpose SSD
7. **Connectivity**:
   - Public access: **Yes** (or configure VPC peering)
   - Security group: Allow PostgreSQL (5432) from EC2 security group
8. **Create database**

**Connection string**: `postgresql://healthtime_admin:password@healthtime-db.xxxxx.region.rds.amazonaws.com:5432/healthtime`

## Step 4: Deploy Backend on EC2

```bash
# Clone your repository
cd /home/ubuntu
git clone https://github.com/your-username/healthtime.git
cd healthtime/backend-node

# Install dependencies
npm install

# Create .env file
nano .env
```

Add to `.env`:
```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://healthtime_admin:password@localhost:5432/healthtime
JWT_SECRET=your-super-secret-jwt-key-change-this
AWS_REGION=us-east-1
S3_BUCKET_NAME=healthtime-uploads
CORS_ORIGINS=http://your-ec2-ip,https://your-domain.com
```

```bash
# Run database migrations
# (Add your migration command here)

# Start backend with PM2
pm2 start src/server.js --name healthtime-backend
pm2 save
pm2 startup
```

## Step 5: Deploy Frontend on EC2

```bash
# Navigate to frontend
cd /home/ubuntu/healthtime/frontend-angular

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to Nginx
sudo cp -r dist/healthtime-angular/* /var/www/html/

# Configure Nginx
sudo nano /etc/nginx/sites-available/default
```

Nginx configuration:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /var/www/html;
    index index.html;
    
    server_name _;
    
    # Frontend - Angular app
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Step 6: S3 Setup (Optional - for file uploads)

1. **Create S3 bucket**: `healthtime-uploads`
2. **Region**: Same as EC2
3. **Block Public Access**: Keep enabled (private)
4. **Create IAM user** for S3 access:
   - Navigate to IAM → Users → Create user
   - User name: `healthtime-s3-user`
   - Attach policy: `AmazonS3FullAccess` (or create custom policy)
   - Create access key → Save credentials
5. **Add to backend .env**:
   ```env
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   ```

## Step 7: SSL Certificate (Optional but Recommended)

### Using Let's Encrypt (Free):

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is set up automatically
```

## Step 8: Domain Setup (Optional)

If you have a domain:

1. **Point domain to EC2**:
   - Get your EC2 public IP from AWS Console
   - In your domain registrar, create an A record pointing to EC2 IP
   - Example: `your-domain.com` → `54.123.45.67`

2. **Or use Route 53**:
   - Create hosted zone for your domain
   - Create A record pointing to EC2 public IP
   - Update nameservers at your domain registrar

## Verification Checklist

- [ ] EC2 instance is running
- [ ] PostgreSQL is installed and database created
- [ ] Backend is running on port 8000 (check with `pm2 status`)
- [ ] Frontend is built and deployed to Nginx
- [ ] Nginx is serving the Angular app on port 80
- [ ] API endpoints are accessible at `http://your-ec2-ip/api`
- [ ] Frontend loads at `http://your-ec2-ip`

## Testing

```bash
# Test backend
curl http://your-ec2-ip:8000/api

# Test frontend
curl http://your-ec2-ip

# Check PM2 logs
pm2 logs healthtime-backend

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

## Maintenance Commands

```bash
# Update code
cd /home/ubuntu/healthtime
git pull

# Restart backend
cd backend-node
npm install
pm2 restart healthtime-backend

# Rebuild frontend
cd ../frontend-angular
npm install
npm run build
sudo cp -r dist/healthtime-angular/* /var/www/html/

# View logs
pm2 logs
sudo tail -f /var/log/nginx/access.log
```

## Cost Estimation (Monthly)

**Minimal Setup (PostgreSQL on EC2):**
- EC2 t3.small: ~$15
- Storage (30GB): ~$3
- Data transfer: ~$1-5
- **Total**: ~$20-25/month

**Recommended Setup (with RDS):**
- EC2 t3.small: ~$15
- RDS db.t3.micro: ~$15-20
- S3 storage: ~$1-5
- Data transfer: ~$1-5
- **Total**: ~$35-50/month

## Scaling Later

When you need to scale:
- Add Application Load Balancer
- Use Auto Scaling Groups
- Move to ECS/Fargate for containers
- Add CloudFront CDN
- Implement Redis for caching

## Support

- AWS Free Tier: First 12 months get free t2.micro instance
- AWS Documentation: https://docs.aws.amazon.com
- Ubuntu Server Guide: https://ubuntu.com/server/docs

