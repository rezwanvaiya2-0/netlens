import { Github } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";
import { SITE } from "@/lib/site";
import { docsNav } from "@/lib/docs-nav";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-muted/20">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="text-lg font-bold text-foreground">NetLens</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Dockerized NfSen NetFlow Analyzer — collect, store, and visualize
            NetFlow data in one self-contained container.
          </p>
          <a
            href={SITE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            {SITE.githubRepo}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {docsNav.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <ul className="mt-3 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-border/60 py-6">
        <div className="container flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} NetLens · Released under the BSD-3-Clause
            license.
          </p>
          <p>Built with Next.js · NfSen 1.3.6p1 + NfDump 1.6.17</p>
        </div>
      </div>
    </footer>
  );
}
