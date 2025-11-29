# Bluehost Deployment Setup Guide

This guide will help you set up automatic deployment from GitHub to Bluehost. When you push to the `main` branch, your site will automatically update.

## Prerequisites

- Bluehost hosting account with SSH access
- GitHub repository with your code
- Your local mainment environment

## Step 1: Enable SSH Access on Bluehost

1. Log in to your Bluehost cPanel
2. Go to **Security** → **SSH Access**
3. Click **Manage SSH Keys**
4. Enable SSH access if not already enabled

## Step 2: Set Up SSH Keys for GitHub Access

### 2.1 Connect to Bluehost via SSH

From your terminal:

```bash
ssh username@yourdomain.com
# Replace 'username' with your Bluehost username
# Replace 'yourdomain.com' with your domain
```

### 2.2 Generate SSH Key on Bluehost

```bash
cd ~/.ssh
ssh-keygen -t ed25519 -C "your-email@example.com" -f bluehost_github
# Press Enter for no passphrase (required for automated deployments)
```

### 2.3 Add SSH Key to GitHub

```bash
cat ~/.ssh/bluehost_github.pub
```

Copy the output, then:

1. Go to GitHub → Your Repository → **Settings** → **Deploy Keys**
2. Click **Add deploy key**
3. Title: "Bluehost Deploy Key"
4. Paste the key
5. Check **Allow write access** (optional, only if you need push access)
6. Click **Add key**

### 2.4 Configure SSH to Use the Key

Create or edit `~/.ssh/config`:

```bash
nano ~/.ssh/config
```

Add the following:

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/bluehost_github
    IdentitiesOnly yes
```

Save and exit (Ctrl+X, then Y, then Enter)

### 2.5 Test the Connection

```bash
ssh -T git@github.com
# You should see: "Hi username! You've successfully authenticated..."
```

## Step 3: Clone Your Repository on Bluehost

```bash
cd ~
git clone -b main git@github.com:yourusername/cms-project.git
cd cms-project
```

## Step 4: Set Up Laravel Environment

### 4.1 Create .env File

```bash
cp .env.example .env
nano .env
```

Update the following values:

```env
APP_NAME="Oshys CMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Add other production settings
```

### 4.2 Install Dependencies

```bash
# Install Composer dependencies
composer install --no-dev --optimize-autoloader

# Install Node dependencies and build assets
npm ci
npm run build

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Run seeders (if needed)
php artisan db:seed --force

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

## Step 5: Configure Bluehost Document Root

1. In cPanel, go to **Domains** → **Domains**
2. Click on your domain
3. Change **Document Root** to: `/home/username/cms-project/public`
4. Save changes

## Step 6: Upload Deployment Script

### 6.1 Upload deploy.php to Your Web Root

Upload the `deploy.php` file from your project to:
- `/home/username/public_html/deploy.php` (if main domain)
- OR `/home/username/cms-project/public/deploy.php` (recommended)

### 6.2 Add Deployment Configuration to .env

Add these variables to your `.env` file:

```env
# Deployment Configuration
DEPLOY_SECRET=your-github-webhook-secret-here
DEPLOY_REPO_DIR=/home/username/cms-project
DEPLOY_BRANCH=main
DEPLOY_STATUS_PASSWORD=your-status-page-password
```

To generate secure tokens:

```bash
# Generate webhook secret
php -r "echo bin2hex(random_bytes(32));"

# Generate status password
php -r "echo bin2hex(random_bytes(16));"
```

### 6.3 Set Permissions

```bash
chmod 755 /home/username/cms-project/public/deploy.php
```

## Step 7: Configure GitHub Webhook

1. Go to your GitHub repository
2. Navigate to **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `https://yourdomain.com/deploy.php`
   - **Content type**: `application/json`
   - **Secret**: Enter the same SECRET_TOKEN you used in deploy.php
   - **Which events**: Select "Just the push event"
   - **Active**: ✓ Check this
4. Click **Add webhook**

## Step 8: Test the Deployment

### 8.1 Make a Test Commit

On your local machine:

```bash
git checkout main
echo "# Test deployment" >> README.md
git add README.md
git commit -m "Test automatic deployment"
git push origin main
```

### 8.2 Check Deployment Status

1. Go to GitHub → Your Repository → **Settings** → **Webhooks**
2. Click on your webhook
3. Scroll down to **Recent Deliveries**
4. You should see a successful delivery (green checkmark)

### 8.3 Check Deployment Logs

On Bluehost:

```bash
cat /home/username/cms-project/public/deployment.log
```

## Deployment Workflow

Once set up, your workflow is:

```bash
# 1. Make changes locally
git checkout main
# ... make your changes ...

# 2. Commit and push
git add .
git commit -m "Your changes"
git push origin main

# 3. Wait ~30 seconds for automatic deployment
# 4. Check your site!
```

## Troubleshooting

### Issue: Webhook shows "Connection timeout"

**Solution**: Make sure deploy.php is accessible:
```bash
curl https://yourdomain.com/deploy.php
```

### Issue: "Permission denied" errors

**Solution**: Set proper permissions:
```bash
chmod -R 755 storage bootstrap/cache
chown -R username:username /home/username/cms-project
```

### Issue: "composer: command not found"

**Solution**: Use full path to composer:
```bash
/usr/local/bin/composer install --no-dev --optimize-autoloader
```

Or check where composer is installed:
```bash
which composer
```

### Issue: "npm: command not found"

**Solution**: Install Node.js on Bluehost or use Bluehost's Node version:
```bash
# Check available Node versions
ls /usr/local/bin/ | grep node

# Or install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
```

### Issue: Deployment log shows errors

**Solution**: Check the deployment log:
```bash
tail -f /home/username/cms-project/public/deployment.log
```

### Issue: Database connection fails

**Solution**: Make sure your .env has correct database credentials from Bluehost cPanel → MySQL Databases

## Important Notes

- **Always test on main branch first** before deploying to production
- Keep your `.env` file secure and never commit it to Git
- The deployment script runs migrations automatically (commented out by default for safety)
- Monitor the first few deployments to ensure everything works correctly
- Set up database backups in Bluehost cPanel before running migrations

## Security Best Practices

1. Use a strong SECRET_TOKEN
2. Keep deployment logs secure
3. Don't expose deploy.php publicly (use .htaccess if needed)
4. Use environment variables for sensitive data
5. Keep Laravel in production mode (APP_DEBUG=false)

## Alternative: Manual Deployment

If automatic deployment doesn't work, you can deploy manually:

```bash
ssh username@yourdomain.com
cd ~/cms-project
git pull origin main
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Support

If you encounter issues:
1. Check deployment.log for errors
2. Verify GitHub webhook delivery status
3. Test SSH connection to GitHub
4. Contact Bluehost support for server-specific issues
