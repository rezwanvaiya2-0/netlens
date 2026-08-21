import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Data Folders & Bind Mounts",
  description:
    "Where NetLens stores its data, how the bind mounts work, and how to back up, clean up, and migrate.",
};

export default function DataFoldersPage() {
  return (
    <DocsPageLayout href="/docs/data-folders">
      <PageHeader
        kicker="Docs"
        title="Data Folders & Bind Mounts"
        description="Your data lives in four real folders next to docker-compose.yml — no more hidden Docker volumes. You can see, browse, back up, and mount/unmount them without ever losing data."
      />

      <div className="docs">
        <h2>The four folders</h2>
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

        <h2>Why docker volume ls shows nothing</h2>
        <p>
          These four folders are <strong>bind mounts</strong>, not Docker
          volumes. <code>docker volume ls</code> only lists <em>named</em>{" "}
          volumes — bind mounts are plain host folders and are intentionally
          invisible there. That is normal and correct: the folders themselves{" "}
          <em>are</em> the storage. To confirm they are mounted, run{" "}
          <code>docker inspect netlens</code> and look at the{" "}
          <code>Mounts</code> section (each shows <code>"Type": "bind"</code>{" "}
          with the matching <code>Source</code>/<code>Destination</code>), or
          simply <code>ls</code> the four folders next to{" "}
          <code>docker-compose.yml</code>.
        </p>

        <h2>How the mounting actually works</h2>
        <p>
          Every line under <code>volumes:</code> in{" "}
          <code>docker-compose.yml</code> is a bind mount — one host folder
          "shared" with a path inside the container. Both sides see the same
          files:
        </p>
        <CodeBlock
          lang="text"
          title="bind mount layout"
          code={`VPS host (on your server)         Inside the container
──────────────────────────────   ───────────────────────────────
./nfsen-data/   ◄── shared ──►  /var/nfsen/profiles-data/   raw NetFlow files
./nfsen-stat/   ◄── shared ──►  /var/nfsen/profiles-stat/   RRD graph files
./nfsen-var/    ◄── shared ──►  /var/nfsen/var/             logs + runtime
./nfsen-etc/    ◄── shared ──►  /var/nfsen/etc/             nfsen.conf (sources)`}
        />
        <p>
          Example: when the collector saves flow data it writes to{" "}
          <code>/var/nfsen/profiles-data/live/router1/</code> inside the
          container — and because of the mount, the file physically lands in{" "}
          <code>nfsen-data/live/router1/</code> on your VPS. You can browse,
          copy, back up, or delete it directly from the host at any time.
        </p>

        <h2>Lifecycle rules</h2>
        <ul>
          <li>
            <strong>Mount / unmount = start / stop the container.</strong>{" "}
            <code>docker compose down</code> releases the mounts;{" "}
            <code>docker compose up -d</code> re-attaches them. The data never
            moves.
          </li>
          <li>
            <strong>Data survives everything</strong> — rebuilds, recreates,
            and even <code>docker compose down -v</code> (that flag only
            deletes <em>named</em> volumes; your data lives in these host
            folders).
          </li>
          <li>
            <strong>The only thing that deletes your data</strong> is{" "}
            <code>rm -rf nfsen-data nfsen-stat nfsen-var nfsen-etc</code> —
            stop the container first (see below).
          </li>
          <li>
            <strong>An empty host folder hides the image's built-in
            content</strong> — that is why the entrypoint auto-seeds{" "}
            <code>nfsen.conf</code> into <code>nfsen-etc/</code> and the{" "}
            <code>live</code> profile into <code>nfsen-stat/</code> +{" "}
            <code>nfsen-data/</code> on first start.
          </li>
        </ul>

        <Callout type="warn" title="Back up anytime (container can keep running)">
          <code>
            cp -a nfsen-data nfsen-data-backup
          </code>{" "}
          or{" "}
          <code>
            tar czf nfsen-backup.tar.gz nfsen-data nfsen-stat nfsen-var
            nfsen-etc
          </code>
        </Callout>

        <h2>Clean up / delete the data folders</h2>
        <p>
          Because the folders are bind mounts, the running container is
          actively writing to them. Before deleting or cleaning a mounted
          folder, <strong>unmount it first</strong> (<code>docker compose
          down</code>).
        </p>
        <CodeBlock
          lang="bash"
          title="clear flow data only"
          code={`# 1) Unmount first
docker compose down

# 2) Delete only the flow data + graphs (keeps nfsen.conf / router sources)
rm -rf nfsen-data/live/* nfsen-stat/live/*

# 3) Remount — same config, empty graphs
sudo docker compose up -d`}
        />
        <p>
          If the container is already stopped, the mounts are already released
          — you can delete the folders directly. The rule is simple:{" "}
          <strong>container stopped = folders free to delete; container running
          = unmount first.</strong>
        </p>

        <h2>Migrating from the old named volumes</h2>
        <p>
          If you already had data in the old Docker volumes and want to move it
          into the new folders:
        </p>
        <CodeBlock
          lang="bash"
          title="migrate"
          code={`cd netlens
git pull
sudo docker compose down          # stop the container first

# create the new folders first
mkdir -p nfsen-data nfsen-stat nfsen-var nfsen-etc

# copy the existing data from each old volume into its new folder
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-data/_data/. nfsen-data/
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-stat/_data/. nfsen-stat/
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-var/_data/. nfsen-var/
sudo cp -a /var/lib/docker/volumes/netlens_nfsen-etc/_data/. nfsen-etc/

# fix ownership so NfSen can write to the copied data
sudo docker compose up -d
docker exec netlens chown -R netflow:www-data /var/nfsen/profiles-data/live/
docker exec netlens chown -R www-data:www-data /var/nfsen/profiles-stat/live/

# old volumes are now unused - you may delete them to free space
sudo docker volume rm netlens_nfsen-data netlens_nfsen-stat \\
  netlens_nfsen-var netlens_nfsen-etc`}
        />
        <p>
          If you pull and start <strong>without</strong> migrating, the new
          folders start empty — your old data stays safe in the named volumes,
          just not mounted. Do the copy steps above first if you want to keep
          existing graphs.
        </p>
      </div>
    </DocsPageLayout>
  );
}
