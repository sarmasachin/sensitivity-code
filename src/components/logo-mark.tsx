type LogoMarkProps = {
  className?: string;
};

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <img
      className={`${className ?? ""} rounded-lg`}
      src="/logo-mark.png"
      alt=""
      width={512}
      height={512}
    />
  );
}
