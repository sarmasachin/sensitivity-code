import styles from "./proof-frame.module.css";

const labels = ["Camera", "Red dot", "Gyroscope", "ADS"];

type ProofFrameProps = {
  seed: number;
  large?: boolean;
};

export function ProofFrame({ seed, large }: ProofFrameProps) {
  return (
    <svg
      className={large ? styles.large : styles.frame}
      viewBox="0 0 640 280"
      aria-hidden="true"
    >
      <rect width="640" height="280" fill="#f3f5f8" />
      <text x="32" y="40" fill="#8b93a0" fontSize="14" fontFamily="sans-serif">
        Sensitivity
      </text>
      <text x="608" y="40" textAnchor="end" fill="#8b93a0" fontSize="13" fontFamily="sans-serif">
        Proof
      </text>
      <line x1="32" y1="56" x2="608" y2="56" stroke="#e1e5ec" />
      {labels.map((label, index) => {
        const value = 18 + ((seed * (index + 2) * 13) % 76);
        const y = 100 + index * 42;
        const width = Math.round((value / 100) * 300);
        return (
          <g key={label}>
            <text x="32" y={y} fill="#3c4450" fontSize="16" fontFamily="sans-serif">
              {label}
            </text>
            <rect x="188" y={y - 14} width="300" height="6" rx="3" fill="#e1e5ec" />
            <rect x="188" y={y - 14} width={width} height="6" rx="3" fill="#14171c" />
            <circle cx={188 + width} cy={y - 11} r="6" fill="#14171c" />
            <text
              x="608"
              y={y}
              textAnchor="end"
              fill="#14171c"
              fontSize="16"
              fontFamily="ui-monospace, monospace"
            >
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
