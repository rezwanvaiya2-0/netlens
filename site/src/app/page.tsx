import type { Metadata } from "next";
import Link from "next/link";
import {
  Radio,
  Database,
  BarChart3,
  Archive,
  Github,
  ArrowRight,
  Router,
  Waves,
  Activity,
  LayoutDashboard,
  ShieldCheck,
  MonitorSmartphone,
  AlertTriangle,
  KeyRound,
} from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { Terminal } from "@/components/terminal";
import { CodeBlock } from "@/components/code-block";
import { Callout } from "@/components/callout";
import { Logo } from "@/components/logo";
import { CopyButton } from "@/components/copy-button";
import { FlowDiagram } from "@/components/flow-diagram";
import { SITE } from "@/lib/site";

function Credential({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
      <KeyRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-mono text-xs font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}


export const metadata: Metadata = {
  title: "Dockerized NfSen NetFlow Analyzer",
  description:
    "NetLens: a self-contained Docker image that collects, stores, and visualizes NetFlow data — NfSen 1.3.6p1 + NfDump 1.6.17 with a password-protected Web UI. One command to deploy.",
};

const features = [
  {
    icon: Radio,
    title: "Capture",
    body: "Listen on UDP ports 2055/2056 and collect NetFlow v5, v9, and IPFIX from routers, firewalls, and edge devices.",
  },
  {
    icon: Database,
    title: "Store",
    body: "Keep flow data in real folders next to your stack — easy to inspect, back up, and rebuild, with no hidden Docker volumes.",
  },
  {
    icon: BarChart3,
    title: "Visualize",
    body: "Turn raw flows into readable RRD graphs and top-source summaries inside the built-in NfSen web interface.",
  },
  {
    icon: Archive,
    title: "Retain",
    body: "Apply expire and max-size rules directly in the UI so the daemon keeps your data clean without manual cleanup.",
  },
];

const pipeline = [
  { icon: Router, title: "Router", body: "Exports NetFlow data to your VPS over UDP." },
  { icon: Waves, title: "Ports", body: "Published UDP ports carry traffic into the container." },
  { icon: Activity, title: "nfcapd", body: "Raw flow files are written automatically per source." },
  { icon: BarChart3, title: "nfsend", body: "RRD graphs and top-traffic summaries are generated." },
  { icon: LayoutDashboard, title: "Dashboard", body: "Review charts, sources, and stats from the web UI." },
];

export default function HomePage() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-3xl" />

        <div className="container relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Logo size={16} />
                Network visibility, simplified
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                See every{" "}
                <span className="gradient-text">network flow</span> in one clean
                dashboard
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                NetLens is a fast, Docker-based way to capture, store, and
                analyze NetFlow traffic from routers and switches — with a
                polished, password-protected web UI and no messy setup process.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#install"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
                >
                  Deploy now
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>
            </FadeIn>
            <FadeIn delay={0.32}>
              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  "NfSen 1.3.6p1",
                  "NfDump 1.6.17",
                  "Ubuntu 20.04",
                  "Docker-ready",
                  "Web UI :8070",
                ].map((b) => (
                  <span
                    key={b}
                    className="rounded-md border border-border bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.2}>
            <div className="animate-float">
              <Terminal />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===================== FEATURES ===================== */}
      <section className="container py-20">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Features
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Built for clear network visibility
            </h2>
            <p className="mt-3 text-muted-foreground">
              Collect raw NetFlow data and turn it into actionable traffic
              insights — without managing a complex stack by hand.
            </p>
          </div>
        </FadeIn>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.07}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {f.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="container py-20">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                How it works
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                From router export to clean traffic insights
              </h2>
            </div>
          </FadeIn>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pipeline.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.06}>
                <div className="relative h-full rounded-2xl border border-border bg-card p-5 shadow-sm">
                  {i < pipeline.length - 1 && (
                    <span className="absolute -right-3.5 top-1/2 hidden -translate-y-1/2 text-muted-foreground lg:block">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <p.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {p.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <div className="mx-auto mt-12 max-w-xl">
              <FlowDiagram />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===================== INSTALL ===================== */}
      <section id="install" className="scroll-mt-20">
        <div className="container py-20">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Installation
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Deploy in minutes
              </h2>
              <p className="mt-3 text-muted-foreground">
                Any VPS or Linux box with Docker — clone, build, and start
                collecting flow data right away.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="mx-auto mt-10 max-w-3xl">
              <CodeBlock
                lang="bash"
                title="quick start"
                code={`# 1. Clone the repository
git clone ${SITE.github}.git
cd netlens

# 2. Build and start NetLens
sudo ./install.sh`}
              />
              <Callout type="ok" title="First run only">
                The initial build compiles NfSen + NfDump from source (~7
                minutes). After that, <code>docker compose up -d</code> starts
                the stack in seconds and keeps your sources, config, and data
                intact.
              </Callout>
            </div>
          </FadeIn>
          <FadeIn delay={0.18}>
            <div className="mx-auto mt-8 max-w-2xl">
              <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur sm:p-8">
                <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  First login
                </p>

                <div className="mt-6 rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <MonitorSmartphone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        Open the dashboard
                      </p>
                      <p className="truncate font-mono text-xs text-primary">
                        http://&lt;YOUR_IP&gt;:8070/nfsen.php
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Credential label="Username" value="admin" />
                    <Credential label="Password" value="change-me-now" />
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        Change the password immediately
                      </p>
                      <p className="mt-0.5 text-sm leading-6 text-foreground/80">
                        One command, takes effect instantly — no restart needed:
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-border bg-background/70 px-3 py-2.5">
                        <code className="min-w-0 break-all font-mono text-[0.9rem] leading-6 text-foreground">
                          docker exec netlens htpasswd -b
                          /var/nfsen/etc/.htpasswd admin YourNewPass123
                        </code>
                        <CopyButton
                          text="docker exec netlens htpasswd -b /var/nfsen/etc/.htpasswd admin YourNewPass123"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-4">
              <Link
                href="/docs/installation"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5"
              >
                Read the full installation guide
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs/introduction"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent"
              >
                Explore the docs
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===================== DOCS ===================== */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="container py-20">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Documentation
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Helpful guides
              </h2>
              <p className="mt-3 text-muted-foreground">
                Deeper details for integrations, operations, and troubleshooting.
              </p>
            </div>
          </FadeIn>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {[
              {
                href: "/integration/librenms-integration",
                kicker: "Integration",
                title: "LibreNMS Integration",
                body: "Share flow data read-only over NFS and view NetFlow graphs and Top-N stats directly inside LibreNMS.",
              },
              {
                href: "/reference/commands",
                kicker: "Reference",
                title: "Commands Cheatsheet",
                body: "Every docker exec and docker compose command for sources, retention, and daily operations.",
              },
              {
                href: "/docs/troubleshooting",
                kicker: "Support",
                title: "Troubleshooting",
                body: "Common failures — from “Can not initialize globals” to a full disk — and the exact fixes.",
              },
            ].map((c, i) => (
              <FadeIn key={c.title} delay={i * 0.08}>
                <Link
                  href={c.href}
                  className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    {c.kicker}
                  </p>
                  <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold text-foreground">
                    {c.title}
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {c.body}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.15}>
            <div className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-foreground/80">
                The web UI is password-protected and sessions auto-expire after
                one hour of inactivity.{" "}
                <Link
                  href="/reference/security"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Read the security notes
                </Link>
                .
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
