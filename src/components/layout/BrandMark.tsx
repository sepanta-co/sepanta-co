interface BrandMarkProps {
  className?: string;
}

/**
 * Minimal geometric architectural window-frame emblem (28x28).
 */
export function BrandMark({ className = "h-7 w-7" }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="2.5"
        y="2.5"
        width="23"
        height="23"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="14"
        y1="2.5"
        x2="14"
        y2="25.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <line
        x1="2.5"
        y1="14"
        x2="25.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect x="16.5" y="5.5" width="6" height="6" fill="#B45309" />
    </svg>
  );
}
