import {
  ArrowDown,
  Activity,
  BarChart3,
  Database,
  LayoutDashboard,
  Router,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function FlowStep({
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

function FlowDataChip({
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

function FlowConnector() {
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
