#!/bin/bash
# =============================================================================
# NfSen Docker Entrypoint
# Following the working guide exactly
# =============================================================================

NFSEN_BASEDIR="/var/nfsen"

echo "========================================================================="
echo "  NfSen 1.3.6p1 + NfDump 1.6.17 Docker Container"
echo "  Ubuntu 20.04"
echo "========================================================================="

# ---------------------------------------------------------------------------
# Seed nfsen.conf on a fresh nfsen-etc bind mount
# ---------------------------------------------------------------------------
# When nfsen-etc is a bind mount, an empty host folder HIDES the image's
# baked-in /var/nfsen/etc/nfsen.conf. If it's missing, copy the pristine
# default from /opt/nfsen.conf.default so NfSen always has a config.
if [ ! -f "${NFSEN_BASEDIR}/etc/nfsen.conf" ]; then
    echo "[INFO] nfsen.conf missing (fresh nfsen-etc mount) - seeding default config..."
    cp /opt/nfsen.conf.default "${NFSEN_BASEDIR}/etc/nfsen.conf"
    chown www-data:www-data "${NFSEN_BASEDIR}/etc/nfsen.conf"
fi

# ---------------------------------------------------------------------------
# Password protection - seed .htpasswd with the default admin user
# ---------------------------------------------------------------------------
# The Web UI is protected by an Apache login page. The password file lives in
# nfsen-etc/.htpasswd (bind mount) so it survives rebuilds, and it is created
# ONCE with a default user/password. Change it any time (takes effect
# instantly, no restart) with:
#   docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd <user> <newpass>
NFSEN_ADMIN_USER="${NFSEN_ADMIN_USER:-admin}"
NFSEN_ADMIN_PASSWORD="${NFSEN_ADMIN_PASSWORD:-change-me-now}"
if [ ! -f "${NFSEN_BASEDIR}/etc/.htpasswd" ]; then
    echo "[INFO] No .htpasswd found - creating default login: ${NFSEN_ADMIN_USER} / ${NFSEN_ADMIN_PASSWORD}"
    echo "       >>> CHANGE THIS IMMEDIATELY: docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd ${NFSEN_ADMIN_USER} <your-password>"
    htpasswd -bc "${NFSEN_BASEDIR}/etc/.htpasswd" "${NFSEN_ADMIN_USER}" "${NFSEN_ADMIN_PASSWORD}" \
        || echo "[WARN] htpasswd failed - Apache login will reject everyone until .htpasswd exists"
fi
chown www-data:www-data "${NFSEN_BASEDIR}/etc/.htpasswd" 2>/dev/null || true
chmod 640 "${NFSEN_BASEDIR}/etc/.htpasswd" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Configure NetFlow sources from environment variable
# ---------------------------------------------------------------------------
if [ -n "$NFSEN_SOURCES" ]; then
    echo "[INFO] Configuring NetFlow sources from NFSEN_SOURCES env var..."
    SOURCES_STR="%sources = ("
    IFS=',' read -ra SOURCE_ARRAY <<< "$NFSEN_SOURCES"
    for src in "${SOURCE_ARRAY[@]}"; do
        IFS=':' read -ra PARTS <<< "$src"
        PORT="${PARTS[0]}"
        LABEL="${PARTS[1]}"
        COLOR="${PARTS[2]:-#0000ff}"
        IP="${PARTS[3]:-}"
        if [ -n "$IP" ]; then
            SOURCES_STR+="\n    '${LABEL}' => { 'port' => '${PORT}', 'col' => '${COLOR}', 'type' => 'netflow', 'IP' => '${IP}' },"
        else
            SOURCES_STR+="\n    '${LABEL}' => { 'port' => '${PORT}', 'col' => '${COLOR}', 'type' => 'netflow' },"
        fi
    done
    SOURCES_STR+="\n);"
    sed -i "/^%sources/,/^);/c\\${SOURCES_STR}" "${NFSEN_BASEDIR}/etc/nfsen.conf" 2>/dev/null || true
fi

# ---------------------------------------------------------------------------
# Demo source fallback - seed 'router1' ONLY when NO sources are configured.
# This guarantees the Web UI shows graph placeholders on a first build (and on
# older containers whose config volume was seeded empty), with NO manual step.
# It never overwrites sources added via docker exec / NFSEN_SOURCES, so your
# real routers are always safe.
# ---------------------------------------------------------------------------
if ! sed -n '/^%sources/,/^);/p' "${NFSEN_BASEDIR}/etc/nfsen.conf" | grep -qE "=> \{"; then
    echo "[INFO] No router sources configured - seeding demo 'router1' source..."
    sed -i "/^);$/i\\    'router1' => { 'port' => '2055', 'IP' => '0.0.0.0', 'col' => '#0000ff', 'type' => 'netflow' }," "${NFSEN_BASEDIR}/etc/nfsen.conf" 2>/dev/null || true
fi

# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# Ensure required directories exist
# ---------------------------------------------------------------------------
mkdir -p "${NFSEN_BASEDIR}/var/run" "${NFSEN_BASEDIR}/var/tmp" "${NFSEN_BASEDIR}/var"
mkdir -p "${NFSEN_BASEDIR}/profiles-data/live" "${NFSEN_BASEDIR}/profiles-stat/live" "${NFSEN_BASEDIR}/profiles-stat"

# ---------------------------------------------------------------------------
# Seed the 'live' profile on a fresh nfsen-stat / nfsen-data bind mount
# ---------------------------------------------------------------------------
# NfSen REQUIRES /var/nfsen/profiles-stat/live/profile.dat to exist before
# 'nfsen reconfig' or 'nfsen start' will run — bin/nfsen aborts with "Error
# reading profile 'live'" (and nfsend never starts, so the Web UI shows
# "Can not initialize globals") when it is missing.
# install.pl created it during the image build, but an EMPTY nfsen-stat host
# folder hides the image content. On first start we copy the pristine snapshot
# (profile.dat + channel RRD files + per-source data dirs) back in. Later
# starts keep whatever profile.dat exists, so your reconfigs/added sources
# are never overwritten.
if [ ! -s "${NFSEN_BASEDIR}/profiles-stat/live/profile.dat" ]; then
    echo "[INFO] Live profile missing (fresh nfsen-stat mount) - seeding from image snapshot..."
    mkdir -p "${NFSEN_BASEDIR}/profiles-stat/live" "${NFSEN_BASEDIR}/profiles-data/live"
    cp -a /opt/nfsen-seed/profiles-stat/live/. "${NFSEN_BASEDIR}/profiles-stat/live/" 2>/dev/null \
        || echo "[WARN] profile-stat seed copy failed (older image without snapshot?)"
    cp -a /opt/nfsen-seed/profiles-data/live/. "${NFSEN_BASEDIR}/profiles-data/live/" 2>/dev/null \
        || echo "[WARN] profile-data seed copy failed (older image without snapshot?)"
    # Seeding fills profiles-data/live, which disables the "first run" full
    # recursive chown below (it only runs on an EMPTY live dir) - so apply the
    # same ownership here that that block would have set.
    chown -R www-data:www-data "${NFSEN_BASEDIR}/profiles-stat" 2>/dev/null || true
    chown www-data:www-data "${NFSEN_BASEDIR}/profiles-data" 2>/dev/null || true
    chown -R netflow:www-data "${NFSEN_BASEDIR}/profiles-data/live" 2>/dev/null || true
    chmod -R 775 "${NFSEN_BASEDIR}/profiles-stat" "${NFSEN_BASEDIR}/profiles-data" 2>/dev/null || true
fi

# Remove stale socket/PID files
rm -f "${NFSEN_BASEDIR}/var/run/nfsen.comm" 2>/dev/null || true
rm -f "${NFSEN_BASEDIR}/var/run/nfsend.pid" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Fix permissions — FAST on restart
# ---------------------------------------------------------------------------
# A recursive chown/chmod of the whole /var/nfsen used to run on EVERY start.
# Once nfcapd has written flow data (gigabytes of files in the nfsen-data /
# nfsen-stat / nfsen-var volumes), that single pass costs 60s+ of CPU+IO on
# every boot — the main reason container starts got slow. Files inside the
# volumes already keep the correct ownership between restarts, so the full
# recursive pass now runs ONLY on the very first start, when the volumes are
# still empty (and it is instant).
if [ -z "$(ls -A "${NFSEN_BASEDIR}/profiles-data/live" 2>/dev/null)" ]; then
    echo "[INFO] Empty data volume detected (first run) - applying full permissions..."
    chown -R www-data:www-data "${NFSEN_BASEDIR}" 2>/dev/null || true
    chown -R netflow:www-data "${NFSEN_BASEDIR}/profiles-data/live/" 2>/dev/null || true
    chmod -R 775 "${NFSEN_BASEDIR}" 2>/dev/null || true
fi
# New sources added at runtime (nfsen reconfig) create fresh live/<source> dirs
# that may not be netflow-owned yet. Fix them ONE level deep on every start —
# this never recurses into flow data, so it stays instant even on big volumes.
chown netflow:www-data "${NFSEN_BASEDIR}"/profiles-data/live/* 2>/dev/null || true
chown www-data:www-data "${NFSEN_BASEDIR}"/profiles-stat/live/* 2>/dev/null || true
chmod 777 "${NFSEN_BASEDIR}/var/run" 2>/dev/null || true

# The "first run" chmod -R 775 above would leave .htpasswd world-readable —
# re-lock it so the password hashes stay private.
chown www-data:www-data "${NFSEN_BASEDIR}/etc/.htpasswd" 2>/dev/null || true
chmod 640 "${NFSEN_BASEDIR}/etc/.htpasswd" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Generate a random session-cookie encryption passphrase (once per container)
# ---------------------------------------------------------------------------
# SessionCryptoPassphrase protects the login session cookie. The baked vhost
# ships a placeholder; replace it with a random 32+ byte value on first start
# so every container instance uses its own key.
if grep -q 'NFSEN_SESSION_CRYPTO_CHANGE_ME' /etc/apache2/sites-available/000-default.conf 2>/dev/null; then
    CRYPTO_PASS="$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
    sed -i "s|NFSEN_SESSION_CRYPTO_CHANGE_ME|${CRYPTO_PASS}|" /etc/apache2/sites-available/000-default.conf
    echo "[INFO] Apache session crypto passphrase generated."
fi

# ---------------------------------------------------------------------------
# Start Apache (guide: systemctl start apache2)
# ---------------------------------------------------------------------------
echo "[INFO] Starting Apache on port 8070..."
rm -f /var/run/apache2/apache2.pid 2>/dev/null || true
if apache2ctl start 2>&1; then
    echo "[OK] Apache started."
else
    echo "[ERROR] Apache FAILED to start! Run: docker compose logs netlens"
    apache2ctl configtest 2>&1 || true
fi

# ---------------------------------------------------------------------------
# Start NfSen (guide: /var/nfsen/bin/nfsen start)
# ---------------------------------------------------------------------------
echo "[INFO] Starting NfSen..."
if [ -f "${NFSEN_BASEDIR}/bin/nfsen" ]; then
    # Run reconfig first to sync config with existing data directories.
    # Output goes straight to the console (docker logs) so failures like
    # "Error reading profile 'live'" are VISIBLE instead of swallowed.
    echo "---- nfsen reconfig ----"
    ${NFSEN_BASEDIR}/bin/nfsen reconfig 2>&1
    echo "---- nfsen start ----"
    ${NFSEN_BASEDIR}/bin/nfsen start 2>&1
    sleep 2
    if [ -f "${NFSEN_BASEDIR}/var/run/nfsend.pid" ]; then
        echo "[OK] NfSen daemon running."
    else
        echo "[WARN] NfSen daemon not running. Check logs."
    fi
fi

# ---------------------------------------------------------------------------
# Service status
# ---------------------------------------------------------------------------
echo "========================================================================="
echo "  Service Status:"
if pgrep -x apache2 > /dev/null; then
    echo "  ✓ Apache (port 8070) ........ running"
else
    echo "  ✗ Apache .................... NOT running"
fi
if [ -f "${NFSEN_BASEDIR}/var/run/nfsend.pid" ]; then
    echo "  ✓ nfsend .................... running"
else
    echo "  ✗ nfsend .................... NOT running"
fi
echo "========================================================================="
echo "  Web UI: http://<YOUR_IP>:8070/nfsen.php"
echo "========================================================================="

# Trap for graceful shutdown
trap 'echo "Shutting down..."; ${NFSEN_BASEDIR}/bin/nfsen stop 2>/dev/null; apache2ctl stop; exit 0' SIGTERM SIGINT

# Keep container running.
# NOTE: the old code used `exec tail -f ... || exec sleep infinity` which is
# broken: once `exec` replaces the shell, the `|| sleep infinity` fallback can
# NEVER run. If tail exits (e.g. a log file is missing on first start), the
# container exits and `restart: unless-stopped` crash-loops forever -
# docker compose shows "Trying to reconnect!" while it waits to re-attach.
# `--retry` makes tail keep waiting for log files that don't exist yet, and
# `sleep infinity` is the safety net if tail ever does exit.
tail -F \
    /var/log/apache2/error.log \
    /var/log/apache2/access.log \
    "${NFSEN_BASEDIR}/var/nfsen.log" || \
    sleep infinity
