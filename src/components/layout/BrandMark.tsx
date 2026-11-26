interface BrandMarkProps {
  className?: string;
}

/**
 * Precision architectural window-mullion emblem (28x28).
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
        x="2"
        y="2"
        width="24"
        height="24"
        stroke="currentColor"
        strokeWidth="2"
      />
      <line
        x1="14"
        y1="2"
        x2="14"
        y2="26"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="2"
        y1="14"
        x2="26"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect x="16.5" y="4.5" width="7" height="7" fill="#B45309" />
    </svg>
  );
}
