import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import {
  ArchitectureDiagram,
  LibreNMSDataFlow,
  NfdumpExplain,
} from "@/components/librenms-diagrams";

export const metadata: Metadata = {
  title: "LibreNMS Integration",
  description:
    "Share the NfSen data folders over NFS (read-only) and show NetFlow graphs + Top-N stats inside LibreNMS — the complete step-by-step guide for NetLens.",
};

export default function LibreNMSIntegrationPage() {
  return (
    <DocsPageLayout href="/integration/librenms-integration">
      <PageHeader
        kicker="Integration"
        title="LibreNMS Integration"
        description="Share the NfSen data folders over NFS (read-only) so a LibreNMS server on a different machine can show NetFlow graphs + Top-N statistics. Written for NetLens (Dockerized NfSen 1.3.6p1 + NfDump 1.6.17) with a manually installed LibreNMS on Ubuntu."
      />

      <div className="docs">
        <h2>0 — At a glance (TL;DR)</h2>
        <ol>
          <li>
            <strong>NetLens (Docker) stays on the VPS and keeps writing</strong>{" "}
            to its local folders — no other writer ever touches the live data.
          </li>
          <li>
            <strong>Share only these two folders over NFS, read-only</strong>,
            to the LibreNMS server:
            <ul>
              <li>
                <code>nfsen-data/</code> (= container{" "}
                <code>/var/nfsen/profiles-data</code> → raw flow files)
              </li>
              <li>
                <code>nfsen-stat/</code> (= container{" "}
                <code>/var/nfsen/profiles-stat</code> → RRD graph files)
              </li>
            </ul>
          </li>
          <li>
            <strong>Install nfdump 1.6.25 on the LibreNMS server</strong> to
            match the container's v1.6 file format. Ubuntu 24.04's default apt
            package is nfdump 1.7.3 — an incompatible format — and 1.6.17
            itself crashes on 24.04's toolchain, so build 1.6.25 from source.{" "}
            <a href="#5-part-3-install-nfdump-on-the-librenms-server">
              See Part 3
            </a>
            .
          </li>
          <li>
            <strong>Tell LibreNMS where the data is</strong> ({" "}
            <code>lnms config:set</code>) and the <strong>Netflow tab</strong>{" "}
            appears on every device page.
          </li>
          <li>
            <strong>Never run two NfSen instances writing to the same shared
            folder.</strong> Ever.
          </li>
        </ol>

        <Callout type="danger" title="One writer rule">
          Only the Dockerized NfSen on the VPS writes to the data folders. The
          NFS share is strictly read-only for LibreNMS. NfSen uses SysV
          semaphores that exist <em>per host</em> — two instances cannot
          coordinate and will corrupt each other's 5-minute files.
        </Callout>

        <Callout type="info" title="Read this guide in order">
          The recommended pattern is <strong>Pattern A</strong>: NetLens
          remains the only writer, while LibreNMS reads the two exported data
          folders over NFS. The version, naming, and mount-path rules later in
          this guide are part of the same integration contract.
        </Callout>

        <h2>1 — What LibreNMS actually needs from NfSen</h2>
        <p>
          LibreNMS has a built-in <strong>Netflow</strong> tab (still present
          in current LibreNMS — verified in their source at{" "}
          <code>includes/html/pages/device/nfsen/</code>). It needs three
          things:
        </p>
        <p>
          <strong>A. The NfSen RRD graph files</strong> — read via the{" "}
          <code>nfsen_rrds</code> config (<code>profiles-stat/live/&lt;source&gt;.rrd</code>)
          → the channel graphs.
        </p>
        <p>
          <strong>B. The raw flow files</strong> — read via the{" "}
          <code>nfdump</code> binary. LibreNMS runs this command on its own
          server:
        </p>
        <NfdumpExplain />
        <p>
          So it must be able to see <code>profiles-data/live/...</code>{" "}
          <strong>and</strong> have <code>nfdump</code> installed. This
          produces the "Top N" statistics.
        </p>
        <p>
          <strong>C. Matching names</strong> — the NfSen source (ident) must
          map to the LibreNMS device hostname (see{" "}
          <a href="#7-matching-nfsen-sources-to-librenms-devices">Part 7</a>).
        </p>
        <p>
          If LibreNMS runs on a different machine, the cleanest way to give it
          B and A is an NFS read-only share of the two data folders.
        </p>

        <Callout type="info" title="Two data consumers, one writer">
          LibreNMS consumes the raw files through nfdump and the RRD files
          through <code>nfsen_rrds</code>. These are separate read paths, but
          both depend on the same NfSen source name and the same read-only NFS
          mounts.
        </Callout>

        <h2>2 — Recommended architecture</h2>
        <ArchitectureDiagram />
        <p>
          Rule: <strong>NFS share = read-only for the LibreNMS server.</strong>{" "}
          NfSen never reads back from it. This is the "one writer" rule — it
          can never corrupt data.
        </p>

        <h3>Data flow</h3>
        <LibreNMSDataFlow />

        <Callout type="info" title="Why not share the other folders?">
          We deliberately do <strong>not</strong> export{" "}
          <code>nfsen-var/</code> (logs, runtime) or <code>nfsen-etc/</code> —
          <code>nfsen-etc</code> contains <code>.htpasswd</code>, your Web UI
          password hashes.
        </Callout>

        <Callout type="warn" title="Keep the boundary explicit">
          Only <code>nfsen-data/</code> and <code>nfsen-stat/</code> cross the
          NFS boundary. The LibreNMS server reads them; it never writes to
          them.
        </Callout>

        <h2 id="3-part-1-nfs-server-setup">3 — Part 1: NFS server setup (on the VPS that runs NetLens)</h2>

        <h3>Step 1 — Install the NFS server</h3>
        <CodeBlock
          lang="bash"
          title="install nfs server"
          code={`sudo apt update
sudo apt install -y nfs-kernel-server`}
        />

        <h3>Step 2 — Find your project path</h3>
        <CodeBlock
          lang="bash"
          title="find project path"
          code={`cd /path/to/netlens      # e.g. /root/netlens or /opt/netlens
pwd                      # remember this as <VPS_PROJECT_PATH>`}
        />

        <h3>Step 3 — Add the read-only exports</h3>
        <p>
          Edit <code>/etc/exports</code> and add the following (replace the IP
          and path):
        </p>
        <CodeBlock
          lang="bash"
          title="/etc/exports"
          code={`<VPS_PROJECT_PATH>/nfsen-data  <LibreNMS_IP>/32(ro,sync,no_subtree_check)
<VPS_PROJECT_PATH>/nfsen-stat  <LibreNMS_IP>/32(ro,sync,no_subtree_check)`}
        />
        <p>
          Example (LibreNMS server = <code>192.168.1.50</code>, project in{" "}
          <code>/root/netlens</code>):
        </p>
        <CodeBlock
          lang="bash"
          title="example"
          code={`/root/netlens/nfsen-data  192.168.1.50/32(ro,sync,no_subtree_check)
/root/netlens/nfsen-stat  192.168.1.50/32(ro,sync,no_subtree_check)`}
        />
        <ul>
          <li>
            <code>ro</code> = read-only (recommended — the LibreNMS server only
            needs to read).
          </li>
          <li>
            If you ever want NfSen to write onto the share instead (alternative
            pattern, <a href="#11-alternative-pattern">Part 11</a>), change to{" "}
            <code>rw</code> + <code>no_root_squash</code> then. Not now.
          </li>
        </ul>

        <h3>Step 4 — Activate and verify the exports</h3>
        <CodeBlock
          lang="bash"
          title="activate"
          code={`sudo exportfs -rav
sudo systemctl enable --now nfs-server
sudo showmount -e localhost        # you should see the 2 exports`}
        />

        <h3>Step 5 — Allow NFS through the firewall</h3>
        <p>On the cloud VPS and with <code>ufw</code>, allow NFS from the LibreNMS IP:</p>
        <CodeBlock
          lang="bash"
          title="ufw rules"
          code={`sudo ufw allow from 127.0.0.1 to any port 111 proto tcp
sudo ufw allow from 127.0.0.1 to any port 2049 proto tcp
sudo ufw allow from 127.0.0.1 to any port 111 proto udp
sudo ufw allow from 127.0.0.1 to any port 2049 proto udp`}
        />

        <Callout type="info" title="rpcbind port range">
          On some cloud providers NFS also uses the rpcbind range (20048+ etc.).
          If mounting fails, temporarily disable ufw to test, then open the
          ports the error mentions.
        </Callout>

        <h2>4 — Part 2: NFS client setup (on the LibreNMS server)</h2>

        <h3>Step 1 — Install the NFS client</h3>
        <CodeBlock
          lang="bash"
          title="install nfs client"
          code={`sudo apt update
sudo apt install -y nfs-common`}
        />

        <h3>Step 2 — Create the LibreNMS mount points</h3>
        <p>
          <strong>Use the same paths LibreNMS expects</strong>, so no symlinks
          are needed:
        </p>
        <CodeBlock
          lang="bash"
          title="mount points"
          code={`sudo mkdir -p /var/nfsen/profiles-data /var/nfsen/profiles-stat`}
        />

        <h3>Step 3 — Mount the two exports</h3>
        <p>Replace <code>&lt;VPS_IP&gt;</code> and the project path:</p>
        <CodeBlock
          lang="bash"
          title="mount"
          code={`sudo mount -t nfs4 <VPS_IP>:<VPS_PROJECT_PATH>/nfsen-data /var/nfsen/profiles-data
sudo mount -t nfs4 <VPS_IP>:<VPS_PROJECT_PATH>/nfsen-stat /var/nfsen/profiles-stat`}
        />
        <p>Example:</p>
        <CodeBlock
          lang="bash"
          title="mount example"
          code={`sudo mount -t nfs4 127.0.0.1:/root/netlens/nfsen-data /var/nfsen/profiles-data
sudo mount -t nfs4 127.0.0.1:/root/netlens/nfsen-stat /var/nfsen/profiles-stat`}
        />

        <h3>Step 4 — Make the mounts permanent</h3>
        <p>
          Append these <strong>two</strong> lines to <code>/etc/fstab</code>{" "}
          (each has exactly 6 fields: device, mountpoint, fstype, options,
          dump, pass):
        </p>
        <CodeBlock
          lang="bash"
          title="/etc/fstab"
          code={`<VPS_IP>:<VPS_PROJECT_PATH>/nfsen-data  /var/nfsen/profiles-data  nfs4  ro,soft,timeo=50,retrans=2,_netdev 0 0
<VPS_IP>:<VPS_PROJECT_PATH>/nfsen-stat  /var/nfsen/profiles-stat  nfs4  ro,soft,timeo=50,retrans=2,_netdev 0 0`}
        />
        <p>
          <code>ro</code> + <code>soft</code> = safe for a monitoring box: if
          NFS hiccups, LibreNMS just shows "no data" instead of hanging
          forever. <code>_netdev</code> tells systemd to wait for the network
          before mounting at boot.
        </p>

        <Callout type="danger" title="Do not put mount commands in fstab">
          <code>/etc/fstab</code> accepts the six-field mount entries below,
          not the <code>sudo mount</code> commands from Step 3. Mixing them
          causes a parse error and can prevent the shares from returning after
          reboot.
        </Callout>

        <Callout type="warn" title="fstab gotchas (all bit us in production)">
          <ul>
            <li>
              Write <strong>only</strong> the two fstab lines above. Do{" "}
              <strong>not</strong> paste the <code>sudo mount</code> commands
              from Step 3 into <code>/etc/fstab</code> — boot then fails with{" "}
              <code>/etc/fstab: parse error</code> and the shares never come
              back.
            </li>
            <li>
              Check the file is clean: <code>sudo cat -A /etc/fstab</code> —
              each line must end with just <code>$</code> (no <code>^M</code>
              /CRLF if you pasted from Windows).
            </li>
            <li>
              After a reboot the mounts must be there with plain{" "}
              <code>df -h | grep nfsen</code>. If they are gone, run{" "}
              <code>sudo mount -a</code> (should be silent) and re-check fstab.
            </li>
          </ul>
        </Callout>

        <h3>Step 5 — Verify the mounted data</h3>
        <CodeBlock
          lang="bash"
          title="verify mounts"
          code={`ls /var/nfsen/profiles-data/live/        # should list your sources, e.g. router1
ls /var/nfsen/profiles-stat/live/        # should list .rrd files`}
        />

        <h2 id="5-part-3-install-nfdump-on-the-librenms-server">
          5 — Part 3: Install nfdump on the LibreNMS server (version rule)
        </h2>
        <p>
          LibreNMS runs nfdump against your flow files.{" "}
          <strong>The file format must match the container's nfdump</strong>,
          otherwise LibreNMS cannot read anything:
        </p>
        <ul>
          <li>
            The NetLens container uses <strong>nfdump 1.6.17</strong> (raw flow
            file format v1.6.x).
          </li>
          <li>
            <strong>nfdump 1.7+</strong> writes/reads a new binary format — it{" "}
            <strong>cannot</strong> read 1.6.17 files.
          </li>
          <li>
            Ubuntu 24.04's default package is <strong>nfdump 1.7.3 = WRONG</strong>.
            Do not use it.
          </li>
          <li>
            Ubuntu 20.04's apt package is nfdump 1.6.17 = perfect match (only
            relevant if you ever run LibreNMS on 20.04).
          </li>
        </ul>

        <Callout type="warn" title="Do NOT use 1.6.17 on Ubuntu 24.04">
          Its argument/range parsing has a stack buffer overflow that 24.04's
          newer glibc/GCC catches at runtime:{" "}
          <code>nfdump -M ... -R .</code> dies with{" "}
          <code>*** buffer overflow detected ***</code>. <strong>1.6.25</strong>{" "}
          is the last release of the 1.6.x tree — same v1.6 file format as the
          container's 1.6.17, but with years of bug fixes.
        </Callout>

        <h3>Step 1 — Install build dependencies</h3>
        <CodeBlock
          lang="bash"
          title="deps"
          code={`sudo apt update
sudo apt install -y build-essential autoconf automake libtool pkg-config \\
  flex bison byacc libpcap-dev libbz2-dev`}
        />

        <h3>Step 2 — Download and extract nfdump 1.6.25</h3>
        <CodeBlock
          lang="bash"
          title="download"
          code={`cd /tmp
wget https://github.com/phaag/nfdump/archive/v1.6.25.tar.gz
tar xzf v1.6.25.tar.gz
cd nfdump-1.6.25`}
        />

        <h3>Step 3 — Build and install</h3>
        <p>Use the same configure family as the Dockerfile:</p>
        <CodeBlock
          lang="bash"
          title="build"
          code={`sh ./autogen.sh
./configure --prefix=/usr/local
make -j"$(nproc)"
sudo make install
sudo ldconfig`}
        />

        <h3>Step 4 — Verify the installed version</h3>
        <CodeBlock
          lang="bash"
          title="verify version"
          code={`/usr/local/bin/nfdump -V     # must show: Version: 1.6.25`}
        />
        <p>
          Ignore any <code>/usr/bin/nfdump</code> 1.7.3 that apt left behind —
          LibreNMS will be pointed at <code>/usr/local/bin/nfdump</code> (Part
          6).
        </p>

        <h3>Step 5 — Run a quick read test</h3>
        <p>This should print flow stats, not an error:</p>
        <CodeBlock
          lang="bash"
          title="read test"
          code={`/usr/local/bin/nfdump -M /var/nfsen/profiles-data/live/router1 -R . -s record/flows | tail -5`}
        />
        <ul>
          <li>
            The <code>-M</code> argument is the <strong>full path to the source
            directory</strong> (<code>&lt;base&gt;/profiles-data/live/&lt;source&gt;</code>).
          </li>
          <li>
            <code>-R</code> selects the time range. <code>.</code> = all files.
            Without <code>-R</code>, nfdump refuses with:{" "}
            <code>-M needs either -r or -R to specify the file or file list.</code>
          </li>
          <li>
            <code>-R .</code> reads <strong>every</strong> file since the
            beginning — on a busy profile that takes minutes (18M flows took
            ~40 s in testing). <strong>It is not stuck.</strong> For a fast
            check use a file range instead:
          </li>
        </ul>
        <CodeBlock
          lang="bash"
          title="fast check"
          code={`/usr/local/bin/nfdump -M /var/nfsen/profiles-data/live/<source> \\
  -R 'nfcapd.202608151945:nfcapd.202608151950' -s record/flows | tail -5`}
        />

        <Callout type="danger" title="Never pass a directory path to -R">
          nfdump 1.6.x tries to parse it as a time range and crashes with{" "}
          <code>*** buffer overflow detected ***</code>.
        </Callout>

        <p>
          If it says "Can't open ... permission denied", fix per{" "}
          <a href="#9-permissions-and-ownership">Part 9</a>.
        </p>

        <h2>6 — Part 4: Configure LibreNMS</h2>

        <h3>Step 1 — Set the LibreNMS configuration</h3>
        <p>
          Run these as the <code>librenms</code> user (or with{" "}
          <code>sudo -u librenms</code>):
        </p>

        <Callout type="warn" title="Set the compatible binary and flat layout">
          Point LibreNMS to the nfdump 1.6.25 binary built in Part 3. NetLens
          stores flat <code>nfcapd.YYYYMMDDHHMM</code> files, so{" "}
          <code>nfsen_subdirlayout</code> must be <code>0</code>; otherwise
          LibreNMS looks for <code>YYYY/MM/DD/</code> subdirectories and finds
          nothing.
        </Callout>

        <Callout type="danger" title="Never leave nfsen_suffix empty">
          LibreNMS uses this value in a regular-expression check for the RRD.
          An empty suffix becomes an empty regex and the Netflow tab never
          appears. <code>_none</code> is safe when it does not occur in device
          hostnames.
        </Callout>

        <CodeBlock
          lang="bash"
          title="lnms config:set"
          code={`lnms config:set nfsen_enable true
lnms config:set nfsen_split_char '_'
lnms config:set nfsen_base.+ '/var/nfsen/'
lnms config:set nfsen_rrds.+ '/var/nfsen/profiles-stat/live/'
lnms config:set nfsen_rrds.+ '/var/nfsen/profiles-stat'
lnms config:set nfdump /usr/local/bin/nfdump   # the 1.6.25 we built (NOT /usr/bin/nfdump = 1.7.3)
lnms config:set nfsen_subdirlayout 0           # flat file layout - this NfSen stores
                                               # nfcapd.YYYYMMDDHHMM files with no
                                               # YYYY/MM/DD/ subdirs. Without 0,
                                               # LibreNMS finds nothing.
lnms config:set nfsen_suffix '_none'           # REQUIRED, never leave empty`}
        />

        <Callout type="warn" title="nfsen_suffix must never be empty">
          If your device hostnames include your domain, use the real domain
          suffix instead of <code>_none</code> (the LibreNMS docs' trick):{" "}
          <code>lnms config:set nfsen_suffix '_yourdomain_com'</code>.
          Whatever you choose, the value <strong>must be non-empty</strong> —
          empty = no Netflow tab.
        </Callout>

        <h3>Step 2 — Open the Netflow tab</h3>
        <p>
          Open LibreNMS → <strong>Devices</strong> → click the device →{" "}
          <strong>Netflow</strong> tab at the end of the tab bar under the
          device header (scroll it sideways if it wraps). Quick test:
        </p>
        <CodeBlock
          lang="text"
          title="direct URL"
          code={`http://<librenms>/device/device=<id>/tab=netflow/`}
        />

        <h3>Step 3 — Diagnose a missing tab</h3>
        <p>
          If the tab is missing, work through{" "}
          <a href="#8-verification-checklist">Part 8</a>. The three usual
          causes: <code>nfsen_enable</code> not true,{" "}
          <code>nfsen_suffix</code> empty, or the RRD file name not matching
          the device's actual hostname ({" "}
          <a href="#7-matching-nfsen-sources-to-librenms-devices">Part 7</a>).
        </p>

        <h3>Step 4 — Understand the two views</h3>
        <p>
          Stats (Top N) use nfdump → your NFS data. Graphs use the RRDs. The{" "}
          <strong>General</strong> view can look empty (it looks for
          per-channel subfolders this NfSen doesn't create) — the{" "}
          <strong>Stats</strong> view is the one with your flow data.
        </p>
        <p>Tuning knobs (optional, all documented in LibreNMS):</p>
        <CodeBlock
          lang="bash"
          title="tuning"
          code={`lnms config:set nfsen_last_default 900
lnms config:set nfsen_top_default 20
lnms config:set nfsen_stats_default srcip
lnms config:set nfsen_order_default packets
lnms config:set nfsen_last_max 153600      # max seconds for stats`}
        />

        <h2 id="7-matching-nfsen-sources-to-librenms-devices">
          7 — Matching NfSen sources to LibreNMS devices
        </h2>
        <p>
          LibreNMS finds a device's flow data <strong>by name</strong>. The
          NfSen source (ident) name becomes the RRD filename{" "}
          <strong>and</strong> the directory name under{" "}
          <code>profiles-data/live/</code>.
        </p>
        <ul>
          <li>
            The NfSen ident must match the LibreNMS device hostname, but:
            <ul>
              <li>NfSen idents are limited to <strong>21 characters</strong>.</li>
              <li>
                Dots (<code>.</code>) are not allowed in the same way — LibreNMS
                replaces <code>.</code> with the <code>nfsen_split_char</code>{" "}
                (we set <code>_</code>).
              </li>
            </ul>
          </li>
          <li>Example:</li>
        </ul>
        <CodeBlock
          lang="text"
          title="name mapping"
          code={`LibreNMS device hostname : core-router.example.com  (longer than 21)
NfSen source ident       : core_router_example_com  (dots -> '_', short)`}
        />
        <p>
          LibreNMS will look for the RRD named after the transformed hostname (
          <code>nfsen_split_char</code> = <code>_</code>, done above).
        </p>
        <p>
          <strong>Devices added by IP in LibreNMS:</strong> create{" "}
          <strong>symbolic links</strong> so the IP-based names resolve to the
          real source. You need <strong>two</strong> — one for the RRD graphs
          and one for the raw flow data (nfdump stats use it too).
        </p>

        <Callout type="warn" title="Create symlinks on the VPS, not on the LibreNMS server">
          The NFS exports are <strong>read-only</strong> — the mount rejects
          writes, so you cannot create symlinks on the LibreNMS server. Create
          them on the VPS inside the project folders (next to{" "}
          <code>docker-compose.yml</code>) — they show up on the LibreNMS side
          through NFS:
        </Callout>

        <CodeBlock
          lang="bash"
          title="create symlinks (on the VPS)"
          code={`# on the VPS (NetLens host), inside the project folder:
cd /path/to/netlens/nfsen-stat/live
sudo ln -s router1.rrd 192_168_1_50.rrd     # <deviceIP with _>.rrd

cd /path/to/netlens/nfsen-data/live
sudo ln -s router1 192_168_1_50             # data dir for nfdump stats`}
        />
        <p>
          Replace <code>router1</code> with the real source that collects that
          router's traffic, and <code>192_168_1_50</code> with the LibreNMS
          device hostname/IP with <code>.</code> replaced by the{" "}
          <code>nfsen_split_char</code> (i.e. <code>_</code>).
        </p>

        <Callout type="danger" title="Use the device's ACTUAL hostname">
          Use the hostname exactly as LibreNMS stores it (see the Devices list,
          or poll log lines like <code>device:poll 192.168.1.50</code>). A
          symlink with the wrong name means the Netflow tab never appears — the
          name must match exactly, e.g. a device polled as{" "}
          <code>127.0.0.1</code> needs <code>127_0_0_1.rrd</code>.
        </Callout>

        <p>
          On the NfSen side, when you add a real source in{" "}
          <code>nfsen.conf</code>, name it to match (see the project README for
          adding sources):
        </p>
        <CodeBlock
          lang="perl"
          title="nfsen.conf source"
          code={`'core_router_example_com' => { 'port' => '2070', 'col' => '#FF0000', 'type' => 'netflow' },`}
        />

        <h2 id="8-verification-checklist">8 — Verification checklist</h2>
        <p>
          <strong>On the VPS (NetLens):</strong>
        </p>
        <CodeBlock
          lang="bash"
          title="verify VPS"
          code={`sudo showmount -e localhost
ls -la nfsen-data/live/ nfsen-stat/live/`}
        />
        <p>
          <strong>On the LibreNMS server:</strong>
        </p>
        <CodeBlock
          lang="bash"
          title="verify LibreNMS"
          code={`df -h | grep nfsen                    # mounts are up
ls /var/nfsen/profiles-data/live/     # sources + any IP symlinks
ls /var/nfsen/profiles-stat/live/     # .rrd files + any IP symlinks
/usr/local/bin/nfdump -V              # must be 1.6.25
/usr/local/bin/nfdump -M /var/nfsen/profiles-data/live/<source> -R 'nfcapd.<file1>:nfcapd.<file2>' -s record/flows | tail -5
lnms config:get nfsen_enable          # must be true
lnms config:get nfsen_suffix          # must NOT be empty
lnms config:get nfsen_subdirlayout    # must be 0 (flat file layout)
lnms config:get nfsen_rrds            # must list the profiles-stat paths
sudo -u librenms ./validate.php       # LibreNMS self-check (in its install dir)`}
        />
        <p>
          <strong>In the browser:</strong>
        </p>
        <ul>
          <li>
            Device page → tab bar (at the end of it) → <strong>Netflow</strong>{" "}
            → Stats view shows Top-N.
          </li>
          <li>
            Direct URL test: <code>http://&lt;librenms&gt;/device/device=&lt;id&gt;/tab=netflow/</code>
          </li>
        </ul>
        <p>
          If the tab is missing, run{" "}
          <code>sudo tail -n 50 /opt/librenms/logs/librenms.log</code> and
          check, in order: <code>nfsen_enable</code> true?{" "}
          <code>nfsen_suffix</code> non-empty? RRD file name matches the
          device's real hostname (Part 7)? The tab only appears when all three
          are true.
        </p>

        <h2 id="9-permissions-and-ownership">9 — Permissions and ownership</h2>
        <p>Inside the container the users are:</p>
        <ul>
          <li>
            <code>netflow</code> = <strong>uid 1000</strong> (owns{" "}
            <code>profiles-data/live</code> — writes flow files)
          </li>
          <li>
            <code>www-data</code> = <strong>uid 33</strong> (owns{" "}
            <code>profiles-stat</code> — writes RRDs)
          </li>
        </ul>
        <p>
          Over NFS, uid 33 and uid 1000 are just numbers. The live directories
          are <code>chmod 775</code> with <code>netflow:www-data</code>{" "}
          ownership, so <strong>any local user</strong> (including
          www-data/root, which is how LibreNMS runs nfdump) can read them. That
          is why a read-only export works with no special uid mapping.
        </p>
        <p>If you ever see <strong>Permission denied</strong>:</p>
        <ol>
          <li>
            Check perms on the VPS: <code>ls -la nfsen-data/live/</code> (expect{" "}
            <code>drwxrwxr-x</code>)
          </li>
          <li>
            Check the export flags: <code>cat /etc/exports</code> (<code>ro</code>{" "}
            is fine for reading)
          </li>
          <li>
            On some setups the export needs:{" "}
            <code>rw,sync,no_root_squash</code> (only needed if NfSen itself
            must write to the share —{" "}
            <a href="#11-alternative-pattern">Part 11</a>)
          </li>
        </ol>

        <h2>10 — Danger zone</h2>
        <Callout type="danger" title="Things that WILL break your data">
          <ul>
            <li>
              <strong>Running TWO NfSen instances</strong> that write to the
              same live folder over NFS. NfSen uses SysV semaphores which exist
              per-host — the two instances cannot coordinate, so they corrupt
              each other's 5-minute files.
            </li>
            <li>
              <strong>Exporting <code>nfsen-etc/</code></strong> — it contains{" "}
              <code>.htpasswd</code> (Web UI password hashes).
            </li>
            <li>
              <strong>Exporting <code>nfsen-var/</code></strong> — unnecessary
              (logs, runtime).
            </li>
            <li>
              <strong>Using the default Ubuntu 24.04 nfdump package
              (1.7.3)</strong> on the LibreNMS host — new file format, cannot
              read the 1.6.17 files. Build 1.6.25 from source (Part 5) and
              point LibreNMS at <code>/usr/local/bin/nfdump</code>.
            </li>
            <li>
              <strong>Leaving <code>nfsen_suffix</code> empty</strong> in
              LibreNMS — the tab's RRD check builds an empty regex and silently
              fails, so the Netflow tab never appears.
            </li>
            <li>
              <strong>Pasting the <code>sudo mount</code> commands into{" "}
              <code>/etc/fstab</code></strong> instead of the proper 6-field
              lines — boot fails to mount the shares ("parse error").
            </li>
            <li>
              <strong>A slow/unreliable network as the WRITE target for
              NfSen</strong> — dropped NFS = stuck nfcapd writes. For the
              recommended read-only setup this is a non-issue.
            </li>
          </ul>
        </Callout>

        <h2 id="11-alternative-pattern">11 — Alternative pattern</h2>
        <p>
          <strong>Pattern B — NFS as the primary storage for the NfSen data
          (single writer):</strong>
        </p>
        <ul>
          <li>
            Mount the NFS share on the VPS under the project (e.g. replace the{" "}
            <code>nfsen-data/</code> folder with an NFS mount to a NAS).
          </li>
          <li>
            Docker keeps working unchanged (it's still a bind mount).
          </li>
          <li>
            Requirements: export <code>rw,sync,no_root_squash</code> (the
            entrypoint runs chown/chmod as root), the NFS server must be
            reliable, and the mount must be up before{" "}
            <code>docker compose up</code>.
          </li>
          <li>
            <strong>Pros:</strong> data survives VPS loss; easy to point
            multiple read-only consumers (LibreNMS) at the same NAS.
          </li>
          <li>
            <strong>Cons:</strong> single point of failure (the NAS) + NFS
            dependency at boot.
          </li>
        </ul>
        <p>
          For the goal of this guide (LibreNMS on another server), pattern A
          (read-only export) is the right choice — no reason to move NfSen's
          primary storage.
        </p>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Goal:</strong> LibreNMS (separate server) shows NetFlow
            graphs + top-N stats from the Dockerized NfSen.
          </li>
          <li>
            <strong>How:</strong> NFS share the two data folders ({" "}
            <code>nfsen-data</code> = raw flows, <code>nfsen-stat</code> = RRD
            graphs) <strong>read-only</strong> from the NetLens VPS to the
            LibreNMS server. NfSen keeps writing locally (one writer rule —
            never two NfSen instances on the same live data).
          </li>
          <li>
            <strong>On the LibreNMS server:</strong> install{" "}
            <code>nfs-common</code>, mount the shares at{" "}
            <code>/var/nfsen/profiles-data</code> and{" "}
            <code>/var/nfsen/profiles-stat</code>, and install{" "}
            <strong>nfdump 1.6.25</strong> (last of the 1.6.x tree) to match
            the container's v1.6 file format — on Ubuntu 24.04 build it from
            source, do <strong>not</strong> use 1.6.17 (its range parsing
            crashes with "buffer overflow detected" on 24.04's toolchain). Then
            enable the integration with{" "}
            <code>lnms config:set nfsen_enable true</code> (+ paths +{" "}
            <code>nfdump</code> → <code>/usr/local/bin/nfdump</code>).
          </li>
          <li>
            <strong>NfSen source names must match LibreNMS device
            hostnames</strong> (21-char limit, dots → <code>_</code>); for
            devices added by IP create <strong>two symlinks on the VPS</strong>{" "}
            (RRD <code>.rrd</code> + data dir) named after the device's real
            hostname (check the poll log, e.g. <code>127.0.0.1</code> →{" "}
            <code>127_0_0_1.rrd</code>). The mount is read-only, so the
            symlinks must be created VPS-side.
          </li>
          <li>
            <strong>LibreNMS config that must be right:</strong>{" "}
            <code>nfsen_enable</code> true, <code>nfsen_suffix</code> non-empty
            (empty = no tab), <code>nfsen_subdirlayout</code> 0 (this NfSen
            stores flat nfcapd files), <code>nfsen_rrds</code> pointing at{" "}
            <code>profiles-stat</code>.
          </li>
          <li>
            <strong>fstab entries</strong> need <code>_netdev</code> and must be
            proper 6-field lines — pasting the <code>sudo mount</code> commands
            into fstab breaks boot mounting.
          </li>
          <li>
            <strong>Never export</strong> <code>nfsen-etc</code> (contains{" "}
            <code>.htpasswd</code>) or <code>nfsen-var</code>.
          </li>
          <li>
            Verified against:{" "}
            <a
              href="https://docs.librenms.org/Extensions/NFSen/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LibreNMS docs
            </a>{" "}
            and LibreNMS master source (<code>nfdump -M &lt;base&gt;/profiles-data/live/&lt;source&gt;</code>).
          </li>
        </ul>

        <h2>Final verification checklist</h2>
        <p>
          Use this final pass after completing the guide. Every item should be
          true before troubleshooting the LibreNMS UI:
        </p>
        <ul>
          <li>
            NetLens is the only NfSen instance writing to the live data
            folders.
          </li>
          <li>
            The VPS exports only <code>nfsen-data/</code> and{" "}
            <code>nfsen-stat/</code> with{" "}
            <code>ro,sync,no_subtree_check</code>.
          </li>
          <li>
            <code>nfsen-var/</code> and <code>nfsen-etc/</code> are not
            exported.
          </li>
          <li>
            The LibreNMS server mounts the shares at{" "}
            <code>/var/nfsen/profiles-data</code> and{" "}
            <code>/var/nfsen/profiles-stat</code>.
          </li>
          <li>
            <code>/etc/fstab</code> contains two valid six-field{" "}
            <code>nfs4</code> entries with <code>ro</code> and{" "}
            <code>_netdev</code>.
          </li>
          <li>
            <code>/usr/local/bin/nfdump -V</code> reports <code>1.6.25</code>{" "}
            on Ubuntu 24.04.
          </li>
          <li>
            <code>nfsen_enable</code> is <code>true</code> and{" "}
            <code>nfsen_suffix</code> is non-empty.
          </li>
          <li>
            <code>nfsen_subdirlayout</code> is <code>0</code> for NetLens's
            flat file layout.
          </li>
          <li>
            <code>nfsen_rrds</code> points to the mounted{" "}
            <code>profiles-stat</code> paths.
          </li>
          <li>
            The NfSen source ident matches the LibreNMS hostname after
            dot-to-underscore conversion.
          </li>
          <li>
            Devices added by IP have both the RRD and raw-data symlinks created
            on the VPS.
          </li>
          <li>
            The LibreNMS device page shows <strong>Netflow → Stats</strong>{" "}
            with Top-N data.
          </li>
        </ul>
      </div>
    </DocsPageLayout>
  );
}