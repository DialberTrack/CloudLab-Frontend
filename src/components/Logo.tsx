import { useId } from 'react';

export function Logo({ className = 'h-9 w-9' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const bg = `bg-${uid}`;
  const mask = `mask-${uid}`;
  const clip = `clip-${uid}`;
  const flask =
    'M58 38 H76 a2.5 2.5 0 0 1 0 5 H73 V58 L88 84 Q91 90 85 90 H49 Q43 90 46 84 L61 58 V43 H58 a2.5 2.5 0 0 1 0 -5 Z';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="CloudLab"
    >
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="1" stopColor="#0EA5E9" />
        </linearGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128">
          <rect width="128" height="128" fill="#fff" />
          <path d={flask} fill="#000" />
        </mask>
        <clipPath id={clip}>
          <path d={flask} />
        </clipPath>
      </defs>

      <rect width="512" height="512" rx="112" ry="112" fill={`url(#${bg})`} />

      <g transform="translate(76 76) scale(2.8125) translate(-3 3)">
        <g mask={`url(#${mask})`} fill="#FFFFFF">
          <circle cx="40" cy="74" r="22" />
          <circle cx="66" cy="54" r="28" />
          <circle cx="92" cy="72" r="24" />
          <rect x="40" y="72" width="52" height="24" />
        </g>
        <g clipPath={`url(#${clip})`}>
          <rect x="40" y="76" width="56" height="20" fill="#6EE7B7" />
        </g>
        <circle cx="63" cy="70" r="3" fill="#6EE7B7" />
        <circle cx="70" cy="64" r="2" fill="#6EE7B7" />
        <circle cx="67" cy="52" r="1.6" fill="#6EE7B7" />
      </g>
    </svg>
  );
}
