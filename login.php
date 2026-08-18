<?php
/**
 * NfSen login page — served by Apache mod_auth_form (form auth).
 *
 * Apache is configured (config/000-default.conf) to require a valid login for
 * every request under /var/nfsen/www. Unauthenticated requests receive an
 * HTTP 401 whose response body is this page (the "inline login" pattern):
 * the form below POSTs back to /nfsen.php, where mod_auth_form validates the
 * credentials against /var/nfsen/etc/.htpasswd and sets a session cookie.
 *
 * The login cookie is a browser-session cookie (dies when the browser
 * closes), and session-guard.php auto-logs you out after 1 hour of inactivity.
 *
 * Because this page is rendered as the 401 response, a POST request that
 * lands here means the previous login attempt was rejected (mod_auth_form
 * consumes the POST body before this page renders, so we detect the attempt
 * by the preserved request method rather than by form fields). A POST can
 * also arrive when a session expired mid-use, so the message below covers
 * both cases.
 */
$login_failed = (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'POST') || isset($_GET['error']);
$logged_out   = isset($_GET['loggedout']);
$expired      = isset($_GET['expired']);
?><!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Sign in · NfSen NetFlow Analyzer</title>
<style>
  :root{
    --bg:#070b18;
    --card:rgba(255,255,255,.045);
    --line:rgba(255,255,255,.09);
    --text:#e8edf7;
    --muted:#93a0b8;
    --faint:#5d6b85;
    --accent:#22d3ee;
    --accent2:#6366f1;
    --danger:#f87171;
    --ok:#34d399;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%}
  body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    background:
      radial-gradient(1000px 600px at 15% -10%, rgba(34,211,238,.14), transparent 60%),
      radial-gradient(900px 600px at 110% 110%, rgba(99,102,241,.18), transparent 60%),
      var(--bg);
    color:var(--text);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:100vh;padding:24px;position:relative;overflow:hidden;
  }
  /* subtle network grid */
  body::before{
    content:"";position:absolute;inset:0;pointer-events:none;
    background-image:
      linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size:44px 44px;
    -webkit-mask-image:radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%);
            mask-image:radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%);
  }
  .card{
    position:relative;z-index:1;width:100%;max-width:400px;
    background:var(--card);border:1px solid var(--line);border-radius:18px;
    padding:34px 32px 26px;
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    box-shadow:0 24px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05);
    animation:rise .5s cubic-bezier(.2,.8,.3,1);
  }
  @keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .brand{display:flex;flex-direction:column;align-items:center;gap:13px}
  .logo-chip{
    background:#fff;border-radius:10px;padding:11px 20px;
    box-shadow:0 12px 30px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.6);
    display:flex;align-items:center;justify-content:center;
  }
  .logo-chip svg{display:block;height:30px;width:30px;color:var(--accent2)}
  .brand-sub{font-size:13px;color:var(--muted);letter-spacing:.3px}
  .sub{color:var(--muted);font-size:14px;line-height:1.55;margin:18px 0 20px;text-align:center}
  .banner{
    display:flex;gap:10px;align-items:flex-start;
    padding:11px 13px;border-radius:10px;font-size:13.5px;line-height:1.45;margin-bottom:18px;
  }
  .banner.error{background:rgba(248,113,113,.10);border:1px solid rgba(248,113,113,.28);color:#fecaca}
  .banner.ok{background:rgba(52,211,153,.10);border:1px solid rgba(52,211,153,.28);color:#a7f3d0}
  .banner.info{background:rgba(34,211,238,.10);border:1px solid rgba(34,211,238,.28);color:#a5f3fc}
  .banner svg{flex:none;margin-top:1px}
  form{display:grid;gap:16px}
  .field label{
    display:block;font-size:12.5px;font-weight:600;letter-spacing:.5px;
    text-transform:uppercase;color:var(--muted);margin-bottom:7px;
  }
  .input-wrap{position:relative}
  .input-wrap > svg{
    position:absolute;left:13px;top:50%;transform:translateY(-50%);
    width:17px;height:17px;color:var(--muted);pointer-events:none;
  }
  input[type=text],input[type=password]{
    width:100%;padding:12px 42px 12px 40px;
    background:rgba(255,255,255,.05);
    border:1px solid var(--line);border-radius:10px;
    color:var(--text);font-size:15px;outline:none;
    transition:border-color .18s, box-shadow .18s, background .18s;
  }
  input::placeholder{color:var(--faint)}
  input:focus{
    border-color:var(--accent);
    box-shadow:0 0 0 3px rgba(34,211,238,.18);
    background:rgba(255,255,255,.07);
  }
  .toggle{
    position:absolute;right:10px;top:50%;transform:translateY(-50%);
    background:none;border:none;color:var(--muted);cursor:pointer;
    padding:6px;border-radius:8px;display:flex;
  }
  .toggle:hover{color:var(--text);background:rgba(255,255,255,.06)}
  .toggle svg{width:18px;height:18px}
  button[type=submit]{
    margin-top:4px;padding:13px;border:none;border-radius:10px;
    font-size:15px;font-weight:700;letter-spacing:.4px;color:#04121a;cursor:pointer;
    background:linear-gradient(135deg,var(--accent),#67e8f9);
    box-shadow:0 10px 26px rgba(34,211,238,.30);
    transition:transform .15s, box-shadow .15s, filter .15s;
  }
  button[type=submit]:hover{transform:translateY(-1px);filter:brightness(1.05);box-shadow:0 14px 32px rgba(34,211,238,.4)}
  button[type=submit]:active{transform:translateY(0)}
  button[type=submit]:disabled{opacity:.6;cursor:wait;transform:none}
  .card-hint{margin-top:18px;text-align:center;font-size:12.5px;color:var(--faint);line-height:1.6}

  /* ===================== loading overlay (shown while login takes time) ===================== */
  .loading-overlay{
    position:fixed;inset:0;z-index:50;
    display:flex;align-items:center;justify-content:center;
    background:rgba(4,7,15,.78);
    backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    opacity:0;visibility:hidden;
    transition:opacity .3s ease, visibility .3s ease;
  }
  .loading-overlay.show{opacity:1;visibility:visible}
  .loading-card{
    display:flex;flex-direction:column;align-items:center;gap:18px;
    background:var(--card);border:1px solid var(--line);border-radius:16px;
    padding:32px 46px;
    box-shadow:0 24px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05);
    animation:rise .35s cubic-bezier(.2,.8,.3,1);
  }
  .spinner{
    position:relative;width:48px;height:48px;border-radius:50%;
    border:4px solid rgba(34,211,238,.15);
    border-top-color:var(--accent);border-right-color:var(--accent2);
    animation:spin .8s cubic-bezier(.6,.2,.4,.8) infinite;
  }
  .spinner::after{
    content:"";position:absolute;inset:-14px;border-radius:50%;
    border:1px solid rgba(34,211,238,.18);
    animation:pulse 1.6s ease-out infinite;
  }
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{
    0%{transform:scale(.8);opacity:.9}
    70%{transform:scale(1.25);opacity:0}
    100%{opacity:0}
  }
  .loading-text{
    display:flex;align-items:baseline;gap:7px;
    font-size:15px;font-weight:600;color:var(--text);letter-spacing:.3px;
  }
  .loading-text .dots{display:inline-flex;gap:4px}
  .loading-text .dots span{
    width:5px;height:5px;border-radius:50%;background:var(--accent);
    animation:blink 1.2s infinite ease-in-out;
  }
  .loading-text .dots span:nth-child(2){animation-delay:.15s}
  .loading-text .dots span:nth-child(3){animation-delay:.3s}
  @keyframes blink{
    0%,60%,100%{opacity:.25;transform:translateY(0)}
    30%{opacity:1;transform:translateY(-3px)}
  }
  .loading-card small{font-size:12.5px;color:var(--muted);text-align:center;line-height:1.5}
</style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <div class="logo-chip">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="12" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="19" cy="19" r="3"/><line x1="7.5" y1="10.5" x2="16.5" y2="6"/><line x1="7.5" y1="13.5" x2="16.5" y2="17.5"/></svg>
      </div>
      <p class="brand-sub">NfSen NetFlow Analyzer · Protected sign-in</p>
    </div>
    <p class="sub">Sign in to view your network flow data. Your session ends when you close the browser, or after 1 hour of inactivity.</p>

    <?php if ($logged_out): ?>
      <div class="banner ok">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <span>You have been signed out.</span>
      </div>
    <?php endif; ?>

    <?php if ($expired): ?>
      <div class="banner info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Your session has expired after 1 hour of inactivity. Please sign in again.</span>
      </div>
    <?php endif; ?>

    <?php if ($login_failed): ?>
      <div class="banner error">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Invalid username or password, or your session has expired. Please sign in again.</span>
      </div>
    <?php endif; ?>

    <form method="POST" action="/nfsen.php" autocomplete="off">
      <div class="field">
        <label for="httpd_username">Username</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <input type="text" id="httpd_username" name="httpd_username" placeholder="admin" autocomplete="username" autofocus required>
        </div>
      </div>
      <div class="field">
        <label for="httpd_password">Password</label>
        <div class="input-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="httpd_password" name="httpd_password" placeholder="••••••••" autocomplete="current-password" required>
          <button type="button" class="toggle" id="togglePass" aria-label="Show password">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
      <button type="submit" id="submitBtn">Sign in</button>
    </form>

    <p class="card-hint">Forgot your password? Ask the server administrator to reset it.</p>
  </div>

  <!-- Loading overlay: fades in the moment the form is submitted and stays
       until the server responds (success redirect or 401 login-page reload). -->
  <div class="loading-overlay" id="loadingOverlay" aria-hidden="true">
    <div class="loading-card" role="status" aria-live="polite">
      <div class="spinner"></div>
      <p class="loading-text">Loading data<span class="dots"><span></span><span></span><span></span></span></p>
      <small>Verifying your credentials and preparing your NetFlow dashboard — this can take a moment.</small>
    </div>
  </div>

<script>
(function(){
  var pass = document.getElementById('httpd_password');
  var btn  = document.getElementById('togglePass');
  var eyeOpen   = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  var eyeClosed = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  btn.addEventListener('click', function(){
    var showing = pass.type === 'text';
    pass.type = showing ? 'password' : 'text';
    btn.innerHTML = showing
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + eyeClosed + '</svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + eyeOpen + '</svg>';
  });
  var form = document.querySelector('form');
  var sb = document.getElementById('submitBtn');
  var overlay = document.getElementById('loadingOverlay');
  var submitting = false;
  form.addEventListener('submit', function(){
    if (submitting) return;         // guard against double submission (e.g. Enter key)
    submitting = true;
    sb.disabled = true;
    sb.textContent = 'Signing in…';
    // Show the loading overlay so the user knows data is being loaded.
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  });
  // If the browser restores this page from its back/forward cache (e.g. the
  // user hits Back after signing in), make sure the overlay isn't stuck on.
  window.addEventListener('pageshow', function(e){
    if (e.persisted) overlay.classList.remove('show');
  });
})();
</script>
</body>
</html>
