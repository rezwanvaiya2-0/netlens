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

      <g stroke="#0b1417" strokeWidth="1.3" opacity="0.65" strokeLinecap="round">
        <line x1="13" y1="13.2" x2="19.5" y2="16.6" />
        <line x1="19.5" y1="16.6" x2="23" y2="11.4" />
        <line x1="19.5" y1="16.6" x2="23.8" y2="20" />
        <line x1="19.5" y1="16.6" x2="15.2" y2="21.8" />
      </g>

      <circle
        cx="18.5"
        cy="16.6"
        r="9.6"
        fill="rgba(11,20,23,0.12)"
        stroke="#0b1417"
        strokeWidth="2.1"
      />
      <line
        x1="25.6"
        y1="23.7"
        x2="33"
        y2="31.2"
        stroke="#0b1417"
        strokeWidth="3.4"
        strokeLinecap="round"
      />

      <circle cx="19.5" cy="16.6" r="2.3" fill="#0b1417" />
      <circle cx="13" cy="13.2" r="1.6" fill="#0b1417" />
      <circle cx="23" cy="11.4" r="1.6" fill="#0b1417" />
      <circle cx="23.8" cy="20" r="1.6" fill="#0b1417" />
      <circle cx="15.2" cy="21.8" r="1.6" fill="#0b1417" />
    </svg>
  );
}
