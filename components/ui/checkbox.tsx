"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ 
  checked = false, 
  onCheckedChange, 
  disabled = false,
  className 
}: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleClick = () => {
    if (disabled) return;
    
    const newChecked = !isChecked;
    setIsChecked(newChecked);
    onCheckedChange?.(newChecked);
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "h-4 w-4 rounded border-2 flex items-center justify-center transition-all duration-200",
        disabled 
          ? "bg-gray-600 border-gray-500 cursor-not-allowed" 
          : isChecked
          ? "bg-blue-600 border-blue-600 text-white"
          : "bg-gray-700 border-gray-500 hover:border-blue-500 cursor-pointer",
        className
      )}
    >
      {isChecked && (
        <svg 
          className="h-3 w-3" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
    </button>
  );
}