import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Troubleshooting",
  description:
    "Common NfSen failures — from “Can not initialize globals” to a full disk — and the exact commands that fix them.",
};

export default function TroubleshootingPage() {
  return (
    <DocsPageLayout href="/docs/troubleshooting">
      <PageHeader
        kicker="Docs"
        title="Troubleshooting"
        description="The most common NfSen failures and the exact commands that fix them — including what to do when your VPS disk fills up completely."
      />

      <div className="docs">
        <h2>Common problems and fixes</h2>
        <table>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Web UI shows <code>Can not initialize globals</code> /{" "}
                <code>nfsend connect() error: No such file or directory</code>{" "}
                / <code>nfsend - connection failed!!</code>
              </td>
              <td>
                The nfsend daemon is not running. On the first start after
                switching to the data folders (bind mounts), this means the{" "}
                <code>live</code> profile is missing (an empty{" "}
                <code>nfsen-stat/</code> folder hides it and NfSen refuses to
                start). Fix once: <code>docker compose up -d --build</code> —
                the entrypoint re-seeds the profile automatically. Then check{" "}
                <code>docker logs netlens</code> for <code>nfsend .... running</code>.
              </td>
            </tr>
            <tr>
              <td>
                Web UI shows <code>nfsend connect() error</code> (daemon was
                running before)
              </td>
              <td>
                <code>docker restart netlens</code>, or stop/start the daemon.
              </td>
            </tr>
            <tr>
              <td>Config changes not showing after reconfig</td>
              <td>Do a full restart of the nfsen daemon.</td>
            </tr>
            <tr>
              <td>
                <code>Error: missing parameter 'IP' for multiple sources collector</code>
              </td>
              <td>
                Add <code>'IP' =&gt; '0.0.0.0'</code> to all existing sources
                manually — see the sources guide.
              </td>
            </tr>
            <tr>
              <td>
                <code>Reconfig: No changes found!</code>
              </td>
              <td>
                The source name doesn't exist — check{" "}
                <code>%sources</code> in <code>nfsen.conf</code>.
              </td>
            </tr>
            <tr>
              <td>Port already in use</td>
              <td>Change the Apache port in <code>docker-compose.yml</code>.</td>
            </tr>
            <tr>
              <td>Can't access port 8070</td>
              <td>Check the firewall: <code>ufw allow 8070/tcp</code>.</td>
            </tr>
            <tr>
              <td>NfSen not starting</td>
              <td>
                <code>docker logs netlens --tail 30</code>, then{" "}
                <code>docker restart netlens</code>.
              </td>
            </tr>
            <tr>
              <td>
                <code>nfsend connect() error</code> after disk full
              </td>
              <td>
                The socket is dead. Restart the container:{" "}
                <code>docker restart netlens</code>.
              </td>
            </tr>
            <tr>
              <td>Login page rejects a password you're sure is right</td>
              <td>
                Reset it instantly, no restart:{" "}
                <code>docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin &lt;newpass&gt;</code>{" "}
                (file lives at <code>nfsen-etc/.htpasswd</code> on the host).
              </td>
            </tr>
          </tbody>
        </table>

        <h2>No flow files</h2>
        <ol>
          <li>Confirm the router exports NetFlow v5, v9, or IPFIX to the host IP.</li>
          <li>Confirm the correct UDP port is published and allowed by the firewall.</li>
          <li>Check the source port in <code>nfsen.conf</code> and reconfigure the daemon.</li>
          <li>Inspect <code>docker logs netlens</code> and <code>nfsen-data/live/</code>.</li>
        </ol>
        <CodeBlock
          lang="bash"
          title="inspect"
          code={`docker compose ps
docker logs --tail=100 netlens
find nfsen-data/live -maxdepth 2 -type f | head`}
        />

        <h2>LibreNMS shows no Netflow tab</h2>
        <p>
          Use the{" "}
          <a href="/integration/librenms-integration">
            LibreNMS integration guide
          </a>{" "}
          verification checklist. Common causes are an empty{" "}
          <code>nfsen_suffix</code>, a wrong source/device name, incorrect{" "}
          <code>nfsen_subdirlayout</code>, or an nfdump version mismatch.
        </p>

        <h2>Storage full — recover disk space</h2>
        <p>
          NfSen's NetFlow capture files accumulate quickly. When your VPS disk
          fills up (100%), <code>docker exec</code> commands fail with:
        </p>
        <CodeBlock
          lang="text"
          title="symptom"
          code={`OCI runtime exec failed: write /tmp/runc-processXXXXXX: no space left on device`}
        />
        <p>
          And <code>nfsen stop</code> fails because the Unix socket can't be
          written to:
        </p>
        <CodeBlock
          lang="text"
          title="symptom"
          code={`setlogsock(): type='unix': path not available`}
        />

        <h3>Step 1 — Free a few MB to get Docker working again</h3>
        <p>
          Run these host-level commands (no <code>docker exec</code> needed):
        </p>
        <CodeBlock
          lang="bash"
          title="free space"
          code={`docker system prune -f
docker builder prune -f

# if that's not enough, also clean system logs
sudo journalctl --vacuum-time=1d
sudo rm -f /var/log/syslog.1 /var/log/kern.log.1 2>/dev/null; true

# check how much space you have now
df -h /`}
        />
        <p>
          You only need <strong>~50 MB free</strong> for <code>docker exec</code>{" "}
          to work again.
        </p>

        <h3>Step 2 — Stop everything and delete the data</h3>
        <p>
          <strong>Method A — Quick</strong> (if <code>docker stop</code> works):
        </p>
        <CodeBlock
          lang="bash"
          title="method A"
          code={`# Stop the entire container (always works - doesn't need the nfsen socket)
docker stop netlens

# Delete the flow data directly from the data folders (bind mounts)
rm -rf nfsen-data/live/*
rm -rf nfsen-stat/live/*
rm -rf nfsen-var/*

# Start fresh
docker start netlens`}
        />
        <p>
          <strong>Method B — Via docker exec</strong> (if you already freed
          some space):
        </p>
        <CodeBlock
          lang="bash"
          title="method B"
          code={`# Delete the captured flow data (this frees the most space)
docker exec netlens bash -c "rm -rf /var/nfsen/profiles-data/live/* /var/nfsen/profiles-stat/live/*"

# Truncate logs too
docker exec netlens bash -c "truncate -s 0 /var/nfsen/var/nfsen.log"`}
        />

        <h3>Step 3 — Restart NfSen</h3>
        <p>
          Restart the whole container — the entrypoint starts NfSen
          automatically, no manual daemon handling needed:
        </p>
        <CodeBlock
          lang="bash"
          title="restart"
          code={`docker restart netlens`}
        />

        <h3>Verify recovery</h3>
        <CodeBlock
          lang="bash"
          title="verify"
          code={`# Check disk space
df -h /

# Check NfSen status
docker exec netlens /var/nfsen/bin/nfsen status

# Access Web UI: http://<YOUR_IP>:8070/nfsen.php`}
        />

        <Callout type="danger" title="Data folders hold everything">
          Only <code>rm -rf</code> of the folders themselves deletes your data
          permanently. Deleting the <code>live/*</code> content clears the flow
          data and graphs but keeps your config and sources intact. Always stop
          the container before cleaning a mounted folder.
        </Callout>
      </div>
    </DocsPageLayout>
  );
}