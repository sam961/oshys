# Quick Start: Bluehost Auto-Deploy Setup

Follow these steps to set up automatic deployment from GitHub to Bluehost.

## 1. SSH into Bluehost

```bash
ssh your-username@yourdomain.com
```

## 2. Generate and Add SSH Key to GitHub

```bash
# Generate key
cd ~/.ssh
ssh-keygen -t ed25519 -C "your-email@example.com" -f bluehost_github
# Press Enter (no passphrase)

# View the public key
cat ~/.ssh/bluehost_github.pub
```

**Copy the key**, then add it to GitHub:
- Go to: GitHub → Repository → Settings → Deploy Keys
- Click "Add deploy key"
- Paste the key and save

## 3. Configure SSH

```bash
nano ~/.ssh/config
```

Add:
```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/bluehost_github
    IdentitiesOnly yes
```

Test connection:
```bash
ssh -T git@github.com
```

## 4. Clone Repository

```bash
cd ~
git clone -b main git@github.com:yourusername/cms-project.git
cd cms-project
```

## 5. Set Up Laravel

```bash
# Copy and edit .env
cp .env.example .env
nano .env
# Update DB credentials and APP_URL

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Set up Laravel
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permissions
chmod -R 755 storage bootstrap/cache
```

## 6. Update Bluehost Document Root

In cPanel:
- Domains → Your Domain → Document Root
- Change to: `/home/username/cms-project/public`

## 7. Configure deploy.php

Edit `deploy.php` and update:

```php
define('SECRET_TOKEN', 'paste-generated-token-here');
define('REPO_DIR', '/home/username/cms-project');  // Your actual path
```

Generate token:
```bash
php -r "echo bin2hex(random_bytes(32));"
```

Upload `deploy.php` to: `/home/username/cms-project/public/deploy.php`

## 8. Add GitHub Webhook

GitHub Repository → Settings → Webhooks → Add webhook:

- **Payload URL**: `https://yourdomain.com/deploy.php`
- **Content type**: `application/json`
- **Secret**: Same SECRET_TOKEN from deploy.php
- **Events**: Just the push event
- Click "Add webhook"

## 9. Test It!

```bash
# On your local machine
git checkout main
echo "Test" >> README.md
git add .
git commit -m "Test auto-deploy"
git push origin main
```

Wait 30 seconds and check your site!

## Check Deployment Status

View logs on Bluehost:
```bash
cat /home/username/cms-project/public/deployment.log
```

Or check GitHub:
- Repository → Settings → Webhooks → Recent Deliveries

## Common Issues

**Issue**: "Permission denied" on git pull
**Fix**:
```bash
chmod -R 755 /home/username/cms-project
```

**Issue**: Composer/NPM not found
**Fix**: Use full paths:
```bash
which composer
which npm
# Update deploy.php with full paths
```

**Issue**: Database errors
**Fix**: Check .env file has correct Bluehost database credentials

## Manual Deployment Alternative

If webhooks don't work, use the manual script:

```bash
ssh your-username@yourdomain.com
cd ~/cms-project
./deploy.sh
```

That's it! For detailed troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md)
