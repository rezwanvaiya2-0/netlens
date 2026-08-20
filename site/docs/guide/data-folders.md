---
title: Data Folders & Bind Mounts
---

# Data Folders & Bind Mounts

NetLens stores state in real folders beside `docker-compose.yml`, so data remains inspectable and survives container rebuilds.

| Folder | Container path | Purpose |
| --- | --- | --- |
| `nfsen-data/` | `/var/nfsen/profiles-data` | Raw NetFlow capture files |
| `nfsen-stat/` | `/var/nfsen/profiles-stat` | RRD graph files and charts |
| `nfsen-var/` | `/var/nfsen/var` | Logs, cache, and runtime state |
| `nfsen-etc/` | `/var/nfsen/etc` | Config, sources, and auth files |

## Backup

```bash
tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc
```

::: warning Sensitive configuration
`nfsen-etc/` contains `.htpasswd` and should remain private. Do not export it to LibreNMS or another untrusted host.
:::

::: tip Rebuilds
Data survives restarts and image rebuilds as long as the local folders remain intact. Stop the container before deleting or cleaning them.
:::
