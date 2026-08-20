---
title: Troubleshooting
---

# Troubleshooting

## No flow files

1. Confirm the router exports NetFlow v5, v9, or IPFIX to the host IP.
2. Confirm the UDP port is published and allowed by the firewall.
3. Check the source port in `nfsen.conf` and reconfigure.
4. Inspect the container logs and live data folder.

```bash
docker compose ps
docker logs --tail=100 netlens
find nfsen-data/live -maxdepth 2 -type f | head
```

## Dashboard or graphs are empty

Check that the container is healthy, the source is selected in the live profile, and `nfsen-stat/live/` contains RRD files. Do not delete bind-mounted folders during a rebuild.

## LibreNMS shows no Netflow tab

Use the [LibreNMS integration verification checklist](/integration/librenms#8--verification-checklist). Common causes include an empty `nfsen_suffix`, a wrong source/device name, incorrect `nfsen_subdirlayout`, or an nfdump version mismatch.

## Inspect the service

```bash
docker compose ps
docker logs --tail=100 netlens
sudo ss -lunp | grep -E '2055|2056'
```
