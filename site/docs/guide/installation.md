---
title: Installation
---

# Installation

Deploy NetLens on a Linux VPS or host with Docker Engine and the Docker Compose plugin.

## 1. Clone and start

```bash
git clone https://github.com/rezwanvaiya2-0/netlens.git
cd netlens
sudo ./install.sh
```

The first build takes longer. Later starts use the existing image and bind-mounted folders.

## 2. Open the dashboard

Visit `http://<YOUR_IP>:8070/nfsen.php`.

| Field | Default |
| --- | --- |
| Username | `admin` |
| Password | `change-me-now` |
| Web UI | `http://<YOUR_IP>:8070/nfsen.php` |

::: danger Change the password immediately
```bash
docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123
```
:::

## 3. Verify the service

```bash
docker compose ps
docker logs --tail=50 netlens
ss -lunp | grep -E '2055|2056|8070'
```

::: warning Firewall
Allow the selected UDP exporter ports and TCP `8070` in both the cloud firewall and the host firewall.
:::

Continue with [Data Folders & Bind Mounts](/guide/data-folders), then configure a source.
