import { ShieldCheck } from "lucide-react";
import { useState } from "react";

const LOGO_SRC = "/brand/scalex-logo.png?v=20260628-new-logo";

const variantClasses = {
  compact: "h-[52px] w-[154px]",
  hero: "h-[74px] w-[218px] max-w-full",
  sidebar: "h-[60px] w-full max-w-[176px]",
} as const;

interface BrandLogoProps {
  className?: string;
  variant?: keyof typeof variantClasses;
}

export function BrandLogo({ className = "", variant = "compact" }: BrandLogoProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const frameClassName = [
    "inline-flex overflow-hidden rounded-[4px] border border-[#2a2d35] bg-[#050505] shadow-[0_0_28px_rgba(252,186,3,0.12)]",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (logoFailed) {
    return (
      <div className={`${frameClassName} items-center justify-center gap-2 px-3`}>
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[#fcba03]/40 bg-[#fcba03]/10 text-[#fcba03]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold leading-none text-white">ScaleX</span>
      </div>
    );
  }

  return (
    <img
      alt="ScaleX"
      className={`${frameClassName} object-cover object-center`}
      decoding="async"
      loading="eager"
      onError={() => setLogoFailed(true)}
      src={LOGO_SRC}
    />
  );
}
