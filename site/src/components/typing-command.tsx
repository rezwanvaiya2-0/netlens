"use client";

import { useEffect, useState } from "react";

export function TypingCommand({
  lines,
  prompt = "$",
  className,
}: {
  lines: readonly string[];
  prompt?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(0);
  const [typed, setTyped] = useState(0);
  const done = typed >= lines.length;

  useEffect(() => {
    if (visible >= lines.length) return;
    const line = lines[visible];
    const timeout = setTimeout(() => {
      if (typed < line.length) {
        setTyped(typed + 1);
      } else {
        setVisible(visible + 1);
        setTyped(0);
      }
    }, typed === 0 && visible > 0 ? 340 : 55);
    return () => clearTimeout(timeout);
  }, [typed, visible, lines]);

  return (
    <div className={className}>
      {lines.map((line, i) => {
        const isActive = i === visible;
        const showCount = isActive ? typed : line.length;
        const isVisibleLine = i < visible || isActive;
        if (!isVisibleLine) return null;
        return (
          <div key={i} className="flex flex-wrap items-baseline gap-x-2">
            <span className="select-none font-semibold text-emerald-400">
              {prompt}
            </span>
            <span className="min-w-0 break-words text-foreground/90">
              {line.slice(0, showCount)}
            </span>
            {isActive && (
              <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 animate-blink bg-cyan-400" />
            )}
          </div>
        );
      })}
    </div>
  );
}
