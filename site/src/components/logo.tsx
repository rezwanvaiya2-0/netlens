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
        <linearGradient id="nl-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#nl-grad)" />
      <g stroke="#0b1417">
        <circle cx="20" cy="20" r="10" strokeWidth="1.7" opacity="0.85" />
        <circle cx="20" cy="20" r="5.4" strokeWidth="1.4" opacity="0.6" />
        <path d="M20 20 L20 10" strokeWidth="1.7" strokeLinecap="round" />
      </g>
      <circle cx="20" cy="20" r="2.7" fill="#0b1417" />
      <circle cx="20" cy="10" r="2.3" fill="#0b1417" />
      <circle cx="27.2" cy="14.8" r="1.8" fill="#0b1417" />
      <circle cx="14" cy="15.6" r="1.8" fill="#0b1417" />
      <circle cx="22.6" cy="27" r="1.8" fill="#0b1417" />
    </svg>
  );
}
