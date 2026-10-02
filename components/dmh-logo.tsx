import React from "react";

export function DmhLogo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 select-none ${className}`}>
      <svg
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        {/* D */}
        <path
          d="M6 6H24C32 6 36 12 36 20C36 28 32 34 24 34H6V6ZM16 14V26H22C25 26 26.5 24 26.5 20C26.5 16 25 14 22 14H16Z"
          fill="#C1FD35"
        />
        {/* M */}
        <path
          d="M44 34V6H52L60 21L68 6H76V34H68V19L61.5 30H58.5L52 19V34H44Z"
          fill="#C1FD35"
        />
        {/* H */}
        <path
          d="M84 6H93V16H107V6H116V34H107V23H93V34H84V6Z"
          fill="#C1FD35"
        />
      </svg>
    </div>
  );
}
