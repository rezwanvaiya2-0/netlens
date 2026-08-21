import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NetLens logo"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient
          id="nl-grad"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#nl-grad)" />

      {/* dataflow pipe */}
      <rect
        x="11"
        y="14.5"
        width="18"
        height="11"
        rx="3"
        fill="rgba(11,20,23,0.13)"
        stroke="#0b1417"
        strokeWidth="2"
      />
      {/* flow chevron */}
      <path
        d="M16.5 17.5 l5 2.5 l-5 2.5"
        stroke="#0b1417"
        strokeWidth="2.3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* network nodes */}
      <circle cx="7" cy="20" r="2.7" fill="#0b1417" />
      <circle cx="33" cy="20" r="2.7" fill="#0b1417" />
    </svg>
  );
}
