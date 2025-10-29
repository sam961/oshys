# Deployment Guide for Bluehost

## Server Details
- Domain: oshys.quarter8.com
- Server Path: public_html/oshys

## Prerequisites on Bluehost

1. PHP 8.2 or higher
2. Composer installed
3. MySQL database (replace SQLite in production)
4. SSH access enabled

## Step 1: Prepare Your Bluehost Server

### 1.1 Create MySQL Database
1. Log into cPanel
2. Go to MySQL Databases
3. Create a new database (e.g., `quarter8_oshys`)
4. Create a database user with a strong password
5. Assign the user to the database with ALL PRIVILEGES
6. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (usually `localhost`)

### 1.2 Verify PHP Version
```bash
php -v
```
Should show PHP 8.2 or higher. If not, contact Bluehost support to enable it.

## Step 2: Upload Files to Bluehost

### Option A: Using File Manager (Easier)
1. Compress your project files locally (exclude node_modules and vendor)
2. Upload the zip file to `public_html/oshys/`
3. Extract it using cPanel File Manager

### Option B: Using FTP/SFTP (Recommended)
1. Use FileZilla or similar FTP client
2. Upload all files to `/public_html/oshys/`
3. **EXCLUDE**: `node_modules/`, `vendor/`, `database/database.sqlite`

### Option C: Using SSH/rsync (Advanced)
```bash
rsync -avz --exclude 'node_modules' --exclude 'vendor' --exclude 'database/database.sqlite' \
  ./ username@yourserver.com:public_html/oshys/
```

## Step 3: Configure Environment

### 3.1 Create Production .env File
SSH into your server:
```bash
ssh username@yourserver.com
cd public_html/oshys
```

Copy and edit the environment file:
```bash
cp .env.production .env
nano .env
```

Update these critical values:
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

## Step 4: Install Dependencies

```bash
cd ~/public_html/oshys
composer install --optimize-autoloader --no-dev
```

## Step 5: Set Permissions

```bash
chmod -R 755 ~/public_html/oshys
chmod -R 775 ~/public_html/oshys/storage
chmod -R 775 ~/public_html/oshys/bootstrap/cache
```

## Step 6: Run Migrations

```bash
php artisan migrate --force
```

If you have seeders to populate initial data:
```bash
php artisan db:seed --force
```

## Step 7: Optimize Laravel

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

## Step 8: Configure Web Server

### 8.1 Create .htaccess in /public_html/oshys/

The Laravel public folder should be the document root. Create this `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### 8.2 Update public/.htaccess (Already included in Laravel)

Ensure `public/.htaccess` has:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

## Step 9: Security Checklist

- [ ] APP_DEBUG=false in production .env
- [ ] Strong APP_KEY generated
- [ ] Database credentials are secure
- [ ] storage/ and bootstrap/cache/ are writable
- [ ] .env file is NOT publicly accessible
- [ ] Composer dependencies installed without dev packages

## Step 10: Test Your Deployment

Visit: https://oshys.quarter8.com

Expected: You should see your application homepage

### Troubleshooting

**500 Internal Server Error:**
```bash
php artisan config:clear
php artisan cache:clear
chmod -R 775 storage bootstrap/cache
```

Check error logs:
```bash
tail -f storage/logs/laravel.log
```

**Database Connection Error:**
- Verify database credentials in .env
- Test connection: `php artisan tinker` then `DB::connection()->getPdo();`

**Assets Not Loading:**
- Ensure `APP_URL` in .env matches your domain
- Run `php artisan config:cache` again

**White Screen:**
- Check PHP error logs in cPanel
- Verify PHP version is 8.2+
- Check file permissions on index.php

## Maintenance Mode

To enable maintenance mode:
```bash
php artisan down --secret="your-secret-token"
```

To access while in maintenance mode:
Visit: https://oshys.quarter8.com/your-secret-token

To disable maintenance mode:
```bash
php artisan up
```

## Updates and Redeployment

When updating the application:

1. Upload changed files via FTP/SSH
2. SSH into server
3. Run:
```bash
cd ~/public_html/oshys
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Queue Workers (Optional)

If you use queues, set up a cron job in cPanel:

```bash
* * * * * cd ~/public_html/oshys && php artisan schedule:run >> /dev/null 2>&1
```

## Backup Strategy

Recommended cron job for daily backups:
```bash
0 2 * * * mysqldump -u username -p'password' quarter8_oshys > ~/backups/db-$(date +\%Y\%m\%d).sql
```
