@echo off
echo HealthTime Database Quick Deployment
echo ====================================

REM Set your database connection details here
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=healthtime
set DB_USER=postgres

echo.
echo WARNING: This will drop and recreate all tables!
echo Database: %DB_NAME%
echo Host: %DB_HOST%
echo User: %DB_USER%
echo.

pause

echo Deploying database schema...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f sql/step_by_step_deploy.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Database deployment completed successfully!
    echo.
    echo Table count:
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';"
) else (
    echo.
    echo ✗ Database deployment failed!
    echo Check the error messages above.
)

echo.
pause
