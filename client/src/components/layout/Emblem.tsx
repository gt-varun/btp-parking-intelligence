// Stylized Gandaberunda (two-headed eagle) placeholder mark.
export function Emblem({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="Karnataka State Emblem">
      <defs>
        <radialGradient id="emb-g" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <g fill="url(#emb-g)">
        {/* body */}
        <path d="M32 28c-3 0-5 2-5 5v8c0 4 2 6 5 6s5-2 5-6v-8c0-3-2-5-5-5z" />
        {/* left head */}
        <path d="M27 22c-2-1-4 0-5 2-1 2 0 4 2 5l3-1 1-3-1-3z" />
        {/* right head */}
        <path d="M37 22c2-1 4 0 5 2 1 2 0 4-2 5l-3-1-1-3 1-3z" />
        {/* wings */}
        <path d="M22 32c-4 1-7 4-8 8 3-2 6-3 9-3l-1-5z" />
        <path d="M42 32c4 1 7 4 8 8-3-2-6-3-9-3l1-5z" />
        {/* crown */}
        <path d="M28 18l2-3 2 3 2-3 2 3v3h-8z" />
      </g>
    </svg>
  );
}
