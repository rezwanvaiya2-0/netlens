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

  return (
    <div
      className={cn(
        "codeblock overflow-hidden rounded-xl border border-border bg-muted/40 shadow-sm",
        className,
      )}
    >
      {(title || lang) && (
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            </span>
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              {title ?? lang}
            </span>
          </div>
          <CopyButton text={code} />
        </div>
      )}
      <div className="overflow-x-auto p-4">
        <div
          className="shiki-root"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
