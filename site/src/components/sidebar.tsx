import Link from "next/link";
import { docsNav } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <nav
      aria-label="Documentation navigation"
      className="scroll-area h-full overflow-y-auto py-8 pr-4"
    >
      {docsNav.map((group) => (
        <div key={group.label} className="mb-8">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active =
                activePath === item.href ||
                (item.href === "/docs/introduction" &&
                  activePath === "/docs");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      active &&
                        "bg-accent font-medium text-foreground shadow-sm",
                    )}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
