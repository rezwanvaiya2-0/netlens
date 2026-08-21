import { CopyButton } from "./copy-button";
import { TypingCommand } from "./typing-command";
import { SITE } from "@/lib/site";

export function Terminal() {
  const fullCommand = SITE.installCommands.join("\n");

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/50 px-4 py-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          netlens — deploy
        </span>
        <CopyButton text={fullCommand} showLabel />
      </div>
      <div className="min-h-[7.5rem] p-5 font-mono text-sm leading-7">
        <TypingCommand lines={SITE.installCommands} />
      </div>
    </div>
  );
}
