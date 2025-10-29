<?php
/**
 * Temporary Setup Script for Oshys CMS
 *
 * IMPORTANT: DELETE THIS FILE AFTER USE!
 *
 * Usage: Upload to public_html/oshys/ and visit:
 * https://oshys.quarter8.com/setup.php
 */

// Check if already set up
if (file_exists(__DIR__.'/.setup-complete')) {
    die('<h2>Setup already completed! Delete this file for security.</h2>');
}

echo "<!DOCTYPE html>
<html>
<head>
    <title>Oshys CMS Setup</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h2 { color: #2563eb; }
        .success { color: #059669; padding: 10px; background: #d1fae5; border-radius: 5px; margin: 10px 0; }
        .error { color: #dc2626; padding: 10px; background: #fee2e2; border-radius: 5px; margin: 10px 0; }
        .warning { color: #d97706; padding: 10px; background: #fef3c7; border-radius: 5px; margin: 10px 0; }
        pre { background: #f3f4f6; padding: 15px; border-radius: 5px; overflow-x: auto; }
        .step { margin: 20px 0; padding: 15px; border-left: 4px solid #2563eb; background: #f9fafb; }
    </style>
</head>
<body>
<h1>🚀 Oshys CMS Setup</h1>";

// Check if vendor exists
if (!file_exists(__DIR__.'/vendor/autoload.php')) {
    echo "<div class='error'>";
    echo "<h3>❌ Error: Composer dependencies not installed</h3>";
    echo "<p>The <code>vendor/</code> folder is missing.</p>";
    echo "<h4>To fix this, choose ONE option:</h4>";
    echo "<ol>";
    echo "<li><strong>Use cPanel Terminal:</strong><pre>cd ~/public_html/oshys\ncomposer install --optimize-autoloader --no-dev</pre></li>";
    echo "<li><strong>Upload vendor folder:</strong><br>";
    echo "Run locally on your Mac: <pre>cd ~/Desktop/cms-project\ncomposer install --optimize-autoloader --no-dev</pre>";
    echo "Then upload the generated <code>vendor/</code> folder via FTP</li>";
    echo "</ol>";
    echo "</div></body></html>";
    exit;
}

require __DIR__.'/vendor/autoload.php';

// Check if .env exists
if (!file_exists(__DIR__.'/.env')) {
    echo "<div class='error'>";
    echo "<h3>❌ Error: .env file not found</h3>";
    echo "<p>Please create a <code>.env</code> file by copying <code>.env.example</code></p>";
    echo "<h4>To fix this:</h4>";
    echo "<ol>";
    echo "<li>Go to cPanel File Manager</li>";
    echo "<li>Navigate to public_html/oshys/</li>";
    echo "<li>Copy .env.example → .env</li>";
    echo "<li>Edit .env with your database credentials</li>";
    echo "<li>Refresh this page</li>";
    echo "</ol>";
    echo "</div></body></html>";
    exit;
}

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

    echo "<div class='success'>✓ Laravel application loaded successfully</div>";

    // Check database connection
    echo "<div class='step'>";
    echo "<h3>Step 1: Testing Database Connection</h3>";
    try {
        $pdo = DB::connection()->getPdo();
        $dbName = DB::connection()->getDatabaseName();
        echo "<div class='success'>✓ Connected to database: <strong>$dbName</strong></div>";
    } catch (Exception $e) {
        echo "<div class='error'>";
        echo "<h4>❌ Database connection failed</h4>";
        echo "<p>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<p>Please check your .env file database settings:</p>";
        echo "<pre>DB_CONNECTION=mysql\nDB_HOST=localhost\nDB_DATABASE=quarter8_oshys\nDB_USERNAME=your_username\nDB_PASSWORD=your_password</pre>";
        echo "</div></body></html>";
        exit;
    }
    echo "</div>";

    // Run migrations
    echo "<div class='step'>";
    echo "<h3>Step 2: Running Database Migrations</h3>";
    try {
        ob_start();
        $kernel->call('migrate', ['--force' => true]);
        $output = ob_get_clean();
        echo "<div class='success'>✓ Migrations completed</div>";
        echo "<pre>" . htmlspecialchars($output) . "</pre>";
    } catch (Exception $e) {
        echo "<div class='error'>❌ Migration failed: " . htmlspecialchars($e->getMessage()) . "</div>";
    }
    echo "</div>";

    // Generate APP_KEY if not set
    echo "<div class='step'>";
    echo "<h3>Step 3: Checking Application Key</h3>";
    if (empty(env('APP_KEY'))) {
        echo "<div class='warning'>⚠ APP_KEY not set, generating...</div>";
        try {
            $kernel->call('key:generate', ['--force' => true]);
            echo "<div class='success'>✓ Application key generated</div>";
        } catch (Exception $e) {
            echo "<div class='error'>❌ Failed to generate key: " . htmlspecialchars($e->getMessage()) . "</div>";
        }
    } else {
        echo "<div class='success'>✓ Application key already set</div>";
    }
    echo "</div>";

    // Create storage link
    echo "<div class='step'>";
    echo "<h3>Step 4: Creating Storage Symlink</h3>";
    try {
        if (!file_exists(public_path('storage'))) {
            $kernel->call('storage:link');
            echo "<div class='success'>✓ Storage link created</div>";
        } else {
            echo "<div class='success'>✓ Storage link already exists</div>";
        }
    } catch (Exception $e) {
        echo "<div class='warning'>⚠ Storage link: " . htmlspecialchars($e->getMessage()) . "</div>";
    }
    echo "</div>";

    // Check permissions
    echo "<div class='step'>";
    echo "<h3>Step 5: Checking File Permissions</h3>";
    $storagePath = __DIR__.'/storage';
    $cachePath = __DIR__.'/bootstrap/cache';

    $storageWritable = is_writable($storagePath);
    $cacheWritable = is_writable($cachePath);

    if ($storageWritable) {
        echo "<div class='success'>✓ storage/ is writable</div>";
    } else {
        echo "<div class='error'>❌ storage/ is NOT writable - Please chmod 775 in File Manager</div>";
    }

    if ($cacheWritable) {
        echo "<div class='success'>✓ bootstrap/cache/ is writable</div>";
    } else {
        echo "<div class='error'>❌ bootstrap/cache/ is NOT writable - Please chmod 775 in File Manager</div>";
    }
    echo "</div>";

    // Cache config
    echo "<div class='step'>";
    echo "<h3>Step 6: Optimizing Laravel</h3>";
    try {
        $kernel->call('config:cache');
        echo "<div class='success'>✓ Configuration cached</div>";

        $kernel->call('route:cache');
        echo "<div class='success'>✓ Routes cached</div>";

        $kernel->call('view:cache');
        echo "<div class='success'>✓ Views cached</div>";
    } catch (Exception $e) {
        echo "<div class='error'>❌ Optimization failed: " . htmlspecialchars($e->getMessage()) . "</div>";
    }
    echo "</div>";

    // Mark as complete
    file_put_contents(__DIR__.'/.setup-complete', date('Y-m-d H:i:s'));

    echo "<div class='success'>";
    echo "<h2>🎉 Setup Complete!</h2>";
    echo "<p><strong>IMPORTANT SECURITY STEPS:</strong></p>";
    echo "<ol>";
    echo "<li><strong>DELETE THIS FILE NOW!</strong> (setup.php)</li>";
    echo "<li>Delete .setup-complete file</li>";
    echo "<li>Visit your site: <a href='https://oshys.quarter8.com' target='_blank'>https://oshys.quarter8.com</a></li>";
    echo "</ol>";
    echo "</div>";

    echo "<div class='warning'>";
    echo "<h3>Post-Setup Checklist:</h3>";
    echo "<ul>";
    echo "<li>Verify APP_DEBUG=false in .env</li>";
    echo "<li>Verify APP_ENV=production in .env</li>";
    echo "<li>Set strong database password</li>";
    echo "<li>Test your site functionality</li>";
    echo "</ul>";
    echo "</div>";

} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<h3>❌ Setup Error</h3>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
    echo "</div>";
}

echo "</body></html>";
