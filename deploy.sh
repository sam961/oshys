#!/bin/bash

###############################################################################
# Manual Deployment Script for Bluehost
#
# This script can be run manually on Bluehost to deploy the latest changes
# from the develop branch.
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
###############################################################################

# Configuration
REPO_DIR="/home2/bbgxbgmy/projects/oshys"  # Change to your actual path
BRANCH="main"
LOG_FILE="$REPO_DIR/deployment.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1" >> "$LOG_FILE"
}

# Function to execute commands and log output
execute() {
    log "Executing: $1"
    if eval "$1" >> "$LOG_FILE" 2>&1; then
        log "✓ Success"
        return 0
    else
        log_error "✗ Failed: $1"
        return 1
    fi
}

# Start deployment
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   CMS Project - Deployment Script         ║"
echo "╚════════════════════════════════════════════╝"
echo ""

log "Deployment started"

# Change to repository directory
cd "$REPO_DIR" || {
    log_error "Failed to change to directory: $REPO_DIR"
    exit 1
}

log "Working directory: $(pwd)"

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
log "Current branch: $CURRENT_BRANCH"

# Stash any local changes
log "Stashing local changes (if any)..."
execute "git stash"

# Fetch latest changes
log "Fetching latest changes from origin/$BRANCH..."
execute "git fetch origin $BRANCH" || {
    log_error "Failed to fetch from origin"
    exit 1
}

# Reset to latest commit
log "Resetting to origin/$BRANCH..."
execute "git reset --hard origin/$BRANCH" || {
    log_error "Failed to reset to origin/$BRANCH"
    exit 1
}

# Show latest commit
LATEST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%an)")
log "Latest commit: $LATEST_COMMIT"

# Composer install
log "Installing Composer dependencies..."
execute "composer install --no-dev --optimize-autoloader --no-interaction" || {
    log_warning "Composer install failed, but continuing..."
}

# NPM install and build (DISABLED - No Node.js on shared hosting)
# Frontend assets are built locally and committed to git
# log "Installing Node dependencies..."
# execute "npm ci --quiet" || {
#     log_warning "NPM install failed, but continuing..."
# }

# log "Building frontend assets..."
# execute "npm run build" || {
#     log_error "Frontend build failed"
#     exit 1
# }
log "Skipping NPM build (assets built locally and committed)"

# Laravel optimization
log "Clearing Laravel caches..."
execute "php artisan config:clear"
execute "php artisan cache:clear"
execute "php artisan view:clear"
execute "php artisan route:clear"

log "Caching Laravel configurations..."
execute "php artisan config:cache"
execute "php artisan route:cache"
execute "php artisan view:cache"

# Database migrations (commented out for safety)
# Uncomment the following lines if you want to run migrations automatically
# log "Running database migrations..."
# execute "php artisan migrate --force" || {
#     log_error "Database migration failed"
#     exit 1
# }

# Set proper permissions
log "Setting proper permissions..."
execute "chmod -R 755 storage"
execute "chmod -R 755 bootstrap/cache"

# Clear OPcache if available
if command -v php &> /dev/null; then
    log "Clearing OPcache..."
    php -r "if (function_exists('opcache_reset')) { opcache_reset(); echo 'OPcache cleared'; } else { echo 'OPcache not available'; }"
fi

# Deployment complete
log "✓ Deployment completed successfully!"

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   Deployment Successful!                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Latest commit: $LATEST_COMMIT"
echo ""
echo "Next steps:"
echo "  - Check your website to verify changes"
echo "  - Monitor error logs if needed"
echo "  - View deployment log: tail -f $LOG_FILE"
echo ""
