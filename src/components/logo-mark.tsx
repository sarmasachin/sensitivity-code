type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#14171c" />
      <path
        d="M9.2 13V9.2H13M19 9.2h3.8V13M22.8 19v3.8H19M13 22.8H9.2V19"
        fill="none"
        stroke="#f4f1ea"
        strokeWidth="1.45"
        strokeLinecap="square"
      />
      <circle cx="16" cy="16" r="6.15" fill="none" stroke="#f4f1ea" strokeWidth="1.15" />
      <circle cx="16" cy="16" r="3.15" fill="none" stroke="#f4f1ea" strokeWidth="1.15" />
      <circle cx="16" cy="16" r="1.05" fill="#f4f1ea" />
    </svg>
  );
}
