import { cn } from "@/lib/utils";

export default function AIButton({ children, className, ...props }) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] px-6 py-3 font-medium text-white transition-all duration-300 ease-in-out hover:bg-[position:100%_0%] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 active:scale-95",
        className
      )}
      {...props}
    >
      <span className="relative flex items-center">
        {children}

      </span>
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-[length:200%_100%] opacity-0 blur-sm transition-all duration-300 group-hover:opacity-30 group-hover:blur-md" />
    </button>
  );
}
