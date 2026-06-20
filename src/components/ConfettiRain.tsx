const COLORS = [
  "#e7b740",
  "#f6d678",
  "#d11f2c",
  "#1f8a4c",
  "#2459c7",
  "#f3a0c2",
];

const PIECES = Array.from({ length: 24 }).map((_, i) => ({
  left: (i * 4.3) % 100,
  delay: (i % 8) * 0.5,
  duration: 4 + (i % 5) * 0.6,
  color: COLORS[i % COLORS.length],
  size: 6 + (i % 3) * 3,
}));

export default function ConfettiRain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="animate-confetti-fall absolute top-0 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
