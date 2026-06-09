export default function PlanetIcon() {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-40 h-40"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D3A376" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#D3A376" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2DF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#D3A376" />
          <stop offset="100%" stopColor="#8C6E63" />
        </linearGradient>
        <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D3A376" />
          <stop offset="100%" stopColor="#8C6E63" />
        </linearGradient>
      </defs>

      {/* Ambient glow */}
      <circle cx="100" cy="100" r="80" fill="url(#bgGlow)" />

      {/* Outer decorative circle */}
      <circle
        cx="100"
        cy="100"
        r="72"
        fill="none"
        stroke="#D3A376"
        strokeWidth="0.8"
        strokeOpacity="0.3"
      />

      {/* Inner decorative circle */}
      <circle
        cx="100"
        cy="100"
        r="60"
        fill="none"
        stroke="#FFF2DF"
        strokeWidth="0.5"
        strokeOpacity="0.15"
      />

      {/* Cardinal dots */}
      <circle cx="100" cy="27" r="1.5" fill="#D3A376" fillOpacity="0.5" />
      <circle cx="100" cy="173" r="1.5" fill="#D3A376" fillOpacity="0.5" />
      <circle cx="27" cy="100" r="1.5" fill="#D3A376" fillOpacity="0.5" />
      <circle cx="173" cy="100" r="1.5" fill="#D3A376" fillOpacity="0.5" />

      {/* === SCISSORS === */}
      {/* Pivot screw */}
      <circle cx="100" cy="100" r="4" fill="#D3A376" />
      <circle cx="100" cy="100" r="2" fill="#3E2522" />

      {/* Blade 1 — upper-left to lower-right */}
      {/* Blade body */}
      <path
        d="M100 100 L58 62"
        stroke="url(#bladeGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* Blade edge highlight */}
      <path
        d="M100 100 L58 62"
        stroke="#FFF2DF"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      {/* Handle ring 1 */}
      <circle
        cx="50"
        cy="54"
        r="14"
        fill="none"
        stroke="url(#handleGrad)"
        strokeWidth="5"
      />
      <circle
        cx="50"
        cy="54"
        r="14"
        fill="none"
        stroke="#FFF2DF"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      {/* Handle finger rest 1 */}
      <line
        x1="44"
        y1="64"
        x2="38"
        y2="72"
        stroke="#D3A376"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Blade 2 — upper-right to lower-left */}
      <path
        d="M100 100 L142 62"
        stroke="url(#bladeGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M100 100 L142 62"
        stroke="#FFF2DF"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
      {/* Handle ring 2 */}
      <circle
        cx="150"
        cy="54"
        r="14"
        fill="none"
        stroke="url(#handleGrad)"
        strokeWidth="5"
      />
      <circle
        cx="150"
        cy="54"
        r="14"
        fill="none"
        stroke="#FFF2DF"
        strokeWidth="1"
        strokeOpacity="0.2"
      />
      {/* Handle finger rest 2 */}
      <line
        x1="156"
        y1="64"
        x2="162"
        y2="72"
        stroke="#D3A376"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* === COMB below scissors === */}
      {/* Comb spine */}
      <rect
        x="72"
        y="118"
        width="56"
        height="6"
        rx="2"
        fill="#D3A376"
        fillOpacity="0.7"
      />
      {/* Comb teeth */}
      {[76, 83, 90, 97, 104, 111, 118].map((x) => (
        <rect
          key={x}
          x={x}
          y="124"
          width="4"
          height="14"
          rx="1"
          fill="#D3A376"
          fillOpacity="0.55"
        />
      ))}

      {/* Thin separator line between scissors and comb */}
      <line
        x1="72"
        y1="113"
        x2="128"
        y2="113"
        stroke="#FFF2DF"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />
    </svg>
  );
}
