
# LibreNMS Integration

Share the NfSen data folders over NFS (read-only) so a LibreNMS server on a **different
  machine** can show NetFlow graphs + Top-N statistics. Written for NetLens (Dockerized NfSen
  1.3.6p1 + NfDump 1.6.17) with a manually installed LibreNMS on Ubuntu.



## Quick Summary

1. **NetLens (Docker) stays on the VPS and keeps writing** to its local folders — no other writer ever touches the live data.
2. **Share only these two folders over NFS, read-only**, to the LibreNMS server:
   - `nfsen-data/` (= container `/var/nfsen/profiles-data` → raw flow files)
   - `nfsen-stat/` (= container `/var/nfsen/profiles-stat` → RRD graph files)
3. **Install nfdump 1.6.25 on the LibreNMS server** to match the container's v1.6 file format. Ubuntu 24.04's default apt package is nfdump 1.7.3, which uses an incompatible format. Nfdump 1.6.17 itself crashes on the Ubuntu 24.04 toolchain, so build 1.6.25 from source. See [Part 3](#5-part-3-install-nfdump-on-the-librenms-server-version-rule).
4. **Tell LibreNMS where the data is** (`lnms config:set`) and the **Netflow tab** appears on every device page.
5. **Never run two NfSen instances writing to the same shared folder.** Ever.

::: danger One writer rule
  Only the Dockerized NfSen on the VPS writes to the data folders. The NFS share is strictly
  read-only for LibreNMS. NfSen uses SysV semaphores that exist *per host* — two instances
  cannot coordinate and will corrupt each other's 5-minute files.
:::

::: tip Read this guide in order
The recommended pattern is **Pattern A**: NetLens remains the only writer, while LibreNMS reads the two exported data folders over NFS. The version, naming, and mount-path rules later in this guide are part of the same integration contract.
:::

## 1 — What LibreNMS actually needs from NfSen

LibreNMS has a built-in **Netflow** tab (still present in current LibreNMS — verified in their source at `includes/html/pages/device/nfsen/`). It needs three things:

**A. The NfSen RRD graph files** — read via the `nfsen_rrds` config
(`profiles-stat/live/<source>.rrd`) → the channel graphs.

**B. The raw flow files** — read via the `nfdump` binary. LibreNMS runs this command on its own server:

```bash
nfdump -M <base>/profiles-data/live/<source> -T -R <range> -n N -s ...
```

So it must be able to see `profiles-data/live/...` **and** have `nfdump` installed. This produces the "Top N" statistics.

**C. Matching names** — the NfSen source (ident) must map to the LibreNMS device hostname (see [section 7](#7-matching-nfsen-sources-to-librenms-devices)).

If LibreNMS runs on a different machine, the cleanest way to give it B and A is an NFS read-only share of the two data folders.

::: info Two data consumers, one writer
LibreNMS consumes the raw files through nfdump and the RRD files through `nfsen_rrds`. These are separate read paths, but both depend on the same NfSen source name and the same read-only NFS mounts.
:::

## 2 — Recommended architecture

```
   Your VPS (Docker NetLens)                  LibreNMS server
   ---------------------------                -----------------
   docker-compose.yml                          LibreNMS web UI
   |-- nfsen-data/  = profiles-data  --NFS(ro)-->  /var/nfsen/profiles-data
   |-- nfsen-stat/  = profiles-stat  --NFS(ro)-->  /var/nfsen/profiles-stat
   |-- nfsen-var/   = logs (NOT shared)
   `-- nfsen-etc/   = config (NOT shared — contains .htpasswd!)

   NfSen writes here          |        LibreNMS READS here (never writes)
   (one writer only)          |        nfdump (1.6.25) reads the flow files
                              v        RRD files render the channel graphs
```

Rule: **NFS share = read-only for the LibreNMS server.** NfSen never reads back from it. This is the "one writer" rule — it can never corrupt data.

### Data flow

<div class="integration-diagram">

<div class="mermaid">
flowchart LR
  subgraph VPS[NetLens VPS]
    R[Router exporters] -->|NetFlow UDP| N[NfSen in Docker]
    N --> D[nfsen-data&lt;br/&gt;raw flow files]
    N --> S[nfsen-stat&lt;br/&gt;RRD graph files]
    N -.-> V[nfsen-var&lt;br/&gt;not shared]
    N -.-> E[nfsen-etc&lt;br/&gt;not shared; contains .htpasswd]
  end
  subgraph L[LibreNMS server]
    M[/var/nfsen/profiles-data&lt;br/&gt;read-only NFS mount/]
    Q[/var/nfsen/profiles-stat&lt;br/&gt;read-only NFS mount/]
    UI[LibreNMS Netflow tab]
    F[nfdump 1.6.25]
  end
  D -->|NFS read-only| M
  S -->|NFS read-only| Q
  M --> F --> UI
  Q --> UI
</div>

</div>

::: info Why not share the other folders?
  We deliberately do **not** export `nfsen-var/` (logs, runtime) or
  `nfsen-etc/` — `nfsen-etc` contains `.htpasswd`, your Web UI
  password hashes.
:::

::: warning Keep the boundary explicit
Only `nfsen-data/` and `nfsen-stat/` cross the NFS boundary. The LibreNMS server reads them; it never writes to them.
:::

## 3 — Part 1: NFS server setup (on the VPS that runs NetLens)

### Step 1 — Install the NFS server

```bash
sudo apt update
sudo apt install -y nfs-kernel-server
```

### Step 2 — Find your project path

```bash
cd /path/to/netlens      # e.g. /root/netlens or /opt/netlens
pwd                      # remember this as <VPS_PROJECT_PATH>
```

### Step 3 — Add the read-only exports

Edit `/etc/exports` and add the following (replace the IP and path):

```bash
<VPS_PROJECT_PATH>/nfsen-data  <LibreNMS_IP>/32(ro,sync,no_subtree_check)
<VPS_PROJECT_PATH>/nfsen-stat  <LibreNMS_IP>/32(ro,sync,no_subtree_check)
```

Example (LibreNMS server = `192.168.1.50`, project in `/root/netlens`):

```bash
/root/netlens/nfsen-data  192.168.1.50/32(ro,sync,no_subtree_check)
/root/netlens/nfsen-stat  192.168.1.50/32(ro,sync,no_subtree_check)
```

- `ro` = read-only (recommended — the LibreNMS server only needs to read).
- If you ever want NfSen to write onto the share instead (alternative pattern, [section 11](#11-alternative-pattern)), change to `rw` + `no_root_squash` then. Not now.

### Step 4 — Activate and verify the exports

```bash
sudo exportfs -rav
sudo systemctl enable --now nfs-server
sudo showmount -e localhost        # you should see the 2 exports
```

### Step 5 — Allow NFS through the firewall

On the cloud VPS and with `ufw`, allow NFS from the LibreNMS IP:

```bash
sudo ufw allow from 103.159.37.199 to any port 111 proto tcp
sudo ufw allow from 103.159.37.199 to any port 2049 proto tcp
sudo ufw allow from 103.159.37.199 to any port 111 proto udp
sudo ufw allow from 103.159.37.199 to any port 2049 proto udp
```

::: info rpcbind port range
  On some cloud providers NFS also uses the rpcbind range (20048+ etc.). If mounting fails,
  temporarily disable ufw to test, then open the ports the error mentions.
:::

## 4 — Part 2: NFS client setup (on the LibreNMS server)

### Step 1 — Install the NFS client

```bash
sudo apt update
sudo apt install -y nfs-common
```

### Step 2 — Create the LibreNMS mount points

**Use the same paths LibreNMS expects**, so no symlinks are needed:

```bash
sudo mkdir -p /var/nfsen/profiles-data /var/nfsen/profiles-stat
```

### Step 3 — Mount the two exports

Replace `<VPS_IP>` and the project path:

```bash
sudo mount -t nfs4 <VPS_IP>:<VPS_PROJECT_PATH>/nfsen-data /var/nfsen/profiles-data
sudo mount -t nfs4 <VPS_IP>:<VPS_PROJECT_PATH>/nfsen-stat /var/nfsen/profiles-stat
```

Example:

```bash
sudo mount -t nfs4 103.187.23.163:/root/netlens/nfsen-data /var/nfsen/profiles-data
sudo mount -t nfs4 103.187.23.163:/root/netlens/nfsen-stat /var/nfsen/profiles-stat
```

### Step 4 — Make the mounts permanent

Append these **two** lines to `/etc/fstab` (each has exactly 6 fields: device, mountpoint, fstype, options, dump, pass):

```bash
<VPS_IP>:<VPS_PROJECT_PATH>/nfsen-data  /var/nfsen/profiles-data  nfs4  ro,soft,timeo=50,retrans=2,_netdev 0 0
<VPS_IP>:<VPS_PROJECT_PATH>/nfsen-stat  /var/nfsen/profiles-stat  nfs4  ro,soft,timeo=50,retrans=2,_netdev 0 0
```

`ro` + `soft` = safe for a monitoring box: if NFS hiccups, LibreNMS just shows "no data" instead of hanging forever. `_netdev` tells systemd to wait for the network before mounting at boot.

::: danger Do not put mount commands in fstab
`/etc/fstab` accepts the six-field mount entries below, not the `sudo mount` commands from Step 3. Mixing them causes a parse error and can prevent the shares from returning after reboot.
:::

::: warning fstab gotchas (all bit us in production)
  <ul>
    <li>Write <strong>only</strong> the two fstab lines above. Do <strong>not</strong> paste the
    <code>sudo mount</code> commands from Step 3 into <code>/etc/fstab</code> — boot then fails with
    <code>/etc/fstab: parse error</code> and the shares never come back.</li>
    <li>Check the file is clean: <code>sudo cat -A /etc/fstab</code> — each line must end with just
    <code>$</code> (no <code>^M</code>/CRLF if you pasted from Windows).</li>
    <li>After a reboot the mounts must be there with plain <code>df -h | grep nfsen</code>. If they are
    gone, run <code>sudo mount -a</code> (should be silent) and re-check fstab.</li>
  </ul>
:::

### Step 5 — Verify the mounted data

```bash
ls /var/nfsen/profiles-data/live/        # should list your sources, e.g. router1
ls /var/nfsen/profiles-stat/live/        # should list .rrd files
```

## 5 — Part 3: Install nfdump on the LibreNMS server (version rule)

LibreNMS runs nfdump against your flow files. **The file format must match the container's nfdump**, otherwise LibreNMS cannot read anything:

- The NetLens container uses **nfdump 1.6.17** (raw flow file format v1.6.x).
- **nfdump 1.7+** writes/reads a new binary format — it **cannot** read 1.6.17 files.
- Ubuntu 24.04's default package is **nfdump 1.7.3 = WRONG**. Do not use it.
- Ubuntu 20.04's apt package is nfdump 1.6.17 = perfect match (only relevant if you ever run LibreNMS on 20.04).

::: warning Do NOT use 1.6.17 on Ubuntu 24.04
  Its argument/range parsing has a stack buffer overflow that 24.04's newer glibc/GCC catches at
  runtime: <code>nfdump -M ... -R .</code> dies with
  `*** buffer overflow detected ***`. **1.6.25** is the last release of the
  1.6.x tree — same v1.6 file format as the container's 1.6.17, but with years of bug fixes.
:::

### Step 1 — Install build dependencies

```bash
sudo apt update
sudo apt install -y build-essential autoconf automake libtool pkg-config \
  flex bison byacc libpcap-dev libbz2-dev
```

### Step 2 — Download and extract nfdump 1.6.25

```bash
cd /tmp
wget https://github.com/phaag/nfdump/archive/v1.6.25.tar.gz
tar xzf v1.6.25.tar.gz
cd nfdump-1.6.25
```

### Step 3 — Build and install

Use the same configure family as the Dockerfile:

```bash
sh ./autogen.sh
./configure --prefix=/usr/local
make -j"$(nproc)"
sudo make install
sudo ldconfig
```

### Step 4 — Verify the installed version

```bash
/usr/local/bin/nfdump -V     # must show: Version: 1.6.25
```

Ignore any `/usr/bin/nfdump` 1.7.3 that apt left behind — LibreNMS will be pointed at `/usr/local/bin/nfdump` (section 6).

### Step 5 — Run a quick read test

This should print flow stats, not an error:

```bash
/usr/local/bin/nfdump -M /var/nfsen/profiles-data/live/router1 -R . -s record/flows | tail -5
```

- The `-M` argument is the **full path to the source directory** (`<base>/profiles-data/live/<source>`).
- `-R` selects the time range. `.` = all files. Without `-R`, nfdump refuses with: `-M needs either -r or -R to specify the file or file list.`
- `-R .` reads **every** file since the beginning — on a busy profile that takes minutes (18M flows took ~40 s in testing). **It is not stuck.** For a fast check use a file range instead:

```bash
/usr/local/bin/nfdump -M /var/nfsen/profiles-data/live/<source> \
  -R 'nfcapd.202608151945:nfcapd.202608151950' -s record/flows | tail -5
```

::: danger Never pass a directory path to -R
  nfdump 1.6.x tries to parse it as a time range and crashes with
  <code>*** buffer overflow detected ***</code>.
:::

If it says "Can't open ... permission denied", fix per [section 9](#9-permissions--ownership).

## 6 — Part 4: Configure LibreNMS

### Step 1 — Set the LibreNMS configuration

Run these as the `librenms` user (or with `sudo -u librenms`):

::: warning Set the compatible binary and flat layout
Point LibreNMS to the nfdump 1.6.25 binary built in Part 3. NetLens stores flat `nfcapd.YYYYMMDDHHMM` files, so `nfsen_subdirlayout` must be `0`; otherwise LibreNMS looks for `YYYY/MM/DD/` subdirectories and finds nothing.
:::

::: danger Never leave `nfsen_suffix` empty
LibreNMS uses this value in a regular-expression check for the RRD. An empty suffix becomes an empty regex and the Netflow tab never appears. `_none` is safe when it does not occur in device hostnames.
:::

```bash
lnms config:set nfsen_enable true
lnms config:set nfsen_split_char '_'
lnms config:set nfsen_base.+ '/var/nfsen/'
lnms config:set nfsen_rrds.+ '/var/nfsen/profiles-stat/live/'
lnms config:set nfsen_rrds.+ '/var/nfsen/profiles-stat'
lnms config:set nfdump /usr/local/bin/nfdump
lnms config:set nfsen_subdirlayout 0
lnms config:set nfsen_suffix '_none'
```

::: warning nfsen_suffix must never be empty
  If your device hostnames include your domain, use the real domain suffix instead of
  <code>_none</code> (the LibreNMS docs' trick):
  <code>lnms config:set nfsen_suffix '_yourdomain_com'</code>.
  Whatever you choose, the value **must be non-empty** — empty = no Netflow tab.
:::

### Step 2 — Open the Netflow tab

Open LibreNMS → **Devices** → click the device → **Netflow** tab at the end of the tab bar under the device header (scroll it sideways if it wraps). Quick test:

```
http://<librenms>/device/device=<id>/tab=netflow/
```

### Step 3 — Diagnose a missing tab

If the tab is missing, work through [section 8](#8-verification-checklist). The three usual causes: `nfsen_enable` not true, `nfsen_suffix` empty, or the RRD file name not matching the device's actual hostname ([section 7](#7-matching-nfsen-sources-to-librenms-devices)).

### Step 4 — Understand the two views

Stats (Top N) use nfdump → your NFS data. Graphs use the RRDs. The **General** view can look empty (it looks for per-channel subfolders this NfSen doesn't create) — the **Stats** view is the one with your flow data.

Tuning knobs (optional, all documented in LibreNMS):

```bash
lnms config:set nfsen_last_default 900
lnms config:set nfsen_top_default 20
lnms config:set nfsen_stats_default srcip
lnms config:set nfsen_order_default packets
lnms config:set nfsen_last_max 153600      # max seconds for stats
```

## 7 — Matching NfSen sources to LibreNMS devices

LibreNMS finds a device's flow data **by name**. The NfSen source (ident) name becomes the RRD filename **and** the directory name under `profiles-data/live/`.

- The NfSen ident must match the LibreNMS device hostname, but:
  - NfSen idents are limited to **21 characters**.
  - Dots (`.`) are not allowed in the same way — LibreNMS replaces `.` with the `nfsen_split_char` (we set `_`).
- Example:

```
LibreNMS device hostname : core-router.example.com  (longer than 21)
NfSen source ident       : core_router_example_com  (dots -> '_', short)
```

LibreNMS will look for the RRD named after the transformed hostname (`nfsen_split_char` = `_`, done above).

**Devices added by IP in LibreNMS:** create **symbolic links** so the IP-based names resolve to the real source. You need **two** — one for the RRD graphs and one for the raw flow data (nfdump stats use it too).

::: warning Create symlinks on the VPS, not on the LibreNMS server
  The NFS exports are **read-only** — the mount rejects writes, so you cannot create
  symlinks on the LibreNMS server. Create them on the VPS inside the project folders (next to
  <code>docker-compose.yml</code>) — they show up on the LibreNMS side through NFS:
:::

```bash
# on the VPS (NetLens host), inside the project folder:
cd /path/to/netlens/nfsen-stat/live
sudo ln -s router1.rrd 192_168_1_50.rrd     # <deviceIP with _>.rrd

cd /path/to/netlens/nfsen-data/live
sudo ln -s router1 192_168_1_50             # data dir for nfdump stats
```

Replace `router1` with the real source that collects that router's traffic, and `192_168_1_50` with the LibreNMS device hostname/IP with `.` replaced by the `nfsen_split_char` (i.e. `_`).

::: danger Use the device's ACTUAL hostname
  Use the hostname exactly as LibreNMS stores it (see the Devices list, or poll log lines like
  <code>device:poll 192.168.1.50</code>). A symlink with the wrong name means the Netflow tab never
  appears — the name must match exactly, e.g. a device polled as <code>103.187.22.1</code> needs
  <code>103_187_22_1.rrd</code>.
:::

On the NfSen side, when you add a real source in `nfsen.conf`, name it to match (see the project README for adding sources):

```perl
'core_router_example_com' => { 'port' => '2070', 'col' => '#FF0000', 'type' => 'netflow' },
```

## 8 — Verification checklist

**On the VPS (NetLens):**

```bash
sudo showmount -e localhost
ls -la nfsen-data/live/ nfsen-stat/live/
```

**On the LibreNMS server:**

```bash
df -h | grep nfsen                    # mounts are up
ls /var/nfsen/profiles-data/live/     # sources + any IP symlinks
ls /var/nfsen/profiles-stat/live/     # .rrd files + any IP symlinks
/usr/local/bin/nfdump -V              # must be 1.6.25
/usr/local/bin/nfdump -M /var/nfsen/profiles-data/live/<source> -R 'nfcapd.<file1>:nfcapd.<file2>' -s record/flows | tail -5
lnms config:get nfsen_enable          # must be true
lnms config:get nfsen_suffix          # must NOT be empty
lnms config:get nfsen_subdirlayout    # must be 0 (flat file layout)
lnms config:get nfsen_rrds            # must list the profiles-stat paths
sudo -u librenms ./validate.php       # LibreNMS self-check (in its install dir)
```

**In the browser:**

- Device page → tab bar (at the end of it) → **Netflow** → Stats view shows Top-N.
- Direct URL test: `http://<librenms>/device/device=<id>/tab=netflow/`

If the tab is missing, run `sudo tail -n 50 /opt/librenms/logs/librenms.log` and check, in order: `nfsen_enable` true? `nfsen_suffix` non-empty? RRD file name matches the device's real hostname (section 7)? The tab only appears when all three are true.

## 9 — Permissions and ownership

Inside the container the users are:

- `netflow` = **uid 1000** (owns `profiles-data/live` — writes flow files)
- `www-data` = **uid 33** (owns `profiles-stat` — writes RRDs)

Over NFS, uid 33 and uid 1000 are just numbers. The live directories are `chmod 775` with `netflow:www-data` ownership, so **any local user** (including www-data/root, which is how LibreNMS runs nfdump) can read them. That is why a read-only export works with no special uid mapping.

If you ever see **Permission denied**:

1. Check perms on the VPS: `ls -la nfsen-data/live/` (expect `drwxrwxr-x`)
2. Check the export flags: `cat /etc/exports` (`ro` is fine for reading)
3. On some setups the export needs: `rw,sync,no_root_squash` (only needed if NfSen itself must write to the share — [section 11](#11-alternative-pattern))

## 10 — Danger zone

::: danger Things that WILL break your data
  <ul>
    <li><strong>Running TWO NfSen instances</strong> that write to the same live folder over NFS. NfSen
    uses SysV semaphores which exist per-host — the two instances cannot coordinate, so they corrupt
    each other's 5-minute files.</li>
    <li><strong>Exporting <code>nfsen-etc/</code></strong> — it contains <code>.htpasswd</code> (Web UI
    password hashes).</li>
    <li><strong>Exporting <code>nfsen-var/</code></strong> — unnecessary (logs, runtime).</li>
    <li><strong>Using the default Ubuntu 24.04 nfdump package (1.7.3)</strong> on the LibreNMS host —
    new file format, cannot read the 1.6.17 files. Build 1.6.25 from source (section 5) and point
    LibreNMS at <code>/usr/local/bin/nfdump</code>.</li>
    <li><strong>Leaving <code>nfsen_suffix</code> empty</strong> in LibreNMS — the tab's RRD check
    builds an empty regex and silently fails, so the Netflow tab never appears.</li>
    <li><strong>Pasting the <code>sudo mount</code> commands into <code>/etc/fstab</code></strong>
    instead of the proper 6-field lines — boot fails to mount the shares ("parse error").</li>
    <li><strong>A slow/unreliable network as the WRITE target for NfSen</strong> — dropped NFS = stuck
    nfcapd writes. For the recommended read-only setup this is a non-issue.</li>
  </ul>
:::

## 11 — Alternative pattern

**Pattern B — NFS as the primary storage for the NfSen data (single writer):**

- Mount the NFS share on the VPS under the project (e.g. replace the `nfsen-data/` folder with an NFS mount to a NAS).
- Docker keeps working unchanged (it's still a bind mount).
- Requirements: export `rw,sync,no_root_squash` (the entrypoint runs chown/chmod as root), the NFS server must be reliable, and the mount must be up before `docker compose up`.
- **Pros:** data survives VPS loss; easy to point multiple read-only consumers (LibreNMS) at the same NAS.
- **Cons:** single point of failure (the NAS) + NFS dependency at boot.

For the goal of this guide (LibreNMS on another server), pattern A (read-only export) is the right choice — no reason to move NfSen's primary storage.

## Summary

- **Goal:** LibreNMS (separate server) shows NetFlow graphs + top-N stats from the Dockerized NfSen.
- **How:** NFS share the two data folders (`nfsen-data` = raw flows, `nfsen-stat` = RRD graphs) **read-only** from the NetLens VPS to the LibreNMS server. NfSen keeps writing locally (one writer rule — never two NfSen instances on the same live data).
- **On the LibreNMS server:** install `nfs-common`, mount the shares at `/var/nfsen/profiles-data` and `/var/nfsen/profiles-stat`, and install **nfdump 1.6.25** (last of the 1.6.x tree) to match the container's v1.6 file format — on Ubuntu 24.04 build it from source, do **not** use 1.6.17 (its range parsing crashes with "buffer overflow detected" on 24.04's toolchain). Then enable the integration with `lnms config:set nfsen_enable true` (+ paths + `nfdump` → `/usr/local/bin/nfdump`).
- **NfSen source names must match LibreNMS device hostnames** (21-char limit, dots → `_`); for devices added by IP create **two symlinks on the VPS** (RRD `.rrd` + data dir) named after the device's real hostname (check the poll log, e.g. `103.187.22.1` → `103_187_22_1.rrd`). The mount is read-only, so the symlinks must be created VPS-side.
- **LibreNMS config that must be right:** `nfsen_enable` true, `nfsen_suffix` non-empty (empty = no tab), `nfsen_subdirlayout` 0 (this NfSen stores flat nfcapd files), `nfsen_rrds` pointing at `profiles-stat`.
- **fstab entries** need `_netdev` and must be proper 6-field lines — pasting the `sudo mount` commands into fstab breaks boot mounting.
- **Never export** `nfsen-etc` (contains `.htpasswd`) or `nfsen-var`.
- Verified against: [LibreNMS docs](https://docs.librenms.org/Extensions/NFSen/) and LibreNMS master source (`nfdump -M <base>/profiles-data/live/<source>`).

## Final verification checklist

Use this final pass after completing the guide. Every item should be true before troubleshooting the LibreNMS UI:

<div class="verification-list">

- [ ] NetLens is the only NfSen instance writing to the live data folders.
- [ ] The VPS exports only `nfsen-data/` and `nfsen-stat/` with `ro,sync,no_subtree_check`.
- [ ] `nfsen-var/` and `nfsen-etc/` are not exported.
- [ ] The LibreNMS server mounts the shares at `/var/nfsen/profiles-data` and `/var/nfsen/profiles-stat`.
- [ ] `/etc/fstab` contains two valid six-field `nfs4` entries with `ro` and `_netdev`.
- [ ] `/usr/local/bin/nfdump -V` reports `1.6.25` on Ubuntu 24.04.
- [ ] `nfsen_enable` is `true` and `nfsen_suffix` is non-empty.
- [ ] `nfsen_subdirlayout` is `0` for NetLens's flat file layout.
- [ ] `nfsen_rrds` points to the mounted `profiles-stat` paths.
- [ ] The NfSen source ident matches the LibreNMS hostname after dot-to-underscore conversion.
- [ ] Devices added by IP have both the RRD and raw-data symlinks created on the VPS.
- [ ] The LibreNMS device page shows **Netflow → Stats** with Top-N data.

</div>
