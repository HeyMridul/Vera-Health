export default function PulseMark({ className = 'w-8 h-8', animate = false }) {
  return (
    <svg viewBox="0 0 100 40" className={className} aria-hidden="true">
      <path
        d="M0 20 H28 L34 6 L42 34 L48 20 L54 28 L60 12 L66 20 H100"
        className={`pulse-line ${animate ? 'pulse-line-animate' : ''}`}
      />
    </svg>
  );
}
