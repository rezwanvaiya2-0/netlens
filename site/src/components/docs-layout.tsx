import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { getPrevNext, type NavItem } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";

export function DocsPageLayout({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { prev, next } = getPrevNext(href);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-16 h-[calc(100vh-4rem)]">
            <Sidebar activePath={href} />
          </div>
        </aside>
        <main className="min-w-0 pb-16 pt-10">
          <article className="mx-auto max-w-3xl">{children}</article>
          <nav className="mx-auto mt-14 flex max-w-3xl items-stretch justify-between gap-4 border-t border-border/70 pt-8">
            {prev ? (
              <PagerLink item={prev} direction="prev" />
            ) : (
              <span />
            )}
            {next ? (
              <PagerLink item={next} direction="next" />
            ) : (
              <span />
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}

function PagerLink({
  item,
  direction,
}: {
  item: NavItem;
  direction: "prev" | "next";
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex max-w-[45%] flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md",
        direction === "next" ? "items-end text-right" : "items-start",
      )}
    >
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {direction === "prev" ? (
          <>
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Previous
          </>
        ) : (
          <>
            Next
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </span>
      <span className="text-sm font-semibold text-foreground">
        {item.title}
      </span>
    </Link>
  );
}
