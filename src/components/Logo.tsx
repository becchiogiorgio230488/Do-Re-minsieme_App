import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const LogoDoReMInsieme: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const sizeMap = {
    sm: { height: 32, scale: 0.7 },
    md: { height: 44, scale: 1 },
    lg: { height: 60, scale: 1.35 },
    xl: { height: 80, scale: 1.8 },
  };

  const { height } = sizeMap[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 200"
        height={height}
        className="w-auto overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Logo Do-Re-MInsieme"
      >
        <defs>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* 1. Musical Note (Golden Yellow) */}
        <g id="musical-note">
          {/* Note head (angled oval) */}
          <ellipse
            cx="72"
            cy="110"
            rx="26"
            ry="19"
            transform="rotate(-26 72 110)"
            fill="#FFB703"
          />
          {/* Note stem */}
          <rect
            x="86"
            y="32"
            width="12"
            height="80"
            rx="5"
            fill="#FFB703"
          />
          {/* Note flag / beam curve */}
          <path
            d="M93 34 C 112 18, 126 34, 134 46 C 122 42, 107 48, 93 54 Z"
            fill="#FFB703"
          />
        </g>

        {/* 2. Red Circle (Coral Red) */}
        <circle
          cx="145"
          cy="92"
          r="36"
          fill="#EF233C"
        />

        {/* 3. Cyan Circle 1 */}
        <circle
          cx="212"
          cy="98"
          r="34"
          fill="#00B4D8"
        />

        {/* 4. Orange Crest / Tuft / Swoosh */}
        <path
          d="M 276 96 C 274 62, 252 28, 280 12 C 298 2, 322 36, 314 90 C 302 96, 288 98, 276 96 Z"
          fill="#F77F00"
        />
        {/* Yellow interior accent in crest */}
        <path
          d="M 284 84 C 280 58, 268 36, 282 22 C 289 28, 292 46, 290 82 Z"
          fill="#FFB703"
        />

        {/* 5. Cyan Circle 2 */}
        <circle
          cx="302"
          cy="104"
          r="36"
          fill="#00B4D8"
        />

        {/* Playful Floating Dots & Hearts under circles */}
        {/* Cyan dot 1 */}
        <circle cx="74" cy="144" r="7.5" fill="#00B4D8" />

        {/* Yellow/Orange dot */}
        <circle cx="128" cy="154" r="5" fill="#FFB703" />

        {/* Orange Heart */}
        <path
          d="M 160 148 C 160 143, 154 139, 149 143 C 144 139, 138 143, 138 148 C 138 156, 149 162, 149 162 C 149 162, 160 156, 160 148 Z"
          fill="#F77F00"
          transform="rotate(12 149 150)"
        />

        {/* Cyan dot 2 */}
        <circle cx="198" cy="146" r="6.5" fill="#00B4D8" />

        {/* Red Heart */}
        <path
          d="M 264 148 C 264 143, 258 139, 253 143 C 248 139, 242 143, 242 148 C 242 156, 253 162, 253 162 C 253 162, 264 156, 264 148 Z"
          fill="#EF233C"
          transform="rotate(-10 253 150)"
        />

        {/* Cyan dot 3 */}
        <circle cx="334" cy="147" r="7" fill="#00B4D8" />

        {/* Text Logo: DO-RE-MInsieme */}
        {showText && (
          <g transform="translate(10, 192)">
            <text
              fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif"
              fontWeight="900"
              fontSize="37"
              letterSpacing="-0.5"
            >
              <tspan fill="#EF233C">DO</tspan>
              <tspan fill="#C45A30">-</tspan>
              <tspan fill="#FFB703">RE</tspan>
              <tspan fill="#C45A30">-</tspan>
              <tspan fill="#00B4D8">MI</tspan>
              <tspan fill="#F77F00">nsieme</tspan>
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
