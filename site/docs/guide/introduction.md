---
title: Introduction
---

# Introduction

NetLens is a Dockerized packaging of **NfSen 1.3.6p1** and **NfDump 1.6.17**. It receives NetFlow traffic from network devices, writes flow files to local storage, and exposes the NfSen web interface on port `8070`.

## The operating model

- Routers export NetFlow v5, v9, or IPFIX over UDP.
- The NetLens container captures each source with `nfcapd`.
- NfSen creates RRD graphs and traffic summaries.
- The Web UI provides profiles, graphs, Top-N views, and retention controls.

::: tip One writer
Keep NfSen writing to local bind-mounted folders on the NetLens host. When integrating LibreNMS, share only the data folders read-only and never run a second NfSen writer against the same live data.
:::

## Next steps

1. Follow [Installation](/guide/installation).
2. Review [Data Folders & Bind Mounts](/guide/data-folders).
3. Add your first exporter using [Managing Router Sources](/guide/router-sources).
