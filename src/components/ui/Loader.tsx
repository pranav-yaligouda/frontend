import * as React from "react";

/**
 * A beautiful, accessible, theme-aware spinner loader for Suspense and data fetching.
 */
const Loader: React.FC<{ size?: number; className?: string }> = ({ size = 48, className = "" }) => (
  <div className={`flex items-center justify-center w-full h-full py-10 ${className}`} role="status" aria-live="polite">
    <svg
      className="animate-spin text-primary"
      width={size}
      height={size}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="25"
        cy="25"
        r="20"
        stroke="currentColor"
        strokeWidth="5"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M25 5a20 20 0 0 1 20 20h-5a15 15 0 1 0-15 15v5A20 20 0 0 1 25 5z"
      />
    </svg>
    <span className="sr-only">Loading...</span>
  </div>
);

export default Loader;
