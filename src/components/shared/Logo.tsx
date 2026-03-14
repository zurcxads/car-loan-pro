"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "stacked";
  darkMode?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: "text-sm", gap: "gap-2" },
  md: { icon: 32, text: "text-lg", gap: "gap-2.5" },
  lg: { icon: 40, text: "text-xl", gap: "gap-3" },
  xl: { icon: 56, text: "text-3xl", gap: "gap-4" },
};

function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Blue circle */}
      <circle cx="24" cy="24" r="24" fill="#2563EB" />
      {/* White rounded A */}
      <path
        d="M24 12C23.4 12 22.85 12.35 22.6 12.88L14.6 30.88C14.15 31.88 14.88 33 15.98 33H18.02C18.62 33 19.15 32.62 19.38 32.06L20.7 28.8H27.3L28.62 32.06C28.85 32.62 29.38 33 29.98 33H32.02C33.12 33 33.85 31.88 33.4 30.88L25.4 12.88C25.15 12.35 24.6 12 24 12ZM22.1 25.2L24 20.5L25.9 25.2H22.1Z"
        fill="white"
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  variant = "full",
  darkMode = false,
  className = "",
}: LogoProps) {
  const s = sizes[size];

  if (variant === "icon") {
    return <LogoIcon size={s.icon} className={className} />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <LogoIcon size={s.icon * 1.5} />
        <span className={`${s.text} font-medium mt-2 ${darkMode ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
          Auto Loan{" "}
          <span className="font-bold text-blue-600">Pro</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      <LogoIcon size={s.icon} />
      <span className={`${s.text} font-medium ${darkMode ? "text-white" : "text-gray-900 dark:text-gray-100"}`}>
        Auto Loan{" "}
        <span className="font-bold text-blue-600">Pro</span>
      </span>
    </div>
  );
}

export { LogoIcon };
