import type { Metadata } from "next";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Managing Router Sources",
  description:
    "Add, list, and remove NetFlow sources in nfsen.conf, plus the multi-source IP requirement.",
};

export default function ManagingSourcesPage() {
  return (
    <DocsPageLayout href="/docs/managing-sources">
      <PageHeader
        kicker="Docs"
        title="Managing Router Sources"
        description="Every router that sends NetFlow needs a source in nfsen.conf. These docker exec commands add, list, and remove them — and the changes persist forever in nfsen-etc/."
      />

      <div className="docs">
        <h2>Add a source with IP</h2>
        <p>
          Replace <code>NAME</code>, <code>IP_ADDRESS</code>, and{" "}
          <code>COLOR</code> with your values:
        </p>
        <CodeBlock
          lang="bash"
          title="add source"
          code={`docker exec netlens bash -c "sed -i \\"/^);$/i\\\\    'NAME' => { 'port' => '2055', 'IP' => 'IP_ADDRESS', 'col' => '#COLOR', 'type' => 'netflow' },\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Done'"`}
        />
        <Callout type="warn" title="Existing sources without IP?">
          If you have existing sources without an IP field, this command will
          fail! You must first add <code>'IP' =&gt; '0.0.0.0'</code> to all
          existing sources before adding a new one with an IP.
        </Callout>

        <h2>Remove a source</h2>
        <p>
          Replace <code>NAME</code> with your source name (e.g.{" "}
          <code>router1</code>):
        </p>
        <CodeBlock
          lang="bash"
          title="remove source"
          code={`docker exec netlens bash -c "sed -i \\"/'NAME' =>/d\\" /var/nfsen/etc/nfsen.conf && /var/nfsen/bin/nfsen reconfig && echo 'Removed'"`}
        />

        <h2>List all sources</h2>
        <CodeBlock
          lang="bash"
          title="list sources"
          code={`docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf`}
        />

        <h2>Check NfSen status</h2>
        <CodeBlock
          lang="bash"
          title="status"
          code={`docker exec netlens /var/nfsen/bin/nfsen status`}
        />

        <h2>Why sources persist forever</h2>
        <p>
          <code>nfsen.conf</code> lives in the <code>nfsen-etc/</code> bind
          mount, so router sources added via <code>docker exec</code> survive
          restarts, recreates, and even rebuilds. No environment variables are
          required for day-to-day source management. The{" "}
          <code>NFSEN_SOURCES</code> env var is optional — use it only if you
          prefer managing sources in <code>docker-compose.yml</code> instead.
        </p>

        <h2>IP requirement for multiple sources</h2>
        <p>
          When you have <strong>more than one source</strong> configured, NfSen
          requires <strong>all</strong> sources to have an <code>IP</code>{" "}
          field. If you add a source with an IP while existing sources lack
          one, the command will fail. Fix this by manually adding{" "}
          <code>'IP' =&gt; '0.0.0.0'</code> to each existing source first, then
          update the auto-filled IPs with the actual source IPs by editing the
          config directly.
        </p>

        <CodeBlock
          lang="bash"
          title="check current sources"
          code={`docker exec netlens grep -A 20 '%sources' /var/nfsen/etc/nfsen.conf`}
        />

        <Callout type="info" title="Source names matter for LibreNMS">
          Keep source identifiers short and stable. NfSen idents are limited to
          21 characters, and LibreNMS matching replaces dots with the
          configured split character. See the{" "}
          <a href="/integration/librenms-integration">LibreNMS integration
          guide</a> for the naming contract.
        </Callout>
      </div>
    </DocsPageLayout>
  );
}
