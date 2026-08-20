---
title: Adding a Router on a New Port
---

# Adding a Router on a New Port

Publish the UDP port, add a matching source in `nfsen.conf`, reconfigure, and restart the stack.

## 1. Publish the port

```yaml
services:
  netlens:
    ports:
      - "2070:2070/udp"
```

## 2. Add the source

Add a source entry such as:

```perl
'myrouter' => { 'port' => '2070', 'col' => '#FF0000', 'type' => 'netflow' },
```

Then reconfigure and restart:

```bash
docker exec netlens /var/nfsen/bin/nfsen reconfig
docker compose up -d
```

## 3. Verify

```bash
docker logs --tail=100 netlens
find nfsen-data/live -maxdepth 2 -type f | head
```

::: tip Firewall
Open the new UDP port in the VPS firewall and cloud security group. The router must send to the VPS public or reachable address.
:::
