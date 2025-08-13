'use client';

import { cn } from "@/lib/utils";

interface TagOption<T = string> {
  value: T;
  label: string;
  color?: string;
}

interface TagSelectorProps<T extends string> {
  options: Array<{
    value: T;
    label: string;
    color?: string;
  }>;
  value: T;
  onChange: (value: T) => void;
  error?: boolean;
}

export function TagSelector<T extends string>({ 
  options, 
  value, 
  onChange,
  error 
}: TagSelectorProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "px-2 py-0.5 rounded-md text-xs font-medium transition-colors",
            "border focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-muted-foreground/40",
            value === option.value
              ? option.color || "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30"
              : "bg-muted/50 border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/70",
            error && "border-destructive/50 focus:ring-destructive"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
} 