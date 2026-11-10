import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[88px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 dark:border-slate-700 dark:bg-slate-900",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";
