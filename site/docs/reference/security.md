---
title: Security Notes
---

# Security Notes

- Change the default Web UI password immediately.
- Restrict TCP `8070` and exporter UDP ports to trusted networks where possible.
- Keep `nfsen-etc/` private; it contains `.htpasswd` and configuration.
- For LibreNMS, export only `nfsen-data/` and `nfsen-stat/` read-only.
- Never run two NfSen instances writing to the same live folder.
- Use a VPN or TLS reverse proxy for remote dashboard access.
- Do not use the default Ubuntu 24.04 nfdump `1.7.3` package to read NetLens `1.6.x` flow files. Follow the [LibreNMS version guidance](/integration/librenms#5--part-3-install-nfdump-on-the-librenms-server-version-rule).

::: danger One writer rule
NfSen uses SysV semaphores that exist per host. Two instances cannot coordinate over a shared folder and can corrupt each other's five-minute files.
:::
