---
title: Password Protection
---

# Password Protection

The Web UI uses the `.htpasswd` file inside `nfsen-etc/`.

## Change the admin password

```bash
docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123
```

The change is live without rebuilding the image. Use a strong unique password, restrict port `8070` to trusted networks, and put the dashboard behind a VPN or TLS reverse proxy when it must be accessed remotely.

::: danger Protect `nfsen-etc/`
Never share `nfsen-etc/` over NFS. It contains the Web UI password hashes and configuration.
:::
