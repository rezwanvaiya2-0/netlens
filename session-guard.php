<?php
/**
 * session-guard.php — 1-hour auto-logout for the NfSen Web UI.
 *
 * Runs before EVERY PHP page (configured via php_admin_value
 * auto_prepend_file in config/000-default.conf). Together with the Apache
 * login session it gives this behavior:
 *
 *   1. Closing the browser logs you out   — the Apache session cookie
 *      (nfsen_session) is a SESSION cookie (no Max-Age), so the browser
 *      deletes it on close and the next visit shows the login page.
 *   2. 1 hour of inactivity logs you out  — this file tracks the last
 *      activity time in a cookie and, if more than NFSEN_LOGIN_MAX_AGE
 *      seconds have passed, clears the session cookie and sends the user
 *      back to the login page.
 *   3. Staying on the login page never logs you out — this guard skips
 *      login.php, and there is nothing to expire while you are not logged in.
 *
 * The guard can only FORCE an earlier logout; it can never keep a session
 * alive by itself (the Apache session cookie remains the source of truth).
 */

// 1 hour (3600 seconds). Change this value to adjust the auto-logout time.
define('NFSEN_LOGIN_MAX_AGE', 3600);

// The login page is the logged-out state — nothing to expire there.
if (basename($_SERVER['SCRIPT_NAME'] ?? '') === 'login.php') {
    return;
}

$now = time();
$last_seen = isset($_COOKIE['nfsen_login_time']) ? (int)$_COOKIE['nfsen_login_time'] : 0;

if ($last_seen > 0 && ($now - $last_seen) > NFSEN_LOGIN_MAX_AGE) {
    // Inactive for over an hour: drop the Apache session cookie + our timer
    // and bounce to the login page (shows the "session expired" message).
    setcookie('nfsen_session', '', ['expires' => $now - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    setcookie('nfsen_login_time', '', ['expires' => $now - 3600, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
    header('Location: /login.php?expired=1');
    exit;
}

// Active use: refresh the sliding 1-hour timer. HttpOnly + SameSite=Lax so
// the timer cookie is not readable by JavaScript and is not sent on
// cross-site requests.
setcookie('nfsen_login_time', (string)$now, [
    'expires' => 0,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);
