interface PinataIconProps {
  className?: string;
  color?: string;
  glow?: boolean;
}

export default function PinataIcon({
  className,
  color = "#3a0a5e",
  glow = false,
}: PinataIconProps) {
  return (
    <svg
      viewBox="0 0 200 240"
      className={className}
      role="img"
      aria-label="Illustrated spin pinata"
    >
      <defs>
        <linearGradient id="pinata-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <line x1="100" y1="0" x2="100" y2="34" stroke="#b5472b" strokeWidth="3" />

      <ellipse cx="100" cy="130" rx="72" ry="92" fill={color} />
      <ellipse cx="100" cy="130" rx="72" ry="92" fill="url(#pinata-shade)" />

      {[-50, -25, 0, 25, 50].map((dy, i) => (
        <ellipse
          key={i}
          cx="100"
          cy={130 + dy}
          rx="72"
          ry="10"
          fill="none"
          stroke="#e7b740"
          strokeWidth="4"
          opacity={0.85}
        />
      ))}

      {Array.from({ length: 7 }).map((_, i) => {
        const x = 38 + i * 17;
        return (
          <path
            key={i}
            d={`M${x} 215 q-4 14 -10 24`}
            stroke="#e7b740"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            opacity={0.9}
          />
        );
      })}

      <circle cx="100" cy="34" r="6" fill="#e7b740" />

      {glow && (
        <g opacity="0.9">
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const x = 100 + Math.cos(angle) * 60;
            const y = 130 + Math.sin(angle) * 78;
            return <circle key={i} cx={x} cy={y} r="3" fill="#f6d678" />;
          })}
        </g>
      )}
    </svg>
  );
}
