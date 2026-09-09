import logoSrc from "@/assets/logo.png";

export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="Tailor Arena"
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  );
}

export function LogoLockup({
  size = 40,
  variant = "light",
}: {
  size?: number;
  variant?: "light" | "dark";
}) {
  const titleCls = variant === "dark" ? "text-navy" : "text-navy";
  const tagCls =
    variant === "dark"
      ? "text-gold/80"
      : "text-mocha/70";
  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div className="flex flex-col leading-tight">
        <span className={`font-display text-lg tracking-[0.12em] uppercase ${titleCls}`}>
          Tailor Arena
        </span>
        <span className={`text-[9px] uppercase tracking-[0.32em] ${tagCls}`}>
          Precision · Style · Stitching
        </span>
      </div>
    </div>
  );
}





