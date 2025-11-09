# AWS Infrastructure Setup Guide

This guide provides step-by-step instructions for setting up AWS infrastructure for the healthtime platform.

## Overview

The healthtime platform uses the following AWS services:
- **RDS PostgreSQL**: Database
- **S3**: File storage and static hosting
- **ECS Fargate**: Container hosting for backend
- **ECR**: Docker image registry
- **CloudFront**: CDN for Angular app
- **Route 53**: DNS management
- **ACM**: SSL certificates
- **ALB**: Application Load Balancer

## Step 1: RDS PostgreSQL Setup

### Create RDS Instance

1. Navigate to RDS Console → Create Database
2. Select **PostgreSQL**
3. Template: **Production** (or Dev/Test for development)
4. Settings:
   - DB instance identifier: `healthtime-db`
   - Master username: `healthtime_admin`
   - Master password: (generate strong password)
5. Instance configuration:
   - DB instance class: `db.t3.medium` (or `db.t3.small` for dev)
   - Storage: 100 GB, General Purpose SSD
6. Connectivity:
   - VPC: Default or create new
   - Subnet group: Default
   - Public access: **No** (for security)
   - VPC security group: Create new or use existing
7. Database authentication: **Password authentication**
8. Additional configuration:
   - Initial database name: `healthtime`
   - Backup retention: 7 days
   - Enable encryption: **Yes**
   - Enable automated backups: **Yes**

### Security Group Configuration

1. Create security group: `healthtime-db-sg`
2. Inbound rules:
   - Type: PostgreSQL
   - Port: 5432
   - Source: ECS security group (to be created)

### Connection String Format

```
postgresql://username:password@healthtime-db.xxxxx.us-east-1.rds.amazonaws.com:5432/healthtime
```

## Step 2: S3 Buckets Setup

### File Uploads Bucket

1. Create bucket: `healthtime-uploads`
2. Region: `us-east-1` (or your preferred region)
3. Block Public Access: **Keep enabled** (private bucket)
4. Versioning: **Enable** (optional)
5. Encryption: **Enable** (SSE-S3 or SSE-KMS)
6. Lifecycle rules: Configure to move old files to Glacier after 90 days

### Angular App Bucket

1. Create bucket: `healthtime-angular-app`
2. Region: `us-east-1`
3. Block Public Access: **Disable** (for static website hosting)
4. Enable static website hosting:
   - Index document: `index.html`
   - Error document: `index.html` (for Angular routing)
5. Bucket policy (for CloudFront):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontServicePrincipal",
         "Effect": "Allow",
         "Principal": {
           "Service": "cloudfront.amazonaws.com"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::healthtime-angular-app/*",
         "Condition": {
           "StringEquals": {
             "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
           }
         }
       }
     ]
   }
   ```

## Step 3: ECR Repository

1. Navigate to ECR Console → Create repository
2. Repository name: `healthtime-backend`
3. Tag immutability: **Enable** (recommended)
4. Scan on push: **Enable** (for security scanning)
5. Note the repository URI: `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/healthtime-backend`

## Step 4: ECS Fargate Setup

### Create Cluster

1. Navigate to ECS Console → Clusters → Create Cluster
2. Cluster name: `healthtime-cluster`
3. Infrastructure: **AWS Fargate** (serverless)

### Create Task Definition

1. Navigate to Task Definitions → Create new
2. Task definition family: `healthtime-backend`
3. Launch type: **Fargate**
4. Task size:
   - CPU: 0.5 vCPU (256)
   - Memory: 1 GB (1024)
5. Container definition:
   - Container name: `healthtime-backend`
   - Image: `ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/healthtime-backend:latest`
   - Port mappings: 8000
   - Environment variables: (add from Secrets Manager or directly)
     - `NODE_ENV=production`
     - `PORT=8000`
     - `DATABASE_URL=...`
     - `JWT_SECRET=...`
     - `AWS_ACCESS_KEY_ID=...`
     - `AWS_SECRET_ACCESS_KEY=...`
     - `AWS_REGION=us-east-1`
     - `S3_BUCKET_NAME=healthtime-uploads`
     - `CORS_ORIGINS=https://your-domain.com`

### Create Application Load Balancer

1. Navigate to EC2 → Load Balancers → Create Load Balancer
2. Type: **Application Load Balancer**
3. Name: `healthtime-alb`
4. Scheme: **Internet-facing**
5. IP address type: **IPv4**
6. Listeners: HTTP (80) and HTTPS (443)
7. Availability Zones: Select at least 2
8. Security group: Create new `healthtime-alb-sg`
   - Allow HTTP (80) from 0.0.0.0/0
   - Allow HTTPS (443) from 0.0.0.0/0
9. Target group:
   - Name: `healthtime-backend-tg`
   - Target type: **IP**
   - Protocol: **HTTP**
   - Port: 8000
   - Health check path: `/api`

### Create ECS Service

1. Navigate to ECS Cluster → Services → Create
2. Launch type: **Fargate**
3. Task definition: `healthtime-backend`
4. Service name: `healthtime-backend-service`
5. Number of tasks: 2 (for high availability)
6. Networking:
   - VPC: Same as RDS
   - Subnets: Select at least 2 public subnets
   - Security group: Create `healthtime-ecs-sg`
     - Allow inbound from ALB security group on port 8000
   - Auto-assign public IP: **Enable**
7. Load balancing:
   - Load balancer type: **Application Load Balancer**
   - Load balancer: `healthtime-alb`
   - Target group: `healthtime-backend-tg`
   - Container to load balance: `healthtime-backend:8000`

## Step 5: CloudFront Distribution

1. Navigate to CloudFront → Create Distribution
2. Origin:
   - Origin domain: S3 bucket `healthtime-angular-app`
   - Origin access: **Origin access control**
   - Create OAC and attach to bucket policy
3. Default cache behavior:
   - Viewer protocol policy: **Redirect HTTP to HTTPS**
   - Allowed HTTP methods: GET, HEAD, OPTIONS
   - Cache policy: **CachingOptimized**
4. Settings:
   - Price class: **Use all edge locations**
   - Alternate domain names: `your-domain.com`, `www.your-domain.com`
   - SSL certificate: Request from ACM (see Step 6)
   - Default root object: `index.html`
   - Custom error responses:
     - 403 → 200 → `/index.html`
     - 404 → 200 → `/index.html`

## Step 6: SSL Certificate (ACM)

1. Navigate to ACM → Request certificate
2. Domain names:
   - `your-domain.com`
   - `*.your-domain.com` (wildcard)
   - `api.your-domain.com`
3. Validation method: **DNS validation**
4. Add DNS records to Route 53 (or your DNS provider)
5. Wait for validation (usually 5-10 minutes)

## Step 7: Route 53 DNS

1. Navigate to Route 53 → Hosted zones
2. Create hosted zone for your domain
3. Create records:
   - **A record** (Alias):
     - Name: (blank for root) or `www`
     - Alias: **Yes**
     - Alias target: CloudFront distribution
   - **A record** (Alias):
     - Name: `api`
     - Alias: **Yes**
     - Alias target: ALB

## Step 8: Security Groups Summary

### Database Security Group (`healthtime-db-sg`)
- Inbound: PostgreSQL (5432) from `healthtime-ecs-sg`

### ECS Security Group (`healthtime-ecs-sg`)
- Inbound: HTTP (8000) from `healthtime-alb-sg`
- Outbound: All traffic

### ALB Security Group (`healthtime-alb-sg`)
- Inbound: HTTP (80) and HTTPS (443) from 0.0.0.0/0
- Outbound: All traffic

## Step 9: IAM Roles and Policies

### ECS Task Execution Role

1. Create IAM role: `ecsTaskExecutionRole`
2. Attach policies:
   - `AmazonECSTaskExecutionRolePolicy`
   - Custom policy for Secrets Manager (if using)

### ECS Task Role

1. Create IAM role: `ecsTaskRole`
2. Attach policies:
   - S3 access policy for uploads bucket
   - CloudWatch Logs policy

## Step 10: CloudWatch Logs

1. Create log group: `/ecs/healthtime-backend`
2. Retention: 30 days (or as needed)
3. ECS task definition will automatically send logs here

## Verification Checklist

- [ ] RDS instance is running and accessible
- [ ] S3 buckets are created with correct permissions
- [ ] ECR repository exists
- [ ] ECS cluster is created
- [ ] Task definition is created
- [ ] ALB is created and healthy
- [ ] ECS service is running with tasks
- [ ] CloudFront distribution is deployed
- [ ] SSL certificates are validated
- [ ] DNS records are configured
- [ ] Security groups are properly configured
- [ ] IAM roles have correct permissions

## Next Steps

1. Configure GitHub Secrets (see DEPLOYMENT.md)
2. Run database migrations
3. Deploy backend via GitHub Actions
4. Deploy frontend via GitHub Actions
5. Test all endpoints
6. Monitor CloudWatch logs

## Cost Estimation (Monthly)

- RDS (db.t3.medium): ~$50-100
- ECS Fargate (2 tasks): ~$30-60
- ALB: ~$20-30
- S3 Storage: ~$5-10
- CloudFront: ~$5-20
- Route 53: ~$1
- Data Transfer: Variable

**Total**: ~$110-240/month (varies by usage)

## Support

For AWS-specific issues, refer to:
- AWS Documentation
- AWS Support (if you have a support plan)
- AWS Forums

