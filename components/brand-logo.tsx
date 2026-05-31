import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  showText?: boolean;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
};

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 256 256"
      role="img"
      aria-label="TrustCheck AI shield logo"
      className={cn("size-10 shrink-0", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tc-shield" x1="44" y1="36" x2="202" y2="210" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1F5E" />
          <stop offset="0.55" stopColor="#0E7BFF" />
          <stop offset="1" stopColor="#16C6C3" />
        </linearGradient>
        <linearGradient id="tc-check" x1="86" y1="125" x2="165" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#16C6C3" />
          <stop offset="1" stopColor="#20D6A1" />
        </linearGradient>
      </defs>
      <path d="M128 30L190 56V107C190 155 164 196 128 216C92 196 66 155 66 107V56L128 30Z" stroke="url(#tc-shield)" strokeWidth="18" strokeLinejoin="round" />
      <path d="M93 126L116 149L166 96" stroke="url(#tc-check)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="178" y="48" width="18" height="18" rx="4" fill="#16C6C3" />
      <rect x="179" y="78" width="14" height="14" rx="3" fill="#0EA5E9" />
    </svg>
  );
}

export function BrandLogo({ href = "/", showText = true, className, iconClassName, textClassName }: BrandLogoProps) {
  const logo = (
    <span className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-border dark:bg-slate-950">
        <LogoMark className={cn("size-8", iconClassName)} />
      </span>
      {showText ? (
        <span className={cn("min-w-0 whitespace-nowrap text-lg font-extrabold tracking-tight text-[#0B1F5E] dark:text-white sm:text-xl", textClassName)}>
          TrustCheck <span className="bg-gradient-to-r from-sky-500 to-teal-400 bg-clip-text text-transparent">AI</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return logo;

  return (
    <Link href={href} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {logo}
    </Link>
  );
}

export { LogoMark };
