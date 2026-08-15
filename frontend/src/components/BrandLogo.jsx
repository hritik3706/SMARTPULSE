export function BrandLogo({ size = 40 }) {
  return (
    <svg
      className="brand-logo"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sp-mark" x1="8" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="13" fill="url(#sp-mark)" />
      <path
        className="brand-pulse"
        d="M7 21.5h6.2l2.6-8.8 3.7 15.6 2.8-9.2 2.1 2.4H33"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
