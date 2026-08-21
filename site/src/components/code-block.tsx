import { Terminal } from "lucide-react";
import { highlightCode, type CodeLanguage } from "@/lib/highlight";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

export type CodeBlockProps = {
  code: string;
  lang?: CodeLanguage;
  title?: string;
  className?: string;
};

export async function CodeBlock({
  code,
  lang = "bash",
  title,
  className,
}: CodeBlockProps) {
  const html = await highlightCode(code, lang);
  const label = title ?? lang;

  return (
    <div
      className={cn(
        "codeblock overflow-hidden rounded-2xl border border-border bg-card shadow-md",
        className,
      )}
    >
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400" />
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Terminal className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </span>
        <CopyButton text={code} showLabel />
      </div>
      <div className="overflow-x-auto bg-[#f6f8fa] p-5 dark:bg-[#0d1117] sm:p-6">
        <div
          className="shiki-root"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
