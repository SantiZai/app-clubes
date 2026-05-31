import React from "react";

const LogoAV = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Logo AV"
    {...props}
  >
    <defs>
      <linearGradient id="g2" x1="0" x2="1">
        <stop offset="0" stopColor="#00E5A0" />
        <stop offset="1" stopColor="#00C887" />
      </linearGradient>
    </defs>
    <rect rx="12" width="64" height="64" fill="url(#g2)" />
    <text
      x="32"
      y="38"
      fontFamily="Inter, sans-serif"
      fontSize="20"
      fontWeight={700}
      textAnchor="middle"
      fill="#081013"
    >
      AV
    </text>
  </svg>
);

export default LogoAV;
