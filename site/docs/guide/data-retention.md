---
title: Data Retention
---

# Data Retention

Open **Profile Admin → live profile → Edit** in the NfSen Web UI. Set the retention window and maximum storage size, then save. The daemon applies the rules in the background.

::: tip Plan from observed volume
Raw flow files are the fast-growing part of the stack. Watch disk usage after the first busy collection window and choose a retention window from observed volume.
:::

Back up before changing or deleting data:

```bash
tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc
```
