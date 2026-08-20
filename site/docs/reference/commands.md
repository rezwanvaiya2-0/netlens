---
title: Commands Cheatsheet
---

# Commands Cheatsheet

Common commands for inspecting and operating a running NetLens deployment.

## Service lifecycle

```bash
docker compose ps
docker compose up -d
docker compose restart
docker compose down
docker logs --tail=100 netlens
```

## Password and NfSen configuration

```bash
docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123
docker exec netlens /var/nfsen/bin/nfsen reconfig
docker exec netlens /var/nfsen/bin/nfsen status
```

## Inspect captured data

```bash
find nfsen-data/live -maxdepth 2 -type f | head
ls -la nfsen-data/live/
ls -la nfsen-stat/live/
du -sh nfsen-data nfsen-stat nfsen-var nfsen-etc
```

## Backup and restore

```bash
tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc
tar xzf nfsen-backup.tar.gz
```

::: warning Check before deleting
The four folders are the persistent state. Stop the container before cleaning them, and keep a backup if the data matters.
:::
