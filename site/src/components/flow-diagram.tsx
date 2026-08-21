import {
  ArrowDown,
  ArrowLeftRight,
  Activity,
  BarChart3,
  Database,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Router,
  Settings2,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function FlowStep({
  icon: Icon,
  title,
  path,
}: {
  icon: LucideIcon;
  title: string;
  path: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="truncate font-mono text-xs text-muted-foreground">
          {path}
        </p>
      </div>
    </div>
  );
}

export function FlowDataChip({
  icon: Icon,
  path,
  label,
  className,
}: {
  icon: LucideIcon;
  path: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-center",
        className,
      )}
    >
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1.5 break-all font-mono text-xs font-medium leading-5 text-foreground">
        {path}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function FlowConnector() {
  return (
    <div className="flex justify-center py-1.5">
      <div className="flex flex-col items-center">
        <div className="h-3 w-px bg-border" />
        <ArrowDown className="h-3.5 w-3.5 text-primary/70" />
      </div>
    </div>
  );
}

export function FlowDiagram({
  heading = "Flow pipeline",
  className,
}: {
  heading?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-6 shadow-xl backdrop-blur sm:p-8",
        className,
      )}
    >
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {heading}
      </p>
      <div className="mt-6 flex flex-col items-stretch">
        <FlowStep
          icon={Router}
          title="Router"
          path="exports NetFlow v5 / v9 / IPFIX over UDP"
        />
        <FlowConnector />
        <FlowStep
          icon={Waves}
          title="VPS ports 2055 / 2056"
          path="Docker publishes the UDP ports into the container"
        />
        <FlowConnector />
        <FlowStep
          icon={Activity}
          title="nfcapd collector"
          path="writes one raw flow file per 5-minute window"
        />
        <FlowConnector />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FlowDataChip
            icon={Database}
            path="nfsen-data/live/&lt;router&gt;/"
            label="raw flow files"
          />
          <FlowDataChip
            icon={BarChart3}
            path="nfsen-stat/live/&lt;router&gt;.rrd"
            label="RRD graphs"
          />
        </div>
        <FlowConnector />
        <FlowStep
          icon={LayoutDashboard}
          title="Web UI · :8070/nfsen.php"
          path="graphs, top talkers, and per-source drill-downs"
        />
      </div>
    </div>
  );
}

/* Visual: how a router's traffic becomes graphs (new-port guide). */
export function RouterFlowDiagram() {
  return (
    <div className="my-5 rounded-2xl border border-border bg-card/70 p-5 shadow-sm sm:p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Router to graph
      </p>
      <div className="mt-5 flex flex-col items-stretch">
        <FlowStep
          icon={Router}
          title="Your router"
          path="sends UDP NetFlow to the VPS"
        />
        <FlowConnector />
        <FlowStep
          icon={Waves}
          title="VPS port 2070"
          path="Docker publishes the UDP port into the container"
        />
        <FlowConnector />
        <FlowStep
          icon={Activity}
          title="nfcapd collector"
          path="started from the nfsen.conf source for that port"
        />
        <FlowConnector />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FlowDataChip
            icon={Database}
            path="nfsen-data/live/&lt;router&gt;/"
            label="raw flow files"
          />
          <FlowDataChip
            icon={BarChart3}
            path="nfsen-stat/live/&lt;router&gt;.rrd"
            label="RRD graphs (every 5 min)"
          />
        </div>
        <FlowConnector />
        <FlowStep
          icon={LayoutDashboard}
          title="Web UI · :8070/nfsen.php"
          path="graphs, top talkers, and drill-downs"
        />
      </div>
    </div>
  );
}

const bindMountRows = [
  {
    icon: Database,
    host: "./nfsen-data/",
    container: "/var/nfsen/profiles-data/",
    purpose: "raw NetFlow files",
  },
  {
    icon: BarChart3,
    host: "./nfsen-stat/",
    container: "/var/nfsen/profiles-stat/",
    purpose: "RRD graph files",
  },
  {
    icon: FileText,
    host: "./nfsen-var/",
    container: "/var/nfsen/var/",
    purpose: "logs + runtime",
  },
  {
    icon: Settings2,
    host: "./nfsen-etc/",
    container: "/var/nfsen/etc/",
    purpose: "nfsen.conf (sources)",
  },
];

/* Visual: bind mounts — one host folder shared with a path inside the container. */
export function BindMountDiagram() {
  return (
    <div className="my-5 rounded-2xl border border-border bg-card/70 p-5 shadow-sm sm:p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Bind mount layout
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>VPS host (your server)</span>
        <span>shared</span>
        <span>Inside the container</span>
      </div>
      <div className="mt-2 space-y-3">
        {bindMountRows.map((row) => (
          <div
            key={row.host}
            className="grid grid-cols-3 items-center gap-3"
          >
            <div className="flex items-center justify-end gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
              <span className="truncate font-mono text-[0.8rem] text-foreground">
                {row.host}
              </span>
            </div>
            <div className="flex items-center justify-center text-primary">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
              <row.icon className="h-3.5 w-3.5 shrink-0 text-primary" />
              <div className="min-w-0 text-left">
                <p className="truncate font-mono text-[0.8rem] text-foreground">
                  {row.container}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {row.purpose}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
        <FolderKanban className="mr-1.5 inline h-4 w-4 text-primary" />
        Both sides see the <strong className="text-foreground">same files</strong> —
        what the container writes into its path lands in the host folder.
      </p>
    </div>
  );
}
