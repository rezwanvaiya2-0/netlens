import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Security Notes",
  description:
    "Hardening checklist, login protection, least-privilege guidance, and firewall rules for the NetLens VPS.",
};

export default function SecurityPage() {
  return (
    <DocsPageLayout href="/reference/security">
      <PageHeader
        kicker="Reference"
        title="Security Notes"
        description="What the project does to stay secure, and what you should do on the VPS for a production deployment."
      />

      <div className="docs">
        <h2>Built-in protections</h2>
        <ul>
          <li>
            <strong>Login protection</strong> — Apache <code>mod_auth_form</code>{" "}
            login page protects the entire Web UI. The activity-timer cookie is{" "}
            <strong>HttpOnly + SameSite=Lax</strong> (set by{" "}
            <code>session-guard.php</code>). Note: the Apache session cookie
            itself can't be marked HttpOnly on Ubuntu 20.04's Apache 2.4.41
            (that needs Apache 2.4.43+) — so keep the UI behind HTTPS and log
            out when you're done.
          </li>
          <li>
            <strong>No directory listings</strong> — Apache{" "}
            <code>Options -Indexes</code> in <code>config/000-default.conf</code>
            , so NfSen's plugin/config files under{" "}
            <code>/var/nfsen/www</code> can't be browsed.
          </li>
          <li>
            <strong>Least privilege</strong> — the container runs with{" "}
            <strong>no extra Linux capabilities</strong> (no{" "}
            <code>NET_ADMIN</code>/<code>NET_RAW</code>): nfcapd collects
            NetFlow over plain UDP sockets and needs nothing special.
          </li>
          <li>
            <strong>Session crypto</strong> — the login session is encrypted
            with a random passphrase generated on first start.
          </li>
          <li>
            <strong>Smaller attack surface</strong> — the image no longer
            installs docs-only tools (doxygen, graphviz) or legacy net-tools.
          </li>
        </ul>

        <h2>VPS hardening checklist</h2>
        <p>
          Run these steps once on the VPS that hosts the NetLens container:
        </p>

        <h3>1. Change the default login password</h3>
        <CodeBlock
          lang="bash"
          title="change password"
          code={`docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin <YourStrongPassword>`}
        />

        <h3>2. Firewall the NetFlow UDP ports</h3>
        <p>
          Allow only your routers' IPs to send NetFlow data to the published
          UDP ports:
        </p>
        <CodeBlock
          lang="bash"
          title="ufw rules"
          code={`sudo ufw allow from <ROUTER1_IP> to any port 2055 proto udp
sudo ufw allow from <ROUTER2_IP> to any port 2056 proto udp
sudo ufw allow 8070/tcp        # Web UI (keep this one open)
sudo ufw enable`}
        />

        <h3>3. Enable HTTPS for the Web UI</h3>
        <p>
          The Web UI currently uses plain HTTP. For production, put a reverse
          proxy (Caddy / Nginx / Let's Encrypt) in front of port 8070. Also
          consider brute-force protection on the login page via fail2ban.
        </p>

        <Callout type="warn" title="HTTPS recommendation">
          The password travels in clear text over plain HTTP. For a production
          VPS, put HTTPS (TLS) in front of port 8070 — self-signed now, Let's
          Encrypt if you have a domain pointing at the server.
        </Callout>

        <h2>NFS sharing security</h2>
        <p>
          When sharing data with LibreNMS, follow these rules:
        </p>
        <ul>
          <li>
            <strong>Export only the two data folders</strong> —{" "}
            <code>nfsen-data/</code> and <code>nfsen-stat/</code>. Never
            export <code>nfsen-etc/</code> (contains <code>.htpasswd</code>{" "}
            password hashes) or <code>nfsen-var/</code> (logs, runtime state).
          </li>
          <li>
            <strong>Use read-only exports</strong> (<code>ro</code>) — the
            LibreNMS server only needs to read. A read-only export cannot
            corrupt the live data.
          </li>
          <li>
            <strong>Restrict exports to the LibreNMS IP</strong> — use the
            <code>/32</code> subnet mask in <code>/etc/exports</code>.
          </li>
          <li>
            <strong>Never run two NfSen instances</strong> writing to the same
            live folder. NfSen uses SysV semaphores that exist per-host — two
            instances cannot coordinate and will corrupt each other's 5-minute
            files.
          </li>
        </ul>

        <h2>Data protection</h2>
        <ul>
          <li>
            <strong>Back up regularly</strong> — all four data folders survive
            container rebuilds and restarts. Only <code>rm -rf</code> of the
            folders themselves deletes your data.
          </li>
          <li>
            <strong>Log out</strong> — browser sessions auto-expire after 1
            hour of inactivity. Log out explicitly when you're done.
          </li>
          <li>
            <strong>Monitor disk usage</strong> — set data retention (expire +
            max size) to prevent the disk from filling up and causing a denial
            of service.
          </li>
        </ul>

        <Callout type="info" title="License">
          This repository (the Docker image, entrypoint, login page, configs,
          and docs) is released under the{" "}
          <a
            href="https://github.com/rezwanvaiya2-0/netlens/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
          >
            BSD-3-Clause
          </a>{" "}
          license.
        </Callout>
      </div>
    </DocsPageLayout>
  );
}