/**
 * Logo – Inline SVG logo for Loan Shark Admin
 * Props:
 *   size   – pixel size (default 34)
 *   radius – corner radius (default 8)
 */
const Logo = ({ size = 34, radius = 8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Loan Shark logo"
  >
    <rect width="40" height="40" rx={radius} fill="#1d4ed8" />
    {/* Dollar sign – clean, geometric */}
    <rect x="18.5" y="7" width="3" height="26" rx="1.5" fill="white" />
    <rect x="14" y="10" width="10" height="3.5" rx="1.75" fill="white" />
    <rect x="11.5" y="10" width="3.5" height="7" rx="1.75" fill="white" />
    <rect x="13" y="18.25" width="14" height="3.5" rx="1.75" fill="white" />
    <rect x="25" y="21.75" width="3.5" height="7" rx="1.75" fill="white" />
    <rect x="16" y="26.5" width="10" height="3.5" rx="1.75" fill="white" />
  </svg>
);

export default Logo;
