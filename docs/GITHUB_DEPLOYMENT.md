# Deploy Oshys CMS from GitHub to Bluehost

## Repository
https://github.com/sam961/oshys

## Prerequisites on Bluehost

1. **Create MySQL Database** (via cPanel):
   - Database name: `quarter8_oshys`
   - Database user with strong password
   - Grant ALL PRIVILEGES to the user
   - Note: host, username, password

2. **Verify PHP 8.2+** is available

3. **Enable SSH** (in cPanel → Security → SSH Access)

## Deployment Steps

### Step 1: Connect to Your Server via SSH

```bash
ssh username@yourserver.com
# or
ssh username@quarter8.com
```

### Step 2: Navigate to Your Web Directory

```bash
cd public_html/oshys
```

### Step 3: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/sam961/oshys.git .

# If you get "directory not empty" error:
rm -rf * .[!.]* ..?*  # Clear the directory first
git clone https://github.com/sam961/oshys.git .
```

### Step 4: Install Composer Dependencies

```bash
composer install --optimize-autoloader --no-dev
```

If composer is not installed on Bluehost, install it:
```bash
curl -sS https://getcomposer.org/installer | php
php composer.phar install --optimize-autoloader --no-dev
```

### Step 5: Create Environment File

```bash
# Copy the example
cp .env.example .env

# Edit with your database credentials
nano .env
```

**Update these values in .env:**
```env
APP_NAME="Oshys CMS"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://oshys.quarter8.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=quarter8_oshys
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

SESSION_DOMAIN=.quarter8.com
```

**Generate Application Key:**
```bash
php artisan key:generate
```

### Step 6: Set Correct Permissions

```bash
chmod -R 755 .
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Step 7: Create Storage Symlink

```bash
php artisan storage:link
```

### Step 8: Run Database Migrations

```bash
php artisan migrate --force
```

If you have seeders for initial data:
```bash
php artisan db:seed --force
```

### Step 9: Optimize Laravel for Production

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### Step 10: Configure Web Server

The repository already includes:
- `public/.htaccess` (Laravel's default)
- Built production assets in `public/build/`

If your subdomain points to `public_html/oshys/`, create a root `.htaccess`:

```bash
nano .htaccess
```

Add:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

Save and exit (Ctrl+X, Y, Enter)

### Step 11: Test Your Deployment

Visit: **https://oshys.quarter8.com**

You should see your application running!

## Updating Your Deployment

When you push changes to GitHub, update your server:

```bash
# SSH into server
ssh username@yourserver.com
cd public_html/oshys

# Pull latest changes
git pull origin main

# Update dependencies if needed
composer install --optimize-autoloader --no-dev

# Run any new migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Quick Deployment Script

Create this file on your server for easy updates:

```bash
nano ~/deploy-oshys.sh
```

Add:
```bash
#!/bin/bash
cd ~/public_html/oshys
echo "Pulling latest changes..."
git pull origin main
echo "Installing dependencies..."
composer install --optimize-autoloader --no-dev
echo "Running migrations..."
php artisan migrate --force
echo "Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "Deployment complete!"
```

Make it executable:
```bash
chmod +x ~/deploy-oshys.sh
```

Now you can update with:
```bash
~/deploy-oshys.sh
```

## Troubleshooting

### 500 Internal Server Error

```bash
# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Check permissions
chmod -R 775 storage bootstrap/cache

# Check error logs
tail -50 storage/logs/laravel.log
```

### Database Connection Issues

```bash
# Test connection
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit

# Verify credentials in .env
cat .env | grep DB_
```

### Assets Not Loading

```bash
# Verify APP_URL in .env
cat .env | grep APP_URL

# Rebuild caches
php artisan config:cache
```

### Git Pull Issues

```bash
# If you have local changes
git stash
git pull origin main
git stash pop

# If you want to discard local changes
git reset --hard origin/main
git pull origin main
```

## Setting Up Git Authentication on Server

If you need to authenticate with GitHub on the server:

### Option 1: Personal Access Token (Recommended)

1. Create a token at: https://github.com/settings/tokens
2. Select scopes: `repo`
3. When prompted for password during `git clone`, use the token instead

### Option 2: SSH Key

```bash
# Generate SSH key on server
ssh-keygen -t ed25519 -C "your_email@example.com"

# Display public key
cat ~/.ssh/id_ed25519.pub

# Add this key to GitHub: https://github.com/settings/keys

# Clone using SSH
git clone git@github.com:sam961/oshys.git .
```

## Security Checklist

- [ ] APP_DEBUG=false in production
- [ ] Strong database password
- [ ] APP_KEY is generated and unique
- [ ] File permissions are correct (755 for files, 775 for storage)
- [ ] .env file is NOT publicly accessible
- [ ] SSL certificate is active (https)

## Maintenance Mode

Enable maintenance mode during updates:
```bash
php artisan down --secret="your-secret"
```

Access with: `https://oshys.quarter8.com/your-secret`

Disable:
```bash
php artisan up
```

## Backup Strategy

### Manual Database Backup
```bash
mysqldump -u username -p quarter8_oshys > backup-$(date +%Y%m%d).sql
```

### Automated Daily Backup (Cron Job)

Add to crontab (cPanel → Cron Jobs):
```bash
0 2 * * * mysqldump -u username -p'password' quarter8_oshys > ~/backups/db-$(date +\%Y\%m\%d).sql
```

## Support

For detailed deployment options, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

Repository: https://github.com/sam961/oshys
