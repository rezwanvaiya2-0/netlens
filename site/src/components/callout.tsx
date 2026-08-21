import { AlertTriangle, CircleAlert, Info, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "warn" | "danger" | "ok";

const styles: Record<
  CalloutVariant,
  { container: string; icon: React.ReactNode; label: string }
> = {
  info: {
    container: "border-cyan-500/40 bg-cyan-500/10",
    icon: <Info className="h-4 w-4 text-cyan-500" />,
    label: "Note",
  },
  warn: {
    container: "border-amber-500/40 bg-amber-500/10",
    icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    label: "Warning",
  },
  danger: {
    container: "border-rose-500/40 bg-rose-500/10",
    icon: <CircleAlert className="h-4 w-4 text-rose-500" />,
    label: "Danger",
  },
  ok: {
    container: "border-emerald-500/40 bg-emerald-500/10",
    icon: <CircleCheck className="h-4 w-4 text-emerald-500" />,
    label: "Good to know",
  },
};

export function Callout({
  type = "info",
  title,
  children,
  className,
}: {
  type?: CalloutVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const s = styles[type];
  return (
    <div
      className={cn(
        "my-5 rounded-xl border px-4 py-3.5 first:mt-0 last:mb-0",
        s.container,
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{s.icon}</span>
        <div className="min-w-0 flex-1">
          {title && (
            <p className="mb-1 text-sm font-semibold text-foreground">
              {title}
            </p>
          )}
          <div className="space-y-2 text-sm leading-6 text-foreground/80 [&_code]:rounded [&_code]:border [&_code]:border-border [&_code]:bg-background/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
