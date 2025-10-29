# Deploy Oshys CMS to Bluehost via FTP (Mac)

## What You'll Upload

Upload ALL files from this project folder EXCEPT:
- `node_modules/` folder (too large, will install on server)
- `vendor/` folder (too large, will install on server)
- `.git/` folder (version control, not needed)
- `.env` file (will create on server)

Everything else including the `public/build/` assets should be uploaded.

## Step 1: Get Your FTP Credentials from Bluehost

1. Log into your Bluehost cPanel
2. Search for "FTP" or go to **Files → FTP Accounts**
3. You should see your main FTP account or create a new one
4. Note down:
   - **FTP Server**: Usually `ftp.quarter8.com` or `ftp.yourdomain.com`
   - **Username**: Your cPanel username or FTP username
   - **Password**: Your FTP password
   - **Port**: 21 (FTP) or 22 (SFTP if available)

## Step 2: Choose Your FTP Client

### Option A: FileZilla (Recommended - Free)

1. **Download**: https://filezilla-project.org/download.php?type=client
2. Install FileZilla
3. Open FileZilla

**Connect to Bluehost:**
- Host: `ftp.quarter8.com` (or your domain)
- Username: Your FTP username
- Password: Your FTP password
- Port: 21
- Click **Quickconnect**

### Option B: Cyberduck (Mac-Friendly - Free)

1. **Download**: https://cyberduck.io/download/
2. Install Cyberduck
3. Open Cyberduck

**Connect to Bluehost:**
- Click **Open Connection**
- Protocol: FTP or SFTP
- Server: `ftp.quarter8.com`
- Username: Your FTP username
- Password: Your FTP password
- Click **Connect**

### Option C: Built-in Mac Finder (Simple)

1. Open **Finder**
2. Press `Cmd + K`
3. Enter: `ftp://username@ftp.quarter8.com`
4. Click **Connect**
5. Enter password when prompted

**Note**: Finder FTP is read-only. Use for viewing, not uploading.

## Step 3: Navigate to Your Upload Directory

In your FTP client, navigate to:
```
/public_html/oshys/
```

Make sure this folder is **empty** before uploading.

## Step 4: Upload Files via FTP

### Using FileZilla:

**Left pane** = Your local computer
**Right pane** = Bluehost server

1. **Left pane**: Navigate to `/Users/salamelkadri/Desktop/cms-project`
2. **Right pane**: Navigate to `/public_html/oshys/`
3. **Select files to upload**:
   - Press `Cmd + A` to select all
   - Deselect (Cmd + Click):
     - `node_modules` folder
     - `vendor` folder
     - `.git` folder
     - `.env` file
4. **Drag files** from left pane to right pane
5. Click **OK** when FileZilla asks to confirm

**Upload will take 5-15 minutes** depending on your internet speed.

### Using Cyberduck:

1. Navigate to `/public_html/oshys/` on server
2. Open a new Finder window to your project folder
3. Select all files EXCEPT:
   - `node_modules`
   - `vendor`
   - `.git`
   - `.env`
4. Drag files into Cyberduck window
5. Wait for upload to complete

## Step 5: What to Do After Upload

Since you can't SSH, you'll need to use **cPanel Terminal** or **PHP scripts** to complete setup.

### Method 1: Use cPanel Terminal (Recommended)

1. Log into Bluehost cPanel
2. Search for "Terminal" under **Advanced**
3. Click **Terminal**
4. Run these commands:

```bash
cd public_html/oshys

# Install Composer dependencies
composer install --optimize-autoloader --no-dev

# If composer command not found, use:
php /usr/local/bin/composer install --optimize-autoloader --no-dev

# Create environment file
cp .env.example .env

# Now you need to edit .env with your database credentials
# Use nano or file manager
nano .env
```

Press `Ctrl + X`, then `Y`, then `Enter` to save.

Continue with:
```bash
# Generate app key
php artisan key:generate

# Set permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Run migrations
php artisan migrate --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Method 2: Use cPanel File Manager (If Terminal Doesn't Work)

1. Go to cPanel → **File Manager**
2. Navigate to `public_html/oshys/`
3. Find `.env.example`
4. Right-click → Copy → Name it `.env`
5. Right-click `.env` → Edit
6. Update these values:

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

7. Save the file

**Then use the automated setup script:**

Upload the `scripts/setup.php` file from your project to `public_html/oshys/`

Or create a new file `setup.php` in `public_html/oshys/` with this content:

```php
<?php
// Temporary setup script - DELETE AFTER USE

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<h2>Running Setup Commands...</h2>";

// Run migrations
echo "<p>Running migrations...</p>";
$kernel->call('migrate', ['--force' => true]);

// Cache config
echo "<p>Caching config...</p>";
$kernel->call('config:cache');

// Cache routes
echo "<p>Caching routes...</p>";
$kernel->call('route:cache');

// Cache views
echo "<p>Caching views...</p>";
$kernel->call('view:cache');

echo "<h3>Setup Complete! Delete this file now.</h3>";
```

Visit: `https://oshys.quarter8.com/setup.php`

**IMPORTANT**: Delete `setup.php` after running it!

## Step 6: Install Composer Dependencies

If you can't use Terminal, you'll need to ask Bluehost support to run:
```bash
cd public_html/oshys && composer install --optimize-autoloader --no-dev
```

Or install `vendor` folder locally and upload it via FTP (will take longer):

```bash
# On your Mac:
cd ~/Desktop/cms-project
composer install --optimize-autoloader --no-dev

# Then upload the vendor/ folder via FTP
```

## Step 7: Create MySQL Database

1. Log into cPanel
2. Go to **MySQL Databases**
3. Create new database: `quarter8_oshys`
4. Create user with strong password
5. Add user to database with ALL PRIVILEGES
6. Note: database name, username, password

## Step 8: Set File Permissions

In cPanel File Manager:

1. Navigate to `public_html/oshys/storage`
2. Right-click → Change Permissions → Set to `775`
3. Check "Recurse into subdirectories"
4. Click OK

Repeat for `public_html/oshys/bootstrap/cache`

## Step 9: Test Your Site

Visit: **https://oshys.quarter8.com**

## Troubleshooting

### "500 Internal Server Error"

Check `.htaccess` files exist:
- `public_html/oshys/public/.htaccess` ✓
- Create `public_html/oshys/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### "Composer not found"

Upload vendor folder from your Mac:
1. Run `composer install --optimize-autoloader --no-dev` locally
2. Upload the generated `vendor/` folder via FTP (20-30 mins)

### "Permission denied" errors

Use cPanel File Manager:
- Select `storage` folder → Change Permissions → 775 (recursive)
- Select `bootstrap/cache` → Change Permissions → 775 (recursive)

### Assets not loading

1. Verify `public/build/` folder was uploaded
2. Check `APP_URL` in `.env` matches your domain
3. Clear browser cache

## FTP Client Tips

### Speed Up Uploads:
- **FileZilla**: Edit → Settings → Transfers → Maximum simultaneous transfers: 5
- **Cyberduck**: Preferences → Transfers → Concurrent transfers: 5

### Resume Interrupted Uploads:
- Both FileZilla and Cyberduck can resume interrupted transfers
- Just reconnect and upload again - they'll skip completed files

### Monitor Progress:
- Watch the transfer queue at the bottom of FileZilla
- Check the Transfers window in Cyberduck

## Quick Checklist

- [ ] FTP client installed and connected
- [ ] Navigated to `public_html/oshys/`
- [ ] Uploaded all files except node_modules, vendor, .git, .env
- [ ] Created MySQL database in cPanel
- [ ] Created `.env` file with database credentials
- [ ] Ran composer install (via Terminal or uploaded vendor/)
- [ ] Set permissions on storage and bootstrap/cache (775)
- [ ] Ran migrations
- [ ] Visited https://oshys.quarter8.com

## Need Help?

- FileZilla docs: https://wiki.filezilla-project.org/
- Cyberduck docs: https://docs.cyberduck.io/
- Bluehost support: Live chat in cPanel

## Alternative: Use GitHub on Server

If you can get SSH access later, you can switch to GitHub deployment:
See [GITHUB_DEPLOYMENT.md](GITHUB_DEPLOYMENT.md)
