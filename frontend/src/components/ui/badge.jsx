import React from "react";
import { cn } from "../../lib/utils"; // Adjusted path

const Badge = ({ className, ...props }) => (
  <div
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      className
    )}
    {...props}
  />
);

export { Badge };
