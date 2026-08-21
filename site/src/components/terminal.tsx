import { TypingCommand } from "./typing-command";
import { SITE } from "@/lib/site";

export function Terminal() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          netlens — deploy
        </span>
      </div>
      <div className="min-h-[7.5rem] p-5 font-mono text-sm leading-7">
        <TypingCommand lines={SITE.installCommands} />
      </div>
    </div>
  );
}
