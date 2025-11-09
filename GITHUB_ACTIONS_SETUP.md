# GitHub Actions CI/CD Setup Guide

This guide explains how to set up GitHub Actions for automated CI/CD of the healthtime platform.

## Overview

The project uses GitHub Actions for:
- **Backend CI**: Run tests and linting on pull requests
- **Backend Deploy**: Build Docker image and deploy to ECS on push to main
- **Angular CI**: Run tests and build Angular app on pull requests
- **Angular Deploy**: Build and deploy Angular app to S3/CloudFront on push to main

## Workflow Files

### 1. Backend CI (`backend-ci.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Actions:**
- Sets up Node.js 18
- Installs dependencies
- Runs linter
- Runs tests (with PostgreSQL service)

### 2. Backend Deploy (`backend-deploy.yml`)

**Triggers:**
- Push to `main` branch

**Actions:**
- Builds Docker image
- Pushes to ECR
- Updates ECS task definition
- Deploys to ECS service

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

**Environment Variables:**
- `AWS_REGION` (default: us-east-1)
- `ECR_REPOSITORY` (default: healthtime-backend)
- `ECS_CLUSTER` (default: healthtime-cluster)
- `ECS_SERVICE` (default: healthtime-backend-service)

### 3. Angular CI (`angular-ci.yml`)

**Triggers:**
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Actions:**
- Sets up Node.js 18
- Installs dependencies
- Runs linter
- Runs tests
- Builds Angular app

### 4. Angular Deploy (`angular-deploy.yml`)

**Triggers:**
- Push to `main` branch

**Actions:**
- Builds Angular app for production
- Syncs to S3 bucket
- Invalidates CloudFront cache

**Required Secrets:**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `API_URL` (for environment configuration)
- `CLOUDFRONT_DISTRIBUTION_ID` (optional)

**Environment Variables:**
- `AWS_REGION` (default: us-east-1)
- `S3_BUCKET` (default: healthtime-angular-app)

## Setting Up GitHub Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key-here` |
| `API_URL` | Backend API URL | `https://api.your-domain.com/api` |

### Optional Secrets

| Secret Name | Description |
|------------|-------------|
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID for cache invalidation |

## Creating AWS IAM User for GitHub Actions

1. Navigate to IAM Console → Users → Create user
2. User name: `github-actions-healthtime`
3. Access type: **Programmatic access**
4. Attach policies:
   - `AmazonEC2ContainerRegistryFullAccess` (for ECR)
   - `AmazonECS_FullAccess` (for ECS)
   - `AmazonS3FullAccess` (for S3)
   - `CloudFrontFullAccess` (for CloudFront invalidation)
   - Or create custom policy with least privilege

### Custom IAM Policy Example

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:UpdateService",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::healthtime-angular-app",
        "arn:aws:s3:::healthtime-angular-app/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

5. Save the Access Key ID and Secret Access Key
6. Add them to GitHub Secrets

## Setting Up Environments

1. Navigate to **Settings** → **Environments**
2. Create environment: `production`
3. Add environment secrets (same as repository secrets)
4. Add protection rules (optional):
   - Required reviewers
   - Wait timer

## Workflow Permissions

Ensure GitHub Actions has necessary permissions:

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**:
   - Select **Read and write permissions**
   - Check **Allow GitHub Actions to create and approve pull requests**

## Testing Workflows

### Test Backend CI

1. Create a pull request to `main` branch
2. Check **Actions** tab for workflow run
3. Verify all steps pass

### Test Backend Deploy

1. Merge pull request to `main`
2. Check **Actions** tab for deployment
3. Verify ECS service is updated
4. Check ECS console for new task definition

### Test Angular CI

1. Create a pull request to `main` branch
2. Check **Actions** tab for workflow run
3. Verify build succeeds

### Test Angular Deploy

1. Merge pull request to `main`
2. Check **Actions** tab for deployment
3. Verify S3 bucket is updated
4. Check CloudFront invalidation

## Troubleshooting

### Backend Deploy Issues

**Error: ECR login failed**
- Verify AWS credentials are correct
- Check IAM user has ECR permissions

**Error: ECS service update failed**
- Check ECS service exists
- Verify task definition is valid
- Check security groups and networking

**Error: Task fails to start**
- Check CloudWatch logs
- Verify environment variables
- Check database connectivity

### Angular Deploy Issues

**Error: S3 sync failed**
- Verify bucket name is correct
- Check IAM permissions for S3
- Verify bucket exists

**Error: CloudFront invalidation failed**
- Check distribution ID is correct
- Verify IAM permissions for CloudFront

### General Issues

**Workflow not triggering**
- Check branch names match workflow triggers
- Verify workflow file syntax is correct
- Check GitHub Actions is enabled

**Secrets not found**
- Verify secrets are added to repository
- Check secret names match workflow
- Ensure secrets are added to correct environment

## Best Practices

1. **Use Environments**: Separate secrets for staging/production
2. **Review Deployments**: Require approval for production deployments
3. **Monitor Workflows**: Set up notifications for failed workflows
4. **Use Branch Protection**: Require CI to pass before merging
5. **Tag Releases**: Tag releases for easy rollback
6. **Limit Secrets**: Only add necessary secrets
7. **Rotate Credentials**: Regularly rotate AWS credentials

## Monitoring

### GitHub Actions

- View workflow runs in **Actions** tab
- Set up email notifications for failures
- Use workflow badges in README

### AWS

- Monitor ECS service events
- Check CloudWatch logs
- Monitor S3 access logs
- Track CloudFront metrics

## Rollback Procedure

### Backend Rollback

1. Find previous task definition in ECS
2. Update service to use previous revision
3. Or redeploy previous Docker image tag

### Frontend Rollback

1. Find previous commit
2. Re-run deployment workflow for that commit
3. Or manually restore from S3 versioning

## Support

For GitHub Actions issues:
- GitHub Actions Documentation
- GitHub Community Forum
- GitHub Support

For AWS issues:
- AWS Documentation
- AWS Support

