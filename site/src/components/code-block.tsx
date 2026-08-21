import { ChevronRight } from "lucide-react";
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
        "codeblock overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">{label}</span>
        </span>
        <CopyButton text={code} showLabel />
      </div>
      <div className="overflow-x-auto bg-muted/40 p-5">
        <div
          className="shiki-root"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
