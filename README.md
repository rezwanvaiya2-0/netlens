# NetLens - Dockerized NfSen NetFlow Analyzer

<p align="center">
  <a href="https://sourceforge.net/projects/nfsen/"><img src="https://img.shields.io/badge/NfSen-1.3.6p1-40BC3D" alt="NfSen 1.3.6p1"></a>
  <a href="https://github.com/phaag/nfdump"><img src="https://img.shields.io/badge/NfDump-1.6.17-14b8a6" alt="NfDump 1.6.17"></a>
  <a href="https://ubuntu.com/"><img src="https://img.shields.io/badge/Ubuntu-20.04-E95420?logo=ubuntu&logoColor=white" alt="Ubuntu 20.04"></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
  <a href="https://www.php.net/"><img src="https://img.shields.io/badge/PHP-7.4-777BB4?logo=php&logoColor=white" alt="PHP 7.4"></a>
  <a href="https://httpd.apache.org/"><img src="https://img.shields.io/badge/Apache-2.4-D22128?logo=apache&logoColor=white" alt="Apache 2.4"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-BSD--3--Clause-40BC3D" alt="License: BSD-3-Clause"></a>
  <a href="https://github.com/rezwanvaiya2-0/netlens"><img src="https://img.shields.io/badge/Web%20UI-Port%208070-22d3ee" alt="Web UI Port 8070"></a>
  <a href="https://github.com/rezwanvaiya2-0/netlens"><img src="https://img.shields.io/badge/NetFlow-UDP%202055%2F2056-6366f1" alt="NetFlow UDP 2055/2056"></a>
  <img src="https://img.shields.io/badge/Made%20in-Bangladesh-40BC3D" alt="Made in Bangladesh">
</p>

**NfSen 1.3.6p1 + NfDump 1.6.17** on Ubuntu 20.04 — fully Dockerized.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Data Folders & How Mounting Works](#data-folders-bind-mounts)
3. [Managing Router Sources](#managing-router-sources)
4. [Adding a Router on a New Port — how it actually works](#adding-a-router-on-a-new-port)
5. [Set Data Retention (from the Web UI)](#set-data-retention-from-the-web-ui)
6. [Password Protection (Login Page)](#password-protection-login-page)
7. [Notes](#notes)
8. [Storage Full — Recover Disk Space](#storage-full--recover-disk-space)
9. [Security](#security)
10. [Troubleshooting](#troubleshooting)
11. [LibreNMS Integration](https://netlens.rezwan.bro.bd/integration/librenms-integration)

## Quick Start

```bash
git clone https://github.com/rezwanvaiya2-0/netlens.git
cd netlens
sudo ./install.sh          # build & start (same as docker compose up -d --build)
```

> `./install.sh` is exactly `docker compose up -d --build`.

> **`--build` is only needed on the first run.** After that, restarting the container only requires `docker-compose down && docker-compose up -d` (no `--build`). Your sources, config, and data all persist thanks to the data folders next to `docker-compose.yml` (see [Data Folders](#data-folders-bind-mounts)).

Access: **http://\<YOUR_IP\>:8070/nfsen.php**

> The Web UI is password-protected. First login: **`admin` / `change-me-now`** — change it right away (see [Password Protection (Login Page)](#password-protection-login-page)).

Timezone: **Asia/Dhaka**

> **UDP ports `2055` and `2056` are pre-opened.** Every router needs its own port, and that port must be added to `docker-compose.yml` before its data can arrive. To connect a router on a **new** port: add the port + source in `docker-compose.yml`, then run `docker compose up -d` — ~3 seconds, **no image rebuild, no data loss**. See [Adding a Router on a New Port](#adding-a-router-on-a-new-port).

---

## Data Folders (Bind Mounts)

Your data now lives in **4 real folders next to `docker-compose.yml`** — no more hidden Docker volumes. You can see, browse, back up, and even mount/unmount them without ever losing data:

| Folder | Inside the container | What it holds |
|---|---|---|
| `nfsen-data/` | `/var/nfsen/profiles-data` | Raw flow records (captured NetFlow files) |
| `nfsen-stat/` | `/var/nfsen/profiles-stat` | RRD graph files (the charts in the Web UI) |
| `nfsen-var/` | `/var/nfsen/var` | Logs, cache, runtime files |
| `nfsen-etc/` | `/var/nfsen/etc` | `nfsen.conf` (router sources config) |

- The folders are created automatically on first start (`docker compose up`), and the entrypoint seeds the default config + demo source when `nfsen-etc/` is empty.
- **Why does `docker volume ls` show nothing?** These 4 folders are **bind mounts**, not Docker volumes. `docker volume ls` only lists *named* volumes — bind mounts are plain host folders and are intentionally invisible there. That is **normal and correct**: the folders themselves *are* the storage. To confirm they are mounted, run `docker inspect netlens` and look at the `Mounts` section (each shows `"Type": "bind"` with the matching `Source`/`Destination`), or simply `ls` the 4 folders next to `docker-compose.yml`.
- **Mount / unmount freely** — `docker compose stop`, `down`, `up -d`, even `down -v` no longer delete anything: your data lives in the host folders, not inside Docker. Only `rm -rf` of the folders themselves deletes it (and the container should be stopped first — see [Clean up](#clean-up--delete-the-data-folders) below).
- **Back up anytime** (container can keep running): `cp -a nfsen-data nfsen-data-backup` or `tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc`.

### How the mounting actually works

Every line under `volumes:` in `docker-compose.yml` is a **bind mount** — one host folder "shared" with a path inside the container. Both sides see the SAME files (like a shared folder):

```
VPS host (on your server)            Inside the container
────────────────────────────        ───────────────────────────────
./nfsen-data/   ◄─── shared ───►    /var/nfsen/profiles-data/   raw NetFlow files
./nfsen-stat/   ◄─── shared ───►    /var/nfsen/profiles-stat/   RRD graph files
./nfsen-var/    ◄─── shared ───►    /var/nfsen/var/             logs + runtime
./nfsen-etc/    ◄─── shared ───►    /var/nfsen/etc/             nfsen.conf (sources)
```

Example: when the collector saves flow data it writes to `/var/nfsen/profiles-data/live/router1/` *inside* the container — and because of the mount, the file physically lands in **`nfsen-data/live/router1/` on your VPS**. You can browse, copy, back up, or delete it directly from the host at any time.

**Lifecycle rules:**

- **Mount / unmount = start / stop the container.** `docker compose down` releases the mounts; `docker compose up -d` re-attaches them. The data never moves.
- **Data survives everything** — rebuilds, recreates, and even `docker compose down -v` (that flag only deletes *named* volumes; your data lives in these host folders).
- **The only thing that deletes your data** is `rm -rf nfsen-data nfsen-stat nfsen-var nfsen-etc` (stop the container first — see "Clean up" below).
- **An empty host folder HIDES the image's built-in content** — that's why the entrypoint auto-seeds `nfsen.conf` into `nfsen-etc/` and the `live` profile into `nfsen-stat/` + `nfsen-data/` on first start. (This seeding is what fixed the old `Can not initialize globals` error.)

### Clean up / delete the data folders

Because the folders are **bind mounts**, the running container is actively writing to them. So before deleting/cleaning a mounted folder, **unmount it first** (`docker compose down`) — deleting a folder that is still mounted can fail or leave the container in a broken state (it will keep trying to write into a deleted path).

**Only clear the captured flow data (keep config + sources):**

```bash
cd netlens

# 1) Unmount first
docker compose down

# 2) Delete only the flow data + graphs (keeps nfsen.conf / router sources)
rm -rf nfsen-data/live/* nfsen-stat/live/*

# 3) Remount — same config, empty graphs
sudo docker compose up -d
```

> If the container is **already stopped** (e.g. after `docker compose stop` or `down`), the mounts are already released — you can delete the folders directly without any extra step. The rule is simple: **container stopped = folders free to delete; container running = unmount first.**

### Migrating from the old named volumes

If you already had data in the old Docker volumes and want to move it into the new folders:

```bash
cd netlens
git pull
# stop the container first
sudo docker compose down

# create the new folders first (docker compose up would create them, but we
# need them NOW so the copies below have a target)
mkdir -p nfsen-data nfsen-stat nfsen-var nfsen-etc

# copy the existing data from each old volume into its new folder
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-data/_data/. nfsen-data/
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-stat/_data/. nfsen-stat/
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-var/_data/. nfsen-var/
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-etc/_data/. nfsen-etc/

# fix ownership so NfSen can write to the copied data
sudo docker compose up -d
docker exec netlens chown -R netflow:www-data /var/nfsen/profiles-data/live/ && docker exec netlens chown -R www-data:www-data /var/nfsen/profiles-stat/live/

# old volumes are now unused - you may delete them to free space
sudo docker volume rm netlens_nfsen-data netlens_nfsen-stat netlens_nfsen-var netlens_nfsen-etc
```

> If you pull and start **without** migrating, the new folders start empty (your old data stays safe in the named volumes, just not mounted). Do the copy steps above first if you want to keep existing graphs.

---

---

## Managing Router Sources

### Add a source with IP

#### Docker exec (recommended)

Replace `NAME`, `IP_ADDRESS`, and `COLOR` with your values:

```bash
docker exec netlens bash -c "sed -i \"/^);$/i\\    'NAME' => { 'port' => '2055', 'IP' => 'IP_ADDRESS', 'col' => '#COLOR', 'type' => 'netflow' },\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Done'"
```

> **If you have existing sources without IP, this will fail!** You must first add `'IP' => '0.0.0.0'` to all existing sources before adding a new one with an IP.

---

### Remove a source

#### Docker exec (recommended)

Replace `NAME` with your source name (e.g., `router1`):

```bash
docker exec netlens bash -c "sed -i \"/'NAME' =>/d\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Removed'"
```

---

### List all sources

```bash
docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf
```

### Check NfSen status

```bash
docker exec netlens /var/nfsen/bin/nfsen status
```

---

## Important: IP Requirement for Multiple Sources

When you have **more than one source** configured, **NfSen requires ALL sources to have an `IP` field**.

If you add a source with an IP while existing sources lack one, the command will fail. Fix this by manually adding `'IP' => '0.0.0.0'` to each existing source first using the same sed method above.

> **Check your current sources:**
> ```bash
> docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf
> ```
> Then update any auto-filled `0.0.0.0` IPs with the actual source IPs by editing the config directly.

---

## Adding a Router on a New Port

Only **UDP ports `2055` and `2056`** are open, and a **demo source `router1`** on port 2055 ships by default (so the Web UI shows graph placeholders on first install — no more "no data available"). You can keep it or replace it with your real routers. When you connect a router that sends NetFlow to a **new port**, that port must be opened in `docker-compose.yml` — otherwise the router's packets are dropped and you will see no data.

### How it actually works (router to graph)

```
Your router ──UDP NetFlow──► VPS port 2070 ──(Docker port publish)──► container port 2070
      ──(nfcapd collector, from the nfsen.conf source)──► nfsen-data/live/<router>/  (raw files)
      ──(nfsend, every 5 min)──► nfsen-stat/live/<router>.rrd  (graphs)
      ──► Web UI  http://YOUR_IP:8070/nfsen.php
```

1. **Your router sends NetFlow** to your VPS IP on a UDP port (e.g. `2070`).
2. **Docker must forward that UDP port** into the container — that's the `ports:` line in `docker-compose.yml`. Without it, the packets are dropped before NfSen ever sees them.
3. **nfcapd must listen on that port** — that's the router *source* in `nfsen.conf`. `nfsen reconfig` starts one collector (`nfcapd`) per port automatically.
4. **nfcapd writes the raw flow files** into `/var/nfsen/profiles-data/live/<router>/` — which is your `nfsen-data/live/<router>/` folder (bind mount, see above).
5. **nfsend turns them into graphs** (RRD files) in `/var/nfsen/profiles-stat/live/` — your `nfsen-stat/live/` folder.
6. **The Web UI (port 8070) reads those RRD files** and draws the charts.

So adding a router means **two things must both happen**: *(1)* open the UDP port in `docker-compose.yml`, and *(2)* add the source in `nfsen.conf`. The steps below do both.

### Step-by-step (example: new router on port 2070)

1. Edit `docker-compose.yml` on the VPS:

```bash
cd netlens
nano docker-compose.yml
```

2. Add the new port under `ports:` (only the ports you use are published):

```yaml
    ports:
      - "8070:8070"
      - "2055:2055/udp"
      - "2056:2056/udp"
      - "2070:2070/udp"      # <- new router port
```

3. Add the router source — `docker exec` is the recommended way, and it now **persists forever** (see note below):

```bash
docker exec netlens bash -c "sed -i \"/^);$/i\\    'myrouter' => { 'port' => '2070', 'col' => '#FF0000', 'type' => 'netflow' },\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Done'"
```

> Prefer the env var? You can set `NFSEN_SOURCES=2070:myrouter:#FF0000` in `docker-compose.yml` instead — but pick **one** method, don't mix.

4. Recreate the container — done:

```bash
docker compose up -d
```

That's it: the port opens **and** the router source is configured automatically. Takes ~3 seconds. (Commands use `docker compose` — Docker v2. If your VPS has the older tool, use `docker-compose` instead.)

> **No rebuild:** the image is not rebuilt — only the container is recreated, fast and safe.
> **No data loss:** `docker compose up -d` keeps all your NetFlow data (it lives in the `nfsen-data/` folder next to `docker-compose.yml`).
> **`docker compose down -v` no longer deletes your data** — it now uses bind mounts, and `-v` only removes *named* volumes. Your data only disappears if you `rm -rf` the folders yourself (see [Data Folders](#data-folders-bind-mounts)).

**What each step did:**

1. Adding `- "2070:2070/udp"` to `ports:` — Docker starts forwarding UDP 2070 from the VPS into the container.
2. The `docker exec` command adds the `'myrouter'` source to `nfsen.conf` (which lives in `nfsen-etc/` on the host) and runs `nfsen reconfig` — reconfig starts an `nfcapd` collector on port 2070 and creates the `nfsen-data/live/myrouter/` folder.
3. `docker compose up -d` recreates the container so the new port mapping takes effect (the image is **not** rebuilt).

**Result:** packets from your router on port 2070 now flow: UDP — Docker — nfcapd — `nfsen-data/live/myrouter/` — RRD graphs — Web UI.

### Replace or remove the demo `router1` source

The container ships with a demo source `router1` listening on port **2055** so the Web UI shows graphs on first install — **no manual setup needed**. It appears automatically on a fresh build, and the entrypoint also seeds it on any container that starts with zero sources (e.g. an older one whose config volume was seeded empty). Once you add your real routers, the fallback never runs again and your sources are never touched. Once you connect your real router, replace or remove the demo with `docker exec`:

```bash
# Remove the demo source
docker exec netlens bash -c "sed -i \"/'router1' =>/d\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Removed'"
```

Or simply add your real router on port 2055 (see [Add a source with IP](#add-a-source-with-ip)) and ignore the demo until you remove it.

> **To keep the demo gone permanently, keep at least one real source.** If your `%sources` list ever becomes completely empty (e.g. you remove `router1` and have no other routers yet), the demo is re-seeded automatically on the next container start. That's the safety net that guarantees the Web UI always shows graphs — once you have any real router, the demo never comes back.

---

## Set Data Retention (from the Web UI)

No commands or config changes needed — NfSen's data retention is set from the GUI:

1. Log in to the Web UI (`http://<YOUR_IP>:8070/`).
2. Click **Profile Admin** in the top menu.
3. In the **`live`** profile row, click **Edit**.
4. Set **Expire** (how long to keep data — e.g. `3d` = 3 days) and **Max size** (hard disk cap — e.g. `44G`), then **Save**.

The `nfsend` daemon applies it automatically within a few minutes — no restart needed, and it covers every router. Use **both** fields:

| Field | What it does | Example |
|---|---|---|
| **Expire** | Max **age** of data to keep — deletes the oldest whole 5-minute files once they're older than this | `3d` = keep 3 days |
| **Max size** | Max **disk size** of the profile's flow data — deletes oldest files until under the cap | `44G` = never exceed 44 GB |

`Expire` alone can still fill the disk on heavy traffic (it ignores file size); `Max size` guarantees it never does (on heavy traffic it just keeps less history). Setting both is the "seatbelt + airbag" combo. Only the oldest whole 5-minute files are ever removed — the file currently being written is never touched, and collection never stops.

### Same setting from the command line (optional)

The GUI writes to the same per-profile config, so you can set it with one command instead — useful for scripting:

```bash
docker exec netlens /var/nfsen/bin/nfsen --modify-profile live expire=30d maxsize=15G
```

(e.g. 30 days of history, never more than 15 GB of flow data — a good rule for a 20 GB disk).

> In NfSen **1.3.6p1 retention is a per-profile setting** (the `live` profile) — the global `%expire` / `timelimit` keys only exist in newer NfSen (1.3.7+). And `$profiletimout` in `nfsen.conf` is **not** retention — it's just the profile refresh timeout (default 60 s) and frees no disk space.

---

## Notes

- **UDP ports 2055 and 2056** are pre-opened — add more in `docker-compose.yml` as needed (see [Adding a Router on a New Port](#adding-a-router-on-a-new-port))
- A **demo source `router1`** on port 2055 ships by default (seeded automatically if a container has zero sources) so the Web UI shows graphs on first install — remove or replace it with your real routers (see [Replace or remove the demo source](#replace-or-remove-the-demo-router1-source))
- **Router sources added via `docker exec` now persist forever** — `nfsen.conf` lives in the `nfsen-etc/` folder, so it survives restarts, recreates, and even rebuilds. No env vars needed.
- The `NFSEN_SOURCES` env var is **optional** — use it only if you prefer managing sources in `docker-compose.yml` instead of `docker exec`
- **NetFlow data lives in the folders next to `docker-compose.yml`** (`nfsen-data/`, `nfsen-stat/`, `nfsen-var/`, `nfsen-etc/`) and survives rebuilds, recreates, and even `down -v` (see [Data Folders](#data-folders-bind-mounts))
- `docker compose down -v` no longer deletes anything — only `rm -rf nfsen-data nfsen-stat nfsen-var nfsen-etc` does
- `nfsen-etc/nfsen.conf` is seeded from the image only when the folder is **empty** — if you later change `config/nfsen.conf` in the repo, copy it over (`cp config/nfsen.conf nfsen-etc/nfsen.conf`) or delete the file and restart

---

## Password Protection (Login Page)

The Web UI is protected by a **styled HTML login page** (Apache `mod_auth_form`). Nobody can view the graphs, the raw flow data, or any NfSen page without signing in.

### First login

Open `http://<YOUR_IP>:8070/` — you'll be asked to sign in:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `change-me-now` |

> **Change the password immediately** — one command, takes effect instantly, **no restart needed**:

```bash
docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123
```

### Log out

Visit **`http://<YOUR_IP>:8070/logout`**.

### Customize the default credentials (first boot only)

Set these in `docker-compose.yml` (they only apply while `.htpasswd` doesn't exist yet):

```yaml
environment:
  - NFSEN_ADMIN_USER=admin
  - NFSEN_ADMIN_PASSWORD=change-me-now
```

### Security notes

- The password travels **in clear text over plain HTTP**. For a production VPS, put HTTPS (TLS) in front of port 8070 (self-signed now, Let's Encrypt if you have a domain pointing at the server).
- **Login sessions end when you close the browser** — the login cookie is a browser-session cookie (no expiry), so closing the browser and reopening the site shows the login page again.
- **Sessions also auto-expire after 1 hour of inactivity** — enforced by `session-guard.php`, which runs before every NfSen page (`auto_prepend_file`). Staying on the login page never logs you out. To change the limit, edit `NFSEN_LOGIN_MAX_AGE` at the top of `session-guard.php` (value in seconds) and rebuild.
- Only the Web UI is protected. The NetFlow UDP collection ports (2055, 2056, …) are unaffected.
- Need the login page removed again? Delete the auth block from `config/000-default.conf` and rebuild.

---

## Security

What this project does to stay secure, and what you should do on the VPS:

- **Login protection** — Apache `mod_auth_form` login page for the whole Web UI (see [Password Protection](#password-protection-login-page)). The activity-timer cookie is **HttpOnly + SameSite=Lax** (set by `session-guard.php`). Note: the Apache session cookie itself can't be marked HttpOnly on Ubuntu 20.04's Apache 2.4.41 (that needs Apache 2.4.43+) — so keep the UI behind HTTPS and log out when you're done.
- **No directory listings** — Apache `Options -Indexes` in `config/000-default.conf`, so NfSen's plugin/config files under `/var/nfsen/www` can't be browsed.
- **Least privilege** — the container runs with **no extra Linux capabilities** (no `NET_ADMIN`/`NET_RAW`): nfcapd collects NetFlow over plain UDP sockets and needs nothing special.
- **Session crypto** — the login session is encrypted with a random passphrase generated on first start.
- **Smaller attack surface** — the image no longer installs docs-only tools (doxygen, graphviz) or legacy net-tools.

**Do this on your VPS (one time):**

```bash
# 1) Change the default login password right away
docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin <YourStrongPassword>

# 2) Firewall the NetFlow UDP ports to ONLY your routers' IPs
sudo ufw allow from <ROUTER1_IP> to any port 2055 proto udp
sudo ufw allow from <ROUTER2_IP> to any port 2056 proto udp
sudo ufw allow 8070/tcp        # Web UI (keep this one open)
sudo ufw enable

# 3) HTTPS for the Web UI (plain HTTP currently)
#    Put a reverse proxy (Caddy / Nginx / Let's Encrypt) in front of port 8070.
#    See also: brute-force protection on the login page via fail2ban.
```

---

## Storage Full — Recover Disk Space

NfSen's NetFlow capture files accumulate quickly. When your VPS disk fills up (100%), `docker exec` commands will fail with:

```
OCI runtime exec failed: write /tmp/runc-processXXXXXX: no space left on device
```

And `nfsen stop` will fail because the Unix socket can't be written to:
```
setlogsock(): type='unix': path not available
```

Don't worry — here's how to recover:

### Step 1: Free a few MB to get Docker working again

Run these **host-level** commands (no `docker exec` needed):

```bash
docker system prune -f
docker builder prune -f
```

If that's not enough, also clean system logs:
```bash
sudo journalctl --vacuum-time=1d
sudo rm -f /var/log/syslog.1 /var/log/kern.log.1 2>/dev/null; true
```

Check if you have enough space now:
```bash
df -h /
```

> You only need **~50MB free** for `docker exec` to work again.

---

### Step 2: Stop everything and delete the data

**Method A — Quick (if `docker stop` works):**

```bash
# Stop the entire container (always works — doesn't need the nfsen socket)
docker stop netlens

# Delete the flow data directly from the data folders (bind mounts)
rm -rf nfsen-data/live/*
rm -rf nfsen-stat/live/*
rm -rf nfsen-var/*

# Start fresh
docker start netlens
```

**Method B — Via docker exec (if you already freed some space):**

```bash
# Delete the captured flow data (this frees the most space)
docker exec netlens bash -c "rm -rf /var/nfsen/profiles-data/live/* /var/nfsen/profiles-stat/live/*"

# Truncate logs too
docker exec netlens bash -c "truncate -s 0 /var/nfsen/var/nfsen.log"
```

---

### Step 3: Restart NfSen

Restart the whole container — the entrypoint starts NfSen automatically, no manual daemon handling needed:

```bash
docker restart netlens
```

**The actual start / stop commands:**

```bash
# Stop the app
docker compose down          # stop + release the bind mounts
docker stop netlens       # quick stop (keep the mounts)

# Start the app
sudo docker compose up -d    # start (./install.sh on first install)
docker start netlens      # quick start

# NfSen daemon inside the container
docker exec netlens /var/nfsen/bin/nfsen stop
docker exec netlens /var/nfsen/bin/nfsen start
docker exec netlens /var/nfsen/bin/nfsen status
```

---

### Verify recovery

```bash
# Check disk space
df -h /

# Check NfSen status
docker exec netlens /var/nfsen/bin/nfsen status

# Access Web UI: http://<YOUR_IP>:8070/nfsen.php
```

---

## LibreNMS Integration

Show NetFlow graphs and Top-N statistics from NetLens directly inside [LibreNMS](https://www.librenms.org/) running on a **different machine**.

The full, step-by-step guide covers:

- Sharing `nfsen-data/` and `nfsen-stat/` over **read-only NFS** (one-writer rule)
- Installing **nfdump 1.6.25** on the LibreNMS server to match the container's v1.6 file format (Ubuntu 24.04 ships the incompatible 1.7.3)
- Configuring LibreNMS (`nfsen_enable`, `nfsen_suffix`, `nfsen_subdirlayout`, …) so the **Netflow tab** appears on every device page
- Matching NfSen source names to LibreNMS device hostnames (21-char limit, dots → `_`, IP symlinks)

> **Read the complete guide:** [LibreNMS Integration](https://netlens.rezwan.bro.bd/integration/librenms-integration)

---

## Credits

This project is a Dockerized packaging of two great open-source projects — all credit for the NetFlow analysis itself goes to them:

| Project | What it does | License |
|---|---|---|
| [**NfSen**](https://sourceforge.net/projects/nfsen/) (1.3.6p1) | Web frontend — graphs, details, alerts, profile admin | BSD-3-Clause |
| [**NfDump**](https://github.com/phaag/nfdump) (1.6.17) | NetFlow collection & analysis tools (`nfcapd`, `nfexpire`, …) | BSD-3-Clause |

This repository (the Docker image, entrypoint, login page, configs, and docs) is released under the [BSD-3-Clause](LICENSE) license.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Web UI shows `Can not initialize globals` / `nfsend connect() error: No such file or directory` / `nfsend - connection failed!!` | The nfsend daemon is not running. On the **first start after switching to the data folders (bind mounts)** this means the `live` profile is missing (an empty `nfsen-stat/` folder hides it and NfSen refuses to start). Fix once: `docker compose up -d --build` — the entrypoint re-seeds the profile automatically. Then check `docker logs netlens` for `nfsend .... running` |
| Web UI shows `nfsend connect() error` (daemon was running before) | `docker restart netlens`, or `docker exec netlens /var/nfsen/bin/nfsen stop && docker exec netlens /var/nfsen/bin/nfsen start` |
| Config changes not showing after reconfig | `docker exec netlens /var/nfsen/bin/nfsen stop && docker exec netlens /var/nfsen/bin/nfsen start` (full restart if reconfig didn't work) |
| `Error: missing parameter 'IP' for multiple sources collector` | Add `'IP' => '0.0.0.0'` to all existing sources manually. See [IP Requirement](#important-ip-requirement-for-multiple-sources) |
| `Reconfig: No changes found!` | The source name doesn't exist — check with `docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf` |
| Port already in use | Change Apache port in `docker-compose.yml` |
| Can't access port 8070 | Check firewall: `ufw allow 8070/tcp` |
| NfSen not starting | `docker logs netlens --tail 30`, then `docker restart netlens` |
| `nfsend connect() error` after disk full | Socket is dead. Restart the container: `docker restart netlens` |
| Login page rejects the password you're sure is right | Reset it instantly, no restart: `docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin <newpass>` (file lives at `nfsen-etc/.htpasswd` on the host) |
