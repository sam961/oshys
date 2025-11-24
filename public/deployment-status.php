<?php
/**
 * Deployment Status Checker
 * Access at: https://yoursite.com/deployment-status.php
 *
 * Security: Add password protection in production!
 */

// Simple password protection (change this!)
$password = 'your-secret-password';
if (!isset($_GET['key']) || $_GET['key'] !== $password) {
    http_response_code(403);
    die('Access denied. Add ?key=your-secret-password to URL');
}

$logFile = __DIR__ . '/deployment.log';
$repoDir = '/home2/bbgxbgmy/public_html/oshys';

?>
<!DOCTYPE html>
<html>
<head>
    <title>Deployment Status</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1a1a2e;
            color: #eee;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 {
            color: #16213e;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .status-card {
            background: #16213e;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .status-card h2 {
            color: #667eea;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .log-entry {
            background: #0f0f1e;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            white-space: pre-wrap;
            word-wrap: break-word;
            border-left: 3px solid #667eea;
        }
        .log-entry.error { border-left-color: #e74c3c; }
        .log-entry.success { border-left-color: #2ecc71; }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: #0f0f1e;
            margin: 5px 0;
            border-radius: 5px;
        }
        .info-label { color: #888; }
        .info-value { color: #fff; font-weight: bold; }
        .btn {
            display: inline-block;
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px 10px 0;
            transition: transform 0.2s;
        }
        .btn:hover { transform: translateY(-2px); }
        .success { color: #2ecc71; }
        .error { color: #e74c3c; }
        .warning { color: #f39c12; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Deployment Status Monitor</h1>

        <!-- Current Status -->
        <div class="status-card">
            <h2>📊 Current Status</h2>
            <?php
            if (file_exists($logFile)) {
                $lastModified = filemtime($logFile);
                $fileSize = filesize($logFile);
                $timeSince = time() - $lastModified;

                echo '<div class="info-row">';
                echo '<span class="info-label">Last Deployment:</span>';
                echo '<span class="info-value">' . date('Y-m-d H:i:s', $lastModified) . ' (' . round($timeSince / 60) . ' minutes ago)</span>';
                echo '</div>';

                echo '<div class="info-row">';
                echo '<span class="info-label">Log File Size:</span>';
                echo '<span class="info-value">' . round($fileSize / 1024, 2) . ' KB</span>';
                echo '</div>';
            } else {
                echo '<div class="error">Log file not found. No deployments yet.</div>';
            }
            ?>
        </div>

        <!-- Git Status -->
        <div class="status-card">
            <h2>🔧 Git Status</h2>
            <?php
            if (is_dir($repoDir)) {
                chdir($repoDir);

                // Current branch
                $branch = trim(shell_exec('git rev-parse --abbrev-ref HEAD 2>&1'));
                echo '<div class="info-row">';
                echo '<span class="info-label">Current Branch:</span>';
                echo '<span class="info-value">' . htmlspecialchars($branch) . '</span>';
                echo '</div>';

                // Latest commit
                $commit = trim(shell_exec('git log -1 --pretty=format:"%h - %s (%an, %ar)" 2>&1'));
                echo '<div class="info-row">';
                echo '<span class="info-label">Latest Commit:</span>';
                echo '<span class="info-value">' . htmlspecialchars($commit) . '</span>';
                echo '</div>';

                // Check for uncommitted changes
                $status = shell_exec('git status --porcelain 2>&1');
                if (empty(trim($status))) {
                    echo '<div class="success">✓ Working directory is clean</div>';
                } else {
                    echo '<div class="warning">⚠ Uncommitted changes detected</div>';
                }
            }
            ?>
        </div>

        <!-- Recent Deployments -->
        <div class="status-card">
            <h2>📝 Recent Deployment Log (Last 20 entries)</h2>
            <a href="?key=<?= $_GET['key'] ?>&download=1" class="btn">⬇ Download Full Log</a>
            <a href="?key=<?= $_GET['key'] ?>" class="btn">🔄 Refresh</a>

            <?php
            if (isset($_GET['download'])) {
                header('Content-Type: text/plain');
                header('Content-Disposition: attachment; filename="deployment-' . date('Y-m-d-His') . '.log"');
                readfile($logFile);
                exit;
            }

            if (file_exists($logFile)) {
                $lines = file($logFile);
                $recent = array_slice(array_reverse($lines), 0, 20);

                foreach ($recent as $line) {
                    $class = '';
                    if (stripos($line, 'ERROR') !== false) {
                        $class = 'error';
                    } elseif (stripos($line, 'SUCCESS') !== false) {
                        $class = 'success';
                    }

                    echo '<div class="log-entry ' . $class . '">' . htmlspecialchars($line) . '</div>';
                }
            } else {
                echo '<div class="error">No deployment log found.</div>';
            }
            ?>
        </div>

        <!-- Server Info -->
        <div class="status-card">
            <h2>💻 Server Info</h2>
            <div class="info-row">
                <span class="info-label">PHP Version:</span>
                <span class="info-value"><?= PHP_VERSION ?></span>
            </div>
            <div class="info-row">
                <span class="info-label">Server Time:</span>
                <span class="info-value"><?= date('Y-m-d H:i:s') ?></span>
            </div>
        </div>
    </div>
</body>
</html>
