# Production Deployment Guide

## Prerequisites
- EC2 instance with Node.js and PostgreSQL installed
- Nginx installed on EC2
- Your EC2 public IP address

## Step 1: Configure Backend on EC2

1. SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

2. Navigate to backend directory:
```bash
cd /home/ubuntu/healthtime/backend-node
```

3. Create production `.env` file:
```bash
nano .env
```

Add the following (replace with your actual values):
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/healthtime
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGINS=http://YOUR_EC2_PUBLIC_IP,http://YOUR_EC2_PUBLIC_IP:3000
PORT=8000
NODE_ENV=production
```

4. Install dependencies and start backend:
```bash
npm install
npm start
```

Or use PM2 for production:
```bash
npm install -g pm2
pm2 start src/server.js --name healthtime-backend
pm2 save
pm2 startup
```

## Step 2: Build Frontend Locally

1. On your local machine, update `.env.production`:
```bash
# In frontend/.env.production
REACT_APP_BACKEND_URL=http://YOUR_EC2_PUBLIC_IP:8000
```

2. Build for production:
```bash
cd frontend
npm run build
```

## Step 3: Deploy Frontend to EC2

1. Copy build folder to EC2:
```powershell
# From your local machine
scp -i your-key.pem -r build ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/healthtime/frontend/
```

2. On EC2, copy to nginx directory:
```bash
sudo cp -r /home/ubuntu/healthtime/frontend/build/* /var/www/html/
```

## Step 4: Configure Nginx

1. Edit nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/default
```

2. Add this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_EC2_PUBLIC_IP;

    root /var/www/html;
    index index.html;

    # Frontend - serve React app
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Test and restart nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

## Step 5: Configure Security Group

Ensure your EC2 security group allows:
- Port 80 (HTTP) from 0.0.0.0/0
- Port 8000 (Backend) from your IP or 0.0.0.0/0
- Port 22 (SSH) from your IP

## Step 6: Access Application

Open browser and navigate to:
```
http://YOUR_EC2_PUBLIC_IP
```

## Troubleshooting

### Check Backend Status
```bash
pm2 status
pm2 logs healthtime-backend
```

### Check Nginx Status
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Check Backend Logs
```bash
cd /home/ubuntu/healthtime/backend-node
npm start
# Check console output for errors
```

### CORS Issues
Verify backend `.env` has correct CORS_ORIGINS:
```env
CORS_ORIGINS=http://YOUR_EC2_PUBLIC_IP,http://YOUR_EC2_PUBLIC_IP:3000
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U postgres -d healthtime -c "SELECT 1;"
```

## Production Best Practices

1. **Use HTTPS**: Set up SSL certificate with Let's Encrypt
2. **Environment Variables**: Never commit `.env` files
3. **Database Backups**: Set up automated PostgreSQL backups
4. **Monitoring**: Use PM2 monitoring or CloudWatch
5. **Domain Name**: Use a proper domain instead of IP address
