import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import { RouterFlowDiagram } from "@/components/flow-diagram";

export const metadata: Metadata = {
  title: "Adding a Router on a New Port",
  description:
    "Open a UDP port and add the matching NfSen source — about 3 seconds, no rebuild, no data loss.",
};

export default function NewPortPage() {
  return (
    <DocsPageLayout href="/docs/new-port">
      <PageHeader
        kicker="Docs"
        title="Adding a Router on a New Port"
        description="When you connect a router that sends NetFlow to a new UDP port, that port must be opened in docker-compose.yml and a matching source added to nfsen.conf. Both steps take about 3 seconds."
      />

      <div className="docs">
        <h2>How it actually works (router to graph)</h2>
        <RouterFlowDiagram />
        <ol>
          <li>
            <strong>Your router sends NetFlow</strong> to your VPS IP on a UDP
            port (e.g. <code>2070</code>).
          </li>
          <li>
            <strong>Docker must forward that UDP port</strong> into the
            container — that is the <code>ports:</code> line in{" "}
            <code>docker-compose.yml</code>. Without it, the packets are
            dropped before NfSen ever sees them.
          </li>
          <li>
            <strong>nfcapd must listen on that port</strong> — that is the
            router <em>source</em> in <code>nfsen.conf</code>.{" "}
            <code>nfsen reconfig</code> starts one collector (
            <code>nfcapd</code>) per port automatically.
          </li>
          <li>
            <strong>nfcapd writes the raw flow files</strong> into{" "}
            <code>/var/nfsen/profiles-data/live/&lt;router&gt;/</code> — which
            is your <code>nfsen-data/live/&lt;router&gt;/</code> folder (bind
            mount).
          </li>
          <li>
            <strong>nfsend turns them into graphs</strong> (RRD files) in{" "}
            <code>/var/nfsen/profiles-stat/live/</code>.
          </li>
          <li>
            <strong>The Web UI (port 8070)</strong> reads those RRD files and
            draws the charts.
          </li>
        </ol>

        <h2>Step-by-step (example: new router on port 2070)</h2>
        <h3>1. Open the port in docker-compose.yml</h3>
        <CodeBlock
          lang="yaml"
          title="docker-compose.yml"
          code={`ports:
  - "8070:8070"
  - "2055:2055/udp"
  - "2056:2056/udp"
  - "2070:2070/udp"      # <- new router port`}
        />

        <h3>2. Add the router source</h3>
        <p>
          <code>docker exec</code> is the recommended way, and it now persists
          forever:
        </p>
        <CodeBlock
          lang="bash"
          title="add source"
          code={`docker exec netlens bash -c "sed -i \\"/^);$/i\\\\    'myrouter' => { 'port' => '2070', 'col' => '#FF0000', 'type' => 'netflow' },\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Done'"`}
        />
        <p>
          Prefer the env var? You can set{" "}
          <code>NFSEN_SOURCES=2070:myrouter:#FF0000</code> in{" "}
          <code>docker-compose.yml</code> instead — but pick{" "}
          <strong>one</strong> method, don't mix.
        </p>

        <h3>3. Recreate the container — done</h3>
        <CodeBlock
          lang="bash"
          title="apply"
          code={`docker compose up -d`}
        />
        <p>
          That's it: the port opens <strong>and</strong> the router source is
          configured automatically. Takes ~3 seconds.
        </p>

        <Callout type="ok" title="No rebuild, no data loss">
          The image is not rebuilt — only the container is recreated, fast and
          safe. <code>docker compose up -d</code> keeps all your NetFlow data
          (it lives in the <code>nfsen-data/</code> folder next to{" "}
          <code>docker-compose.yml</code>).
        </Callout>

        <h2>What each step did</h2>
        <ol>
          <li>
            Adding <code>- "2070:2070/udp"</code> to <code>ports:</code> makes
            Docker start forwarding UDP 2070 from the VPS into the container.
          </li>
          <li>
            The <code>docker exec</code> command adds the{" "}
            <code>'myrouter'</code> source to <code>nfsen.conf</code> (which
            lives in <code>nfsen-etc/</code> on the host) and runs{" "}
            <code>nfsen reconfig</code> — reconfig starts an{" "}
            <code>nfcapd</code> collector on port 2070 and creates the{" "}
            <code>nfsen-data/live/myrouter/</code> folder.
          </li>
          <li>
            <code>docker compose up -d</code> recreates the container so the
            new port mapping takes effect (the image is not rebuilt).
          </li>
        </ol>

        <h2>Replace or remove the demo router1 source</h2>
        <p>
          The container ships with a demo source <code>router1</code> on port{" "}
          <code>2055</code> so the Web UI shows graphs on first install. Remove
          or replace it once you connect a real router:
        </p>
        <CodeBlock
          lang="bash"
          title="remove demo source"
          code={`docker exec netlens bash -c "sed -i \\"/'router1' =>/d\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Removed'"`}
        />
        <Callout type="warn" title="Keep the demo gone permanently">
          To keep the demo gone permanently, keep at least one real source. If
          your <code>%sources</code> list ever becomes completely empty (e.g.
          you remove <code>router1</code> and have no other routers yet), the
          demo is re-seeded automatically on the next container start. Once you
          have any real router, the demo never comes back.
        </Callout>
      </div>
    </DocsPageLayout>
  );
}
