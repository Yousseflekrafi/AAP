import logoSrc from "../../assets/aap-logo.png";

interface LogoProps {
  height?: number;
  className?: string;
}

export function Logo({ height = 28, className = "" }: LogoProps) {
  return (
    <img
      src={logoSrc}
      alt="AAP"
      height={height}
      style={{ height, width: "auto", alignSelf: "flex-start", flexShrink: 0 }}
      className={className}
    />
  );
}
