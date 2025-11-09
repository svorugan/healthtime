# healthtime Platform Deployment Guide

This guide covers deploying the healthtime platform to AWS using GitHub Actions for CI/CD.

## Prerequisites

1. AWS Account with appropriate permissions
2. GitHub repository with Actions enabled
3. AWS CLI configured (for local testing)
4. Domain name (optional, for production)

## AWS Infrastructure Setup

### 1. RDS PostgreSQL Database

1. Create RDS PostgreSQL instance:
   - Instance class: `db.t3.medium` (or larger for production)
   - Multi-AZ: Enabled for production
   - Storage: 100GB (adjust as needed)
   - Backup retention: 7 days
   - Security group: Allow inbound from ECS security group on port 5432

2. Note the endpoint URL for `DATABASE_URL` environment variable

### 2. S3 Buckets

Create two S3 buckets:

1. **File Uploads Bucket** (`healthtime-uploads`):
   ```bash
   aws s3 mb s3://healthtime-uploads --region us-east-1
   ```

2. **Angular App Bucket** (`healthtime-angular-app`):
   ```bash
   aws s3 mb s3://healthtime-angular-app --region us-east-1
   aws s3 website s3://healthtime-angular-app --index-document index.html
   ```

### 3. ECR Repository

Create ECR repository for Docker images:
```bash
aws ecr create-repository --repository-name healthtime-backend --region us-east-1
```

### 4. ECS Fargate Cluster

1. Create ECS Cluster:
   ```bash
   aws ecs create-cluster --cluster-name healthtime-cluster
   ```

2. Create Task Definition (see `infrastructure/ecs-task-definition.json`)

3. Create Application Load Balancer (ALB)

4. Create ECS Service with ALB integration

### 5. CloudFront Distribution

Create CloudFront distribution for Angular app:
- Origin: S3 bucket `healthtime-angular-app`
- SSL Certificate: Request from ACM
- Default root object: `index.html`

### 6. Route 53 (Optional)

Configure DNS records:
- A record pointing to CloudFront distribution
- CNAME for API pointing to ALB

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

### Required Secrets

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `API_URL` - Backend API URL (for Angular build)

### Optional Secrets

- `CLOUDFRONT_DISTRIBUTION_ID` - CloudFront distribution ID for cache invalidation

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=8000
DATABASE_URL=postgresql://user:password@rds-endpoint:5432/healthtime
JWT_SECRET=your-secret-key-here
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=healthtime-uploads
CORS_ORIGINS=https://your-domain.com
```

### Frontend (environment.prod.ts)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.your-domain.com/api'
};
```

## Deployment Process

### Backend Deployment

1. Push to `main` branch triggers `backend-deploy.yml`
2. Workflow builds Docker image
3. Pushes image to ECR
4. Updates ECS task definition
5. Deploys new task definition to ECS service

### Frontend Deployment

1. Push to `main` branch triggers `angular-deploy.yml`
2. Workflow builds Angular app
3. Syncs build files to S3
4. Invalidates CloudFront cache

## Database Migrations

Run migrations manually or add to deployment workflow:

```bash
psql $DATABASE_URL -f backend-node/migrations/add_hospital_implant_roles.sql
psql $DATABASE_URL -f backend-node/migrations/add_doctor_surgeries_junction.sql
psql $DATABASE_URL -f backend-node/migrations/add_notifications_table.sql
```

## Monitoring and Logs

- **ECS Logs**: CloudWatch Logs
- **Application Logs**: CloudWatch Logs Group `/ecs/healthtime-backend`
- **ALB Logs**: Enable access logs in S3
- **CloudFront Logs**: Enable in CloudFront distribution

## Troubleshooting

### Backend Issues

1. Check ECS service events in AWS Console
2. Check CloudWatch logs for application errors
3. Verify environment variables in task definition
4. Check security group rules for database access

### Frontend Issues

1. Check S3 bucket permissions
2. Verify CloudFront distribution status
3. Check browser console for API errors
4. Verify CORS settings in backend

## Rollback Procedure

### Backend Rollback

1. Find previous task definition revision in ECS
2. Update service to use previous revision
3. Or redeploy previous Docker image tag

### Frontend Rollback

1. Restore previous build from S3 versioning
2. Or redeploy previous commit

## Security Best Practices

1. Use AWS Secrets Manager for sensitive data
2. Enable encryption at rest for RDS
3. Use HTTPS for all communications
4. Implement WAF for CloudFront
5. Regular security updates and patches
6. Use least privilege IAM policies

## Cost Optimization

1. Use Auto Scaling for ECS services
2. Enable S3 lifecycle policies
3. Use CloudFront caching effectively
4. Monitor and optimize RDS instance size
5. Use Reserved Instances for predictable workloads

## Support

For issues or questions, refer to:
- AWS Documentation
- GitHub Actions Documentation
- Project README files

