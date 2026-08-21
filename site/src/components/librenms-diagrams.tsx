import {
  Activity,
  ArrowRight,
  BarChart3,
  Database,
  LayoutDashboard,
  Monitor,
  Router,
  Server,
  Waves,
} from "lucide-react";
import { FlowConnector, FlowDataChip, FlowStep } from "./flow-diagram";

/* Visual explanation of the nfdump invocation LibreNMS runs on its own server. */
export function NfdumpExplain() {
  return (
    <div className="my-5 rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        How LibreNMS reads the flow files
      </p>
      <div className="mt-4 rounded-xl border border-border/70 bg-muted/40 px-4 py-3.5 font-mono text-[0.85rem] leading-7 text-foreground">
        <span className="font-semibold text-primary">nfdump</span> -M{" "}
        <span className="text-cyan-600 dark:text-cyan-400">
          &lt;base&gt;/profiles-data/live/&lt;source&gt;
        </span>{" "}
        -T -R <span className="text-emerald-600 dark:text-emerald-400">&lt;range&gt;</span>{" "}
        -n <span className="text-amber-600 dark:text-amber-400">N</span> -s ...
      </div>
      <p className="mt-3 text-center text-sm leading-6 text-muted-foreground">
        Runs on the LibreNMS server itself — this is what produces the{" "}
        <strong className="text-foreground">"Top N"</strong> statistics.
      </p>
    </div>
  );
}

/* Visual architecture: VPS (one writer) -> read-only NFS -> LibreNMS. */
export function ArchitectureDiagram() {
  return (
    <div className="my-5 rounded-2xl border border-border bg-card/70 p-5 shadow-sm sm:p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Recommended architecture
      </p>

      <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Your VPS</p>
              <p className="text-xs text-muted-foreground">
                Docker NetLens · one writer
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-5 text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <code className="font-mono text-[0.8rem]">nfsen-data/</code>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                = profiles-data
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <code className="font-mono text-[0.8rem]">nfsen-stat/</code>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                = profiles-stat
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              <code className="font-mono text-[0.8rem]">nfsen-var/</code>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                not shared
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              <code className="font-mono text-[0.8rem]">nfsen-etc/</code>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                .htpasswd!
              </span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            NfSen writes here — only the Dockerized NfSen.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-center">
            <ArrowRight className="h-4 w-4 rotate-90 text-primary lg:rotate-0" />
            <span className="text-xs font-semibold text-primary">
              NFS · read-only
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Monitor className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                LibreNMS server
              </p>
              <p className="text-xs text-muted-foreground">reads, never writes</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-5 text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <code className="font-mono text-[0.8rem]">/var/nfsen/profiles-data</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <code className="font-mono text-[0.8rem]">/var/nfsen/profiles-stat</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
              <span className="font-mono text-[0.8rem]">nfdump 1.6.25</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
              <span className="font-mono text-[0.8rem]">RRD graphs</span>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Reads the raw flows + RRD graphs through NFS.
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-sm leading-6 text-muted-foreground">
        <strong className="text-foreground">One writer rule:</strong> the NFS
        share is read-only for LibreNMS, and NfSen never reads back from it — it
        can never corrupt data.
      </p>
    </div>
  );
}

/* Visual data flow from routers to the LibreNMS Netflow tab. */
export function LibreNMSDataFlow() {
  return (
    <div className="my-5 rounded-2xl border border-border bg-card/70 p-5 shadow-sm sm:p-6">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Data flow
      </p>
      <div className="mt-5 flex flex-col items-stretch">
        <FlowStep
          icon={Router}
          title="Router exporters"
          path="send NetFlow over UDP"
        />
        <FlowConnector />
        <FlowStep
          icon={Waves}
          title="UDP ports 2055 / 2056"
          path="published into the container"
        />
        <FlowConnector />
        <FlowStep
          icon={Activity}
          title="nfcapd"
          path="writes raw flow files to nfsen-data"
        />
        <FlowConnector />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FlowDataChip
            icon={Database}
            path="nfsen-data/live/"
            label="raw flows → nfsend → NfSen dashboard"
          />
          <FlowDataChip
            icon={BarChart3}
            path="nfsen-stat/live/"
            label="RRD graphs"
          />
        </div>
        <FlowConnector />
        <FlowStep
          icon={Server}
          title="NFS · read-only"
          path="LibreNMS server mounts the two folders"
        />
        <FlowConnector />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FlowDataChip
            icon={Activity}
            path="LibreNMS nfdump"
            label="Top-N statistics"
          />
          <FlowDataChip
            icon={LayoutDashboard}
            path="Netflow tab"
            label="graphs + stats per device"
          />
        </div>
      </div>
    </div>
  );
}
