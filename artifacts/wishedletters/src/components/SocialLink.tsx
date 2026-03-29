import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SocialLinkProps {
  href: string;
  icon: ReactNode;
  name: string;
  label: string;
}

export function SocialLink({ href, icon, name, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group relative flex items-center gap-3.5 px-5 py-3.5",
        "bg-white/5 border border-primary/25 rounded-2xl",
        "text-slate-200 no-underline transition-all duration-300 ease-out",
        "backdrop-blur-md overflow-hidden",
        "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_8px_25px_rgba(147,51,234,0.25)] hover:text-white",
        "active:translate-y-0"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/12 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-inherit" />
      
      <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-primary/20 text-primary shrink-0 transition-colors group-hover:bg-primary/30 group-hover:text-primary-foreground">
        {icon}
      </span>
      
      <span className="relative font-semibold text-[0.95rem] flex-1 z-10">
        {name}
      </span>
      
      <span className="relative text-xs text-[#d8b4fe]/60 z-10 transition-colors group-hover:text-[#d8b4fe]/80">
        {label}
      </span>
    </a>
  );
}
