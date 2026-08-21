import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsPageLayout } from "@/components/docs-layout";
import { PageHeader } from "@/components/page-header";
import { docsNav } from "@/lib/docs-nav";
import { Callout } from "@/components/callout";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Install, operate, and integrate the Dockerized NfSen NetFlow analyzer.",
};

export default function DocsIndexPage() {
  const flat = docsNav.flatMap((g) => g.items);
  return (
    <DocsPageLayout href="/docs">
      <PageHeader
        kicker="Docs"
        title="NetLens documentation"
        description="A practical field guide for deploying NetLens, connecting exporters, managing storage, and sending flow data into LibreNMS."
      />

      <div className="docs">
        <div className="grid gap-4 sm:grid-cols-2">
          {flat.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </span>
              {item.description && (
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        <h2>Choose a path</h2>
        <ul>
          <li>
            <strong>New deployment:</strong> follow the{" "}
            <Link href="/docs/installation">installation guide</Link>, then add
            a router source.
          </li>
          <li>
            <strong>Existing deployment:</strong> use the{" "}
            <Link href="/docs/managing-sources">sources</Link> and{" "}
            <Link href="/docs/data-retention">retention</Link> guides for
            day-to-day changes.
          </li>
          <li>
            <strong>LibreNMS on another host:</strong> read the{" "}
            <Link href="/integration/librenms-integration">
              LibreNMS integration guide
            </Link>{" "}
            in full before changing exports.
          </li>
        </ul>

        <Callout type="info" title="Documentation scope">
          NetLens packages NfSen 1.3.6p1 and NfDump 1.6.17 in Docker. The
          integration guide calls out the separate nfdump 1.6.25 build required
          by Ubuntu 24.04 LibreNMS hosts.
        </Callout>
      </div>
    </DocsPageLayout>
  );
}