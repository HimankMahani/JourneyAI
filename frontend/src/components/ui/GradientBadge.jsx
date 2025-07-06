import { cn } from "@/lib/utils";

export const GradientBadge = ({ icon, text, className }) => (
  <div className={cn("inline-flex items-center px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-full transition-all duration-300", className)}>
    {icon && <span className="mr-2">{icon}</span>}
    <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
      {text}
    </span>
  </div>
);