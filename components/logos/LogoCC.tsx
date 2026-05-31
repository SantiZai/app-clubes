import React from "react";

const LogoCC = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    role="img"
    aria-label="Logo CC"
    {...props}
  >
    <defs>
      <linearGradient id="g1" x1="0" x2="1">
        <stop offset="0" stopColor="#00E5A0" />
        <stop offset="1" stopColor="#00C887" />
      </linearGradient>
    </defs>
    <rect rx="12" width="64" height="64" fill="url(#g1)" />
    <text
      x="32"
      y="38"
      fontFamily="Inter, sans-serif"
      fontSize="20"
      fontWeight={700}
      textAnchor="middle"
      fill="#081013"
    >
      CC
    </text>
  </svg>
);

export default LogoCC;
