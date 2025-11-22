# HealthTime Database Deployment Script for Windows
# This PowerShell script handles the complete database deployment

param(
    [Parameter(Mandatory=$true)]
    [string]$DatabaseName,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Host = "localhost",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 5432,
    
    [Parameter(Mandatory=$false)]
    [switch]$CreateDatabase
)

Write-Host "HealthTime Database Deployment Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Set error action preference
$ErrorActionPreference = "Stop"

try {
    # Check if psql is available
    Write-Host "Checking PostgreSQL client..." -ForegroundColor Yellow
    $psqlVersion = psql --version
    Write-Host "Found: $psqlVersion" -ForegroundColor Green

    # Create database if requested
    if ($CreateDatabase) {
        Write-Host "Creating database '$DatabaseName'..." -ForegroundColor Yellow
        $createDbCommand = "CREATE DATABASE `"$DatabaseName`";"
        echo $createDbCommand | psql -h $Host -p $Port -U $Username -d postgres
        Write-Host "Database '$DatabaseName' created successfully!" -ForegroundColor Green
    }

    # Set connection string
    $env:PGPASSWORD = Read-Host "Enter password for user '$Username'" -AsSecureString
    $env:PGPASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($env:PGPASSWORD))

    Write-Host "Connecting to database..." -ForegroundColor Yellow
    
    # Test connection
    psql -h $Host -p $Port -U $Username -d $DatabaseName -c "SELECT version();"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Connection successful!" -ForegroundColor Green
    } else {
        throw "Failed to connect to database"
    }

    # Run deployment script
    Write-Host "Deploying HealthTime schema..." -ForegroundColor Yellow
    Write-Host "This will drop and recreate all tables!" -ForegroundColor Red
    
    $confirmation = Read-Host "Are you sure you want to continue? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }

    # Execute the deployment
    psql -h $Host -p $Port -U $Username -d $DatabaseName -f "sql/step_by_step_deploy.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database deployment completed successfully!" -ForegroundColor Green
        
        # Show summary
        Write-Host "`nDeployment Summary:" -ForegroundColor Cyan
        psql -h $Host -p $Port -U $Username -d $DatabaseName -c "SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';"
        
        Write-Host "`nNext Steps:" -ForegroundColor Cyan
        Write-Host "1. Update your application connection string" -ForegroundColor White
        Write-Host "2. Run any data migration scripts if needed" -ForegroundColor White
        Write-Host "3. Test the application connectivity" -ForegroundColor White
        
    } else {
        throw "Database deployment failed"
    }

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = $null
}

Write-Host "`nDeployment script completed." -ForegroundColor Green
