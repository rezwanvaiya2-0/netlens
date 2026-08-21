import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Commands Cheatsheet",
  description:
    "Every useful docker exec, docker compose, and utility command for NetLens in one place.",
};

export default function CommandsPage() {
  return (
    <DocsPageLayout href="/reference/commands">
      <PageHeader
        kicker="Reference"
        title="Commands Cheatsheet"
        description="Every useful command for NetLens — from daily operations to full recovery — collected in one place."
      />

      <div className="docs">
        <h2>Deploy and start</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>sudo ./install.sh</code>
              </td>
              <td>Build the image and start the stack (first run only)</td>
            </tr>
            <tr>
              <td>
                <code>docker compose up -d</code>
              </td>
              <td>Start the stack (no rebuild)</td>
            </tr>
            <tr>
              <td>
                <code>docker compose up -d --build</code>
              </td>
              <td>Rebuild the image and start</td>
            </tr>
            <tr>
              <td>
                <code>docker compose down</code>
              </td>
              <td>Stop the container and release bind mounts</td>
            </tr>
            <tr>
              <td>
                <code>docker stop netlens</code>
              </td>
              <td>Quick stop (keep the mounts)</td>
            </tr>
            <tr>
              <td>
                <code>docker start netlens</code>
              </td>
              <td>Quick start</td>
            </tr>
            <tr>
              <td>
                <code>docker restart netlens</code>
              </td>
              <td>Restart</td>
            </tr>
            <tr>
              <td>
                <code>docker compose ps</code>
              </td>
              <td>Check container status</td>
            </tr>
            <tr>
              <td>
                <code>docker logs --tail=50 netlens</code>
              </td>
              <td>View the last 50 log lines</td>
            </tr>
          </tbody>
        </table>

        <h2>NfSen daemon</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>docker exec netlens /var/nfsen/bin/nfsen status</code>
              </td>
              <td>Check if the NfSen daemon is running</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens /var/nfsen/bin/nfsen start</code>
              </td>
              <td>Start the NfSen daemon</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens /var/nfsen/bin/nfsen stop</code>
              </td>
              <td>Stop the NfSen daemon</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens /var/nfsen/bin/nfsen restart</code>
              </td>
              <td>Restart the NfSen daemon</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens /var/nfsen/bin/nfsen reconfig</code>
              </td>
              <td>Reconfigure NfSen after config changes</td>
            </tr>
          </tbody>
        </table>

        <h2>Router sources</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf</code>
              </td>
              <td>List all configured sources</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens ...</code>{" "}
                (sed command from the sources guide)
              </td>
              <td>Add a source with IP</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens ...</code>{" "}
                (sed delete command from the sources guide)
              </td>
              <td>Remove a source</td>
            </tr>
            <tr>
              <td>
                <code>
                  {`docker exec netlens bash -c "sed -i \\"/'router1' =>/d\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig"`}
                </code>
              </td>
              <td>Remove the demo router1 source</td>
            </tr>
          </tbody>
        </table>

        <h2>Password management</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin &lt;newpass&gt;</code>
              </td>
              <td>Change the admin password (instant, no restart)</td>
            </tr>
          </tbody>
        </table>

        <h2>Data retention</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>docker exec netlens /var/nfsen/bin/nfsen --modify-profile live expire=30d maxsize=15G</code>
              </td>
              <td>Set retention from the command line</td>
            </tr>
          </tbody>
        </table>

        <h2>Disk recovery</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>docker system prune -f</code>
              </td>
              <td>Free Docker disk space</td>
            </tr>
            <tr>
              <td>
                <code>docker builder prune -f</code>
              </td>
              <td>Free build cache space</td>
            </tr>
            <tr>
              <td>
                <code>sudo journalctl --vacuum-time=1d</code>
              </td>
              <td>Clean system logs</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens bash -c "rm -rf /var/nfsen/profiles-data/live/* /var/nfsen/profiles-stat/live/*"</code>
              </td>
              <td>Delete all flow data and graphs (frees the most space)</td>
            </tr>
            <tr>
              <td>
                <code>docker exec netlens bash -c "truncate -s 0 /var/nfsen/var/nfsen.log"</code>
              </td>
              <td>Truncate the NfSen log file</td>
            </tr>
          </tbody>
        </table>

        <h2>LibreNMS integration</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>sudo apt install -y nfs-kernel-server</code>
              </td>
              <td>Install the NFS server (run on the NetLens VPS)</td>
            </tr>
            <tr>
              <td>
                <code>sudo apt install -y nfs-common</code>
              </td>
              <td>Install the NFS client (run on the LibreNMS server)</td>
            </tr>
            <tr>
              <td>
                <code>sudo mount -t nfs4 &lt;VPS_IP&gt;:&lt;path&gt;/nfsen-data /var/nfsen/profiles-data</code>
              </td>
              <td>Mount the NFS data share</td>
            </tr>
            <tr>
              <td>
                <code>/usr/local/bin/nfdump -V</code>
              </td>
              <td>Verify the nfdump version (must be 1.6.25)</td>
            </tr>
            <tr>
              <td>
                <code>lnms config:set nfsen_enable true</code>
              </td>
              <td>Enable the Netflow tab in LibreNMS</td>
            </tr>
            <tr>
              <td>
                <code>lnms config:set nfsen_suffix '_none'</code>
              </td>
              <td>Set the required non-empty suffix</td>
            </tr>
          </tbody>
        </table>

        <h2>Utility</h2>
        <table>
          <thead>
            <tr>
              <th>Command</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>ss -lunp | grep -E '2055|2056|8070'</code>
              </td>
              <td>Check that UDP listeners and the web UI port are active</td>
            </tr>
            <tr>
              <td>
                <code>tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var nfsen-etc</code>
              </td>
              <td>Back up all four data folders</td>
            </tr>
            <tr>
              <td>
                <code>docker inspect netlens | grep -A 5 Mounts</code>
              </td>
              <td>Verify the bind mounts are active</td>
            </tr>
            <tr>
              <td>
                <code>df -h /</code>
              </td>
              <td>Check available disk space</td>
            </tr>
          </tbody>
        </table>
      </div>
    </DocsPageLayout>
  );
}