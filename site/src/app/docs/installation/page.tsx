import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Installation",
  description:
    "Deploy NetLens with Docker, open the NfSen dashboard, and verify the service.",
};

export default function InstallationPage() {
  return (
    <DocsPageLayout href="/docs/installation">
      <PageHeader
        kicker="Docs"
        title="Installation"
        description="NetLens runs as a Dockerized NfSen stack. The install script builds the image, creates your bind-mounted data folders, and starts the service on port 8070."
      />

      <div className="docs">
        <h2>Prerequisites</h2>
        <ul>
          <li>A Linux VPS or host with Docker Engine and the Docker Compose plugin.</li>
          <li>UDP access to the exporter ports you plan to use (2055/2056 by default).</li>
          <li>Enough disk space for raw flow files and RRD statistics.</li>
        </ul>

        <Callout type="warn" title="Network requirement">
          Allow the selected UDP ports in both your cloud firewall and host
          firewall. The web interface uses TCP 8070.
        </Callout>

        <h2>Deploy the stack</h2>
        <CodeBlock
          lang="bash"
          title="install"
          code={`# Clone the repository
git clone https://github.com/rezwanvaiya2-0/netlens.git
cd netlens

# Build and start NetLens
sudo ./install.sh`}
        />
        <p>
          <code>./install.sh</code> is exactly{" "}
          <code>docker compose up -d --build</code>. The <code>--build</code>{" "}
          flag is only needed on the first run — after that, restarting only
          requires <code>docker compose up -d</code> (no rebuild). Your
          sources, config, and data all persist thanks to the data folders next
          to <code>docker-compose.yml</code>.
        </p>

        <h2>Open the dashboard</h2>
        <p>
          Visit <code>http://&lt;YOUR_IP&gt;:8070/nfsen.php</code>. The web UI
          is password-protected:
        </p>
        <table>
          <thead>
            <tr>
              <th>Field</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Username</td>
              <td>
                <code>admin</code>
              </td>
            </tr>
            <tr>
              <td>Password</td>
              <td>
                <code>change-me-now</code>
              </td>
            </tr>
          </tbody>
        </table>

        <Callout type="danger" title="Change the default password">
          Replace the default credential immediately — one command, takes
          effect instantly, no restart needed:
        </Callout>
        <CodeBlock
          lang="bash"
          title="change password"
          code={`docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123`}
        />

        <h2>Verify the service</h2>
        <CodeBlock
          lang="bash"
          title="verify"
          code={`docker compose ps
docker logs --tail=50 netlens
ss -lunp | grep -E '2055|2056|8070'`}
        />
        <p>
          The container should be running, the UDP listeners should be present,
          and the web UI should load without an authentication loop.
        </p>

        <h2>Data folders (created on first start)</h2>
        <table>
          <thead>
            <tr>
              <th>Folder</th>
              <th>Inside the container</th>
              <th>What it holds</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>nfsen-data/</code>
              </td>
              <td>
                <code>/var/nfsen/profiles-data</code>
              </td>
              <td>Raw flow records (captured NetFlow files)</td>
            </tr>
            <tr>
              <td>
                <code>nfsen-stat/</code>
              </td>
              <td>
                <code>/var/nfsen/profiles-stat</code>
              </td>
              <td>RRD graph files (the charts in the Web UI)</td>
            </tr>
            <tr>
              <td>
                <code>nfsen-var/</code>
              </td>
              <td>
                <code>/var/nfsen/var</code>
              </td>
              <td>Logs, cache, runtime files</td>
            </tr>
            <tr>
              <td>
                <code>nfsen-etc/</code>
              </td>
              <td>
                <code>/var/nfsen/etc</code>
              </td>
              <td>
                <code>nfsen.conf</code> (router sources config)
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          The folders are created automatically on first start, and the
          entrypoint seeds the default config + demo source when{" "}
          <code>nfsen-etc/</code> is empty. Learn more on the{" "}
          <a href="/docs/data-folders">Data Folders page</a>.
        </p>

        <Callout type="info" title="Timezone">
          The container defaults to <code>Asia/Dhaka</code> (set via the{" "}
          <code>TZ</code> environment variable in <code>docker-compose.yml</code>
          ).
        </Callout>

        <h2>Next steps</h2>
        <ul>
          <li>Connect a router on a new port — see the guide.</li>
          <li>Set data retention from the web UI.</li>
          <li>Integrate with LibreNMS over a read-only NFS share.</li>
        </ul>
      </div>
    </DocsPageLayout>
  );
}
