# =============================================================================
# Dockerfile for NfSen 1.3.6p1 + NfDump 1.6.17
# Following the EXACT steps from the working guide
# Base: Ubuntu 20.04
# =============================================================================

FROM ubuntu:20.04

LABEL maintainer="NfSen Docker" \
      description="NfSen 1.3.6p1 with NfDump 1.6.17" \
      version="1.0.0"

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Dhaka

# ===========================================================================
# STEP 1: Install Dependencies
# ===========================================================================
# Removed vs the original guide: doxygen + graphviz (API-doc generation only)
# and net-tools (legacy ifconfig/netstat) - nothing at build or runtime needs
# them; smaller image, less attack surface. iproute2 (the modern replacement)
# ships with the base image. NOTE: no '#' comments inside the RUN block -
# in /bin/sh they swallow the rest of the continuation line.
RUN apt-get update && apt-get install -y \
    make gcc flex libpcap-dev libtool dh-autoreconf pkg-config libbz2-dev \
    byacc build-essential autoconf rrdtool librrd-dev librrds-perl \
    librrdp-perl libsocket6-perl libmailtools-perl php libapache2-mod-php \
    apache2 apache2-utils cpanminus wget curl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# ===========================================================================
# STEP 2: Enable PHP (guide: a2enmod php7.4)
# ===========================================================================
RUN a2enmod php7.4

# ===========================================================================
# STEP 2b: Enable Apache modules for the styled login page (form auth).
# mod_auth_form + mod_session* provide the HTML login flow; mod_request is
# used by mod_auth_form when reading the POSTed login form.
# ===========================================================================
RUN a2enmod auth_form authn_file session session_cookie session_crypto request

# ===========================================================================
# STEP 3: Fix Apache icons (guide: comment out Alias /icons/ line)
# ===========================================================================
RUN sed -i 's|^[[:space:]]*Alias /icons/ "/usr/share/apache2/icons/"|#Alias /icons/ "/usr/share/apache2/icons/"|' \
    /etc/apache2/mods-enabled/alias.conf 2>/dev/null || true

# ===========================================================================
# STEP 4: Set PHP timezone (guide: date.timezone = Asia/Dhaka)
# ===========================================================================
RUN sed -i 's|;date.timezone =|date.timezone = Asia/Dhaka|' /etc/php/7.4/apache2/php.ini

# ===========================================================================
# STEP 5: Create working directory and download nfdump + nfsen
# ===========================================================================
WORKDIR /tmp
RUN wget -q --retry-connrefused --tries=3 -O v1.6.17.tar.gz \
    https://github.com/phaag/nfdump/archive/v1.6.17.tar.gz \
    && tar xzfv v1.6.17.tar.gz

RUN wget -q --retry-connrefused --tries=3 -O nfsen.tar.gz \
    "https://downloads.sourceforge.net/project/nfsen/stable/nfsen-1.3.6p1/nfsen-1.3.6p1.tar.gz" \
    && tar zxfv nfsen.tar.gz

# ===========================================================================
# STEP 6: Prepare and compile nfdump (guide's exact configure flags)
# ===========================================================================
WORKDIR /tmp/nfdump-1.6.17
RUN sh ./autogen.sh \
    && ./configure \
        --enable-nsel \
        --enable-nfprofile \
        --enable-sflow \
        --enable-readpcap \
        --enable-nfpcapd \
        --enable-nftrack \
        --enable-jnat \
    && make -j"$(nproc)" && make install

# ===========================================================================
# STEP 7: Install Perl modules (guide: cpanm)
# ===========================================================================
RUN cpanm App::cpanminus \
    && cpanm Mail::Header \
    && cpanm Mail::Internet

# ===========================================================================
# STEP 8: ldconfig (as guide says)
# ===========================================================================
RUN /sbin/ldconfig

# ===========================================================================
# STEP 9: Configure nfsen config (guide: edit BASEDIR, WWWUSER, WWWGROUP)
# First copy the dist file to nfsen.conf
# ===========================================================================
RUN cd /tmp/nfsen-1.3.6p1/etc && cp nfsen-dist.conf nfsen.conf

# ===========================================================================
# STEP 10: Add netflow user and create /var/nfsen (as guide says)
# ===========================================================================
RUN useradd -M -s /bin/false -G www-data netflow \
    && mkdir -p /var/nfsen

# ===========================================================================
# STEP 11: Fix RRD version check in NfSenRRD.pm + install.pl
# Guide says: Change from 1.5 to 1.8 in NfSenRRD.pm
# Also fix install.pl's own version check - WARNING: NO inline comments here!
# In /bin/sh, # comments break continuation lines! Use echo instead.
# ===========================================================================
RUN cd /tmp/nfsen-1.3.6p1 \
    && echo "[STEP 11] Fixing NfSenRRD.pm 1.5->1.8..." \
    && sed -i 's/1\.[56]/1.8/g' libexec/NfSenRRD.pm \
    && echo "[STEP 11] Fixing install.pl exit calls..." \
    && sed -i 's/exit 2;/# exit 2;/g' install.pl \
    && sed -i '/not yet supported/d' install.pl \
    && echo "[STEP 11] Fixing Nfsync.pm semaphore die -> warn..." \
    && sed -i 's/|| die "Can not get semaphore/|| warn "Can not get semaphore/g' libexec/Nfsync.pm \
    && echo "[STEP 11] Fixing NfSen.pm UserInput for non-interactive reconfig..." \
    && sed -i '/$answer = <STDIN>;/a\        if (!defined($answer)) { $answer = "y"; }' libexec/NfSen.pm \
    && echo "[STEP 11] Version checks patched"

# ===========================================================================
# STEP 12: Configure nfsen.conf with our settings
# ===========================================================================
COPY config/nfsen.conf /tmp/nfsen-1.3.6p1/etc/nfsen.conf

# ===========================================================================
# STEP 13: Install nfsen (guide: ./install.pl ./etc/nfsen.conf)
# ===========================================================================
WORKDIR /tmp/nfsen-1.3.6p1
RUN ./install.pl ./etc/nfsen.conf \
    && echo "[STEP 13] install.pl completed" \
    && ls -la /var/nfsen/www/nfsen.php 2>/dev/null \
        && echo "[STEP 13] nfsen.php exists" \
        || { echo "[STEP 13 ERROR] nfsen.php NOT FOUND after install.pl!"; exit 1; }

# ===========================================================================
# STEP 13b: Install the styled login page (served by mod_auth_form on 401)
# and the 1-hour auto-logout guard (auto_prepend_file for every PHP page)
# ===========================================================================
COPY login.php /var/nfsen/www/login.php
COPY session-guard.php /var/nfsen/www/session-guard.php

# ===========================================================================
# STEP 14: Add restart command (missing from nfsen by default)
# ===========================================================================
RUN echo "[STEP 14] Adding restart command to nfsen..." && \
    perl -i -pe 'END { print qq(sub NfSen_restart {\n    NfSen_stop();\n    NfSen_start();\n}\n) }' /var/nfsen/libexec/NfSenRC.pm && \
    sed -i "/'start' => { 'nfsend' => 0, 'run' => .*NfSenRC::NfSen_start/a\    'restart' => { 'nfsend' => 0, 'run' => \&NfSenRC::NfSen_restart, 'RunAsRoot' => 1, 'rc_command' => 1 }," /var/nfsen/bin/nfsen && \
    echo "[STEP 14] restart command added"

# ===========================================================================
# STEP 15: Set up Apache (guide: virtual host, ports 8070, apache2.conf)
# ===========================================================================
COPY config/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY config/ports.conf /etc/apache2/ports.conf

# Update apache2.conf - change AllowOverride None to All (as guide says)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/s/AllowOverride None/AllowOverride All/' \
    /etc/apache2/apache2.conf 2>/dev/null || true

# ===========================================================================
# STEP 16: Configure ownership and permissions (guide's troubleshooting)
# ===========================================================================
RUN chown -R www-data:www-data /var/nfsen && \
    chown -R netflow:www-data /var/nfsen/profiles-data/live/ 2>/dev/null || true && \
    chmod -R 775 /var/nfsen && \
    chmod 777 /var/nfsen/var/run 2>/dev/null || true

# ===========================================================================
# STEP 16b: Keep a pristine default nfsen.conf so the entrypoint can seed a
# fresh (empty) nfsen-etc bind mount on first start (an empty host folder
# hides the image's baked-in copy).
# ===========================================================================
COPY config/nfsen.conf /opt/nfsen.conf.default

# ===========================================================================
# STEP 16c: Snapshot the pristine 'live' profile (profile.dat + channel RRD
# files + per-source data dirs). install.pl created it above, but an EMPTY
# nfsen-stat / nfsen-data bind mount hides all of it on first start. Without
# /var/nfsen/profiles-stat/live/profile.dat NfSen aborts with "Error reading
# profile 'live'" and nfsend never starts (Web UI: "Can not initialize
# globals"). The entrypoint re-seeds from this snapshot when profile.dat is
# missing. TAKEN AFTER the chown above, so the seed files already have the
# correct www-data / netflow ownership.
# ===========================================================================
RUN mkdir -p /opt/nfsen-seed/profiles-stat /opt/nfsen-seed/profiles-data \
    && cp -a /var/nfsen/profiles-stat/live /opt/nfsen-seed/profiles-stat/live \
    && cp -a /var/nfsen/profiles-data/live /opt/nfsen-seed/profiles-data/live \
    && echo "[STEP 16c] live profile snapshotted:" \
    && ls -la /opt/nfsen-seed/profiles-stat/live \
    && ls -la /opt/nfsen-seed/profiles-data/live

# ===========================================================================
# STEP 17: Make nfsen reboot proof (guide: init.d symlink)
# ===========================================================================
RUN ln -sf /var/nfsen/bin/nfsen /etc/init.d/nfsen

# ===========================================================================
# STEP 18: Copy entrypoint
# ===========================================================================
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# ===========================================================================
# Clean up build artifacts
# ===========================================================================
RUN rm -rf /tmp/nfdump-1.6.17* /tmp/nfsen-1.3.6p1* /tmp/v1.6.17* /tmp/nfsen.tar.gz

# ===========================================================================
# Expose ports: 8070/tcp (NfSen Web UI) and 2055/udp (NetFlow)
# ===========================================================================
EXPOSE 8070
EXPOSE 2055/udp

# Health check — short start-period now that the entrypoint boots in seconds
# (a 60s start-period kept the container in "Starting" state for a full minute)
# With the login page enabled, every protected URL returns 401 before any PHP
# runs, so the healthcheck no longer curls nfsen.php (it would always fail).
# It verifies Apache is up by fetching the login page (always 200), then
# checks the nfsend daemon pid + socket — this is what catches the "Can not
# initialize globals" state (a socket file alone can't be trusted: it lingers
# if nfsend crashes mid-run).
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD test "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8070/login.php)" = "200" && [ -f /var/nfsen/var/run/nfsend.pid ] && kill -0 "$(cat /var/nfsen/var/run/nfsend.pid)" 2>/dev/null && test -S /var/nfsen/var/run/nfsen.comm || exit 1

# ===========================================================================
# Entrypoint
# ===========================================================================
CMD ["/entrypoint.sh"]
