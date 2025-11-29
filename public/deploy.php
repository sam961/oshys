<?php
/**
 * GitHub Webhook Deployment Script for Bluehost
 *
 * This script automatically deploys your Laravel application when you push to the develop branch.
 *
 * Setup Instructions:
 * 1. Upload this file to your Bluehost public_html directory (or subdomain directory)
 * 2. Set up GitHub webhook pointing to: https://yourdomain.com/deploy.php
 * 3. Add DEPLOY_SECRET, DEPLOY_REPO_DIR, and DEPLOY_BRANCH to your .env file
 * 4. Set up SSH keys on Bluehost for GitHub access
 */

/**
 * Load environment variables from .env file
 */
function loadEnv($path) {
    if (!file_exists($path)) {
        return [];
    }
    
    $env = [];
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        
        // Parse KEY=value
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^["\'](.*)["\']\s*$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            $env[$key] = $value;
        }
    }
    
    return $env;
}

// Load .env from Laravel root (parent of public directory)
$env = loadEnv(__DIR__ . '/../.env');

// Configuration - loaded from .env file
define('SECRET_TOKEN', $env['DEPLOY_SECRET'] ?? '');
define('REPO_DIR', $env['DEPLOY_REPO_DIR'] ?? '/home2/bbgxbgmy/projects/oshys');
define('BRANCH', $env['DEPLOY_BRANCH'] ?? 'main');
define('LOG_FILE', __DIR__ . '/deployment.log');

// Get the webhook payload
$payload = file_get_contents('php://input');
$signature = isset($_SERVER['HTTP_X_HUB_SIGNATURE_256']) ? $_SERVER['HTTP_X_HUB_SIGNATURE_256'] : '';

// Verify the webhook signature
if (!verifySignature($payload, $signature)) {
    http_response_code(403);
    logMessage('ERROR: Invalid signature');
    die('Invalid signature');
}

// Parse the payload
$data = json_decode($payload, true);

// Check if this is a push to the main branch
if (!isset($data['ref']) || $data['ref'] !== 'refs/heads/' . BRANCH) {
    logMessage('INFO: Ignoring push to ' . ($data['ref'] ?? 'unknown branch'));
    echo json_encode(['status' => 'ignored', 'message' => 'Not the main branch']);
    exit;
}

// Log the deployment start
logMessage('INFO: Deployment started by ' . ($data['pusher']['name'] ?? 'unknown'));
logMessage('INFO: Commit: ' . ($data['head_commit']['message'] ?? 'No message'));

// Execute deployment
try {
    // Change to repository directory
    chdir(REPO_DIR);

    // Run deployment commands
    $commands = [
        // Git pull
        'git fetch origin ' . BRANCH . ' 2>&1',
        'git reset --hard origin/' . BRANCH . ' 2>&1',

        // Composer install (production optimized)
        'composer install --no-dev --optimize-autoloader 2>&1',

        // Clear and optimize Laravel caches
        'php artisan config:clear 2>&1',
        'php artisan cache:clear 2>&1',
        'php artisan view:clear 2>&1',
        'php artisan route:clear 2>&1',
        'php artisan config:cache 2>&1',
        'php artisan route:cache 2>&1',
        'php artisan view:cache 2>&1',

        // Run database migrations (be careful with this in production!)
        // 'php artisan migrate --force 2>&1',

        // Build frontend assets (DISABLED - No Node.js on shared hosting)
        // Frontend assets are built locally and committed to git
        // 'npm ci 2>&1',
        // 'npm run build 2>&1',

        // Set proper permissions
        'chmod -R 755 storage 2>&1',
        'chmod -R 755 bootstrap/cache 2>&1',
    ];

    $output = [];
    foreach ($commands as $command) {
        logMessage("EXECUTING: $command");
        exec($command, $cmdOutput, $returnVar);

        $output[] = [
            'command' => $command,
            'output' => $cmdOutput,
            'status' => $returnVar
        ];

        logMessage("OUTPUT: " . implode("\n", $cmdOutput));

        if ($returnVar !== 0) {
            logMessage("WARNING: Command failed with status $returnVar");
        }
    }

    logMessage('SUCCESS: Deployment completed successfully');

    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment completed',
        'details' => $output
    ]);

} catch (Exception $e) {
    logMessage('ERROR: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

/**
 * Verify GitHub webhook signature
 */
function verifySignature($payload, $signature) {
    if (empty($signature)) {
        return false;
    }

    $hash = 'sha256=' . hash_hmac('sha256', $payload, SECRET_TOKEN);
    return hash_equals($hash, $signature);
}

/**
 * Log deployment messages
 */
function logMessage($message) {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message\n";
    file_put_contents(LOG_FILE, $logEntry, FILE_APPEND);
}
