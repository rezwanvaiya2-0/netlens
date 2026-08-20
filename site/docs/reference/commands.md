---
title: Commands Cheatsheet
---

# Commands Cheatsheet

The quickest copy-paste reference for installing and operating a NetLens deployment. Each command has its own copy button; replace placeholders such as `<YOUR_IP>` before running it.

## Install

Clone the repository and run the installer on a Linux host with Docker and Docker Compose installed.

```bash
git clone https://github.com/rezwanvaiya2-0/netlens.git
```

```bash
cd netlens
```

```bash
sudo ./install.sh
```

Open the dashboard at `http://<YOUR_IP>:8070/nfsen.php` after the first build completes.

## Manage the stack

```bash
docker compose up -d
```

```bash
docker compose restart
```

```bash
docker compose down
```

```bash
docker compose down -v
```

::: warning Bind mounts are persistent
`docker compose down -v` does not remove the four local bind-mounted folders. Deleting `nfsen-data/`, `nfsen-stat/`, `nfsen-var/`, or `nfsen-etc/` does remove persistent state.
:::

## Status and logs

```bash
docker compose ps
```

```bash
docker logs --tail=100 netlens
```

```bash
docker logs -f netlens
```

```bash
sudo ss -lunp | grep -E '2055|2056|2070'
```

```bash
docker inspect --format '{{.State.Status}}' netlens
```

## Manage sources

After changing `/var/nfsen/etc/nfsen.conf`, ask NfSen to reload its source configuration.

```bash
docker exec netlens /var/nfsen/bin/nfsen reconfig
```

```bash
docker compose up -d
```

For a new exporter port, publish the UDP port in `docker-compose.yml` first, then add the source entry and reconfigure. See [Adding a Router on a New Port](/guide/new-port).

## Password

Change the default Web UI password without rebuilding the container.

```bash
docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123
```

::: danger Change the default immediately
Use a strong unique password. Keep `nfsen-etc/` private because it contains `.htpasswd` and other configuration.
:::

## Inspect data

```bash
find nfsen-data/live -maxdepth 2 -type f | head
```

```bash
ls -la nfsen-data/live/
```

```bash
ls -la nfsen-stat/live/
```

```bash
du -sh nfsen-data nfsen-stat nfsen-var nfsen-etc
```

```bash
find nfsen-data/live -maxdepth 1 -mindepth 1 -type d -printf '%f\n'
```

## Backup and restore

Back up all four folders to preserve captured flows, graphs, runtime state, and configuration.

```bash
tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc
```

```bash
tar xzf nfsen-backup.tar.gz
```

```bash
docker compose stop
```

```bash
docker compose start
```

::: tip Backup boundary
Keep the archive private. `nfsen-etc/` contains Web UI password hashes, while `nfsen-data/` contains the collected network-flow history.
:::

## Retention and disk usage

Check disk usage before changing retention in **Profile Admin → live profile → Edit**.

```bash
df -h .
```

```bash
du -sh nfsen-data nfsen-stat
```

## LibreNMS and NFS checks

Use these on the NetLens VPS when following the [LibreNMS integration guide](/integration/librenms).

```bash
sudo showmount -e localhost
```

```bash
ls -la nfsen-data/live/ nfsen-stat/live/
```

```bash
sudo exportfs -rav
```

On the LibreNMS server, verify the read-only mounts and matching nfdump version:

```bash
df -h | grep nfsen
```

```bash
ls /var/nfsen/profiles-data/live/
```

```bash
/usr/local/bin/nfdump -V
```

```bash
lnms config:get nfsen_enable
```

```bash
lnms config:get nfsen_suffix
```

::: warning Version compatibility
The NetLens container writes the v1.6 flow format. On Ubuntu 24.04, build nfdump 1.6.25 from source and configure LibreNMS to use `/usr/local/bin/nfdump`; do not use the default 1.7.3 package.
:::
