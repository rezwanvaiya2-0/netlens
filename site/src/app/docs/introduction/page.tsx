import type { Metadata } from "next";
import Link from "next/link";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";
import { FlowDiagram } from "@/components/flow-diagram";

export const metadata: Metadata = {
  title: "Introduction",
  description:
    "What NetLens is, what it includes, and how the Dockerized NfSen + NfDump stack fits together.",
};

export default function IntroductionPage() {
  return (
    <DocsPageLayout href="/docs/introduction">
      <PageHeader
        kicker="Docs"
        title="Introduction"
        description="NetLens packages the classic NfSen NetFlow analyzer with the modern convenience of Docker — one command to deploy, real folders for your data, and a password-protected web UI."
      />

      <div className="docs">
        <h2>What is NetLens?</h2>
        <p>
          NetLens is a <strong>Dockerized NfSen NetFlow Analyzer</strong>. It
          bundles <strong>NfSen 1.3.6p1</strong> and{" "}
          <strong>NfDump 1.6.17</strong> on Ubuntu 20.04 into a single,
          self-contained container that collects, stores, and visualizes
          NetFlow data. One command —{" "}
          <code>sudo ./install.sh</code> — builds the image, creates your data
          folders, and starts the analyzer on port <code>8070</code>.
        </p>

        <h2>What's inside</h2>
        <ul>
          <li>
            <strong>NfSen 1.3.6p1</strong> — the web frontend: graphs, details,
            alerts, and profile administration.
          </li>
          <li>
            <strong>NfDump 1.6.17</strong> — collection and analysis tools
            (<code>nfcapd</code>, <code>nfdump</code>, <code>nfexpire</code>,
            …).
          </li>
          <li>
            <strong>Apache 2.4 + PHP 7.4</strong> — serving the web UI with a
            styled login page (<code>mod_auth_form</code>).
          </li>
          <li>
            <strong>Bind-mounted data folders</strong> — your flow data lives
            in real folders next to <code>docker-compose.yml</code>, not in
            hidden Docker volumes.
          </li>
        </ul>

        <h2>How the stack works</h2>
        <p>
          Routers and switches export NetFlow (v5, v9, or IPFIX) over UDP to
          ports you publish into the container. Each configured source runs an{" "}
          <code>nfcapd</code> collector that writes raw flow files to{" "}
          <code>nfsen-data/live/&lt;source&gt;/</code>. The{" "}
          <code>nfsend</code> daemon converts those files into RRD graphs in{" "}
          <code>nfsen-stat/live/</code>, and the web UI renders everything at{" "}
          <code>http://&lt;YOUR_IP&gt;:8070/nfsen.php</code>.
        </p>

        <div className="my-6">
          <FlowDiagram />
        </div>

        <h2>What makes it different</h2>
        <ul>
          <li>
            <strong>Real folders, not volumes.</strong> Four folders next to
            <code>docker-compose.yml</code> (<code>nfsen-data/</code>,{" "}
            <code>nfsen-stat/</code>, <code>nfsen-var/</code>,{" "}
            <code>nfsen-etc/</code>) hold everything. You can browse, back up,
            and mount them freely — data survives rebuilds, restarts, and even{" "}
            <code>docker compose down -v</code>.
          </li>
          <li>
            <strong>Works out of the box.</strong> A demo source{" "}
            <code>router1</code> on port 2055 ships by default, so the web UI
            shows graph placeholders from the first install.
          </li>
          <li>
            <strong>Password-protected UI.</strong> Apache{" "}
            <code>mod_auth_form</code> serves a styled login page, and sessions
            auto-expire after one hour of inactivity.
          </li>
          <li>
            <strong>Add routers in seconds.</strong> Open a UDP port and add a
            source — about three seconds, no image rebuild, no data loss.
          </li>
        </ul>

        <h2>When to use NetLens</h2>
        <p>
          You manage one or more routers, firewalls, or edge devices and want a
          lightweight, self-hosted traffic analysis tool. NetLens is ideal for
          a small to medium network where a full commercial NetFlow collector
          is overkill but <code>tcpdump</code> is not enough. The web UI gives
          you graphs, top talkers, and per-source drill-downs, and the same data
          can be shared read-only with LibreNMS for unified monitoring.
        </p>

        <h2>Next steps</h2>
        <ul>
          <li>
            <Link href="/docs/installation">Install NetLens</Link> — deploy the
            container and open the dashboard.
          </li>
          <li>
            <Link href="/docs/managing-sources">
              Manage router sources
            </Link>{" "}
            — add and remove exporters.
          </li>
          <li>
            <Link href="/docs/data-retention">Set data retention</Link> — keep
            the disk from filling up.
          </li>
          <li>
            <Link href="/integration/librenms-integration">
              LibreNMS integration
            </Link>{" "}
            — show NetFlow graphs in LibreNMS.
          </li>
        </ul>

        <Callout type="info" title="Technology credits">
          This project is a Dockerized packaging of two open-source projects —
          all credit for the NetFlow analysis itself goes to{" "}
          <a
            href="https://sourceforge.net/projects/nfsen/"
            target="_blank"
            rel="noopener noreferrer"
          >
            NfSen
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/phaag/nfdump"
            target="_blank"
            rel="noopener noreferrer"
          >
            NfDump
          </a>
          . The repository itself is released under the BSD-3-Clause license.
        </Callout>
      </div>
    </DocsPageLayout>
  );
}
