---
title: Managing Router Sources
---

# Managing Router Sources

NetLens exposes UDP ports `2055` and `2056` by default. Configure each router to export NetFlow to the VPS address and the matching source port.

## Add a source

The NfSen source identifier is written into the live data directory and becomes part of the RRD name.

```bash
# Reconfigure after changing nfsen.conf
docker exec netlens /var/nfsen/bin/nfsen reconfig

docker compose up -d
```

::: warning Name sources deliberately
NfSen idents are limited to 21 characters. LibreNMS also maps dots in hostnames to its configured split character, so stable short names make integrations much easier.
:::

See [Adding a Router on a New Port](/guide/new-port) when the default ports are already in use.
