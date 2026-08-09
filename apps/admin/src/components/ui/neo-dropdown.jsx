"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

















export function NeoDropdown({ trigger, children, align = "right", className }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            <div
        className={cn(
          "absolute top-full mt-2 z-50 min-w-[200px] p-2 rounded-[20px] bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl transition-all duration-200 origin-top",
          align === "right" ? "right-0" : "left-0",
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
          className
        )}>
        
                {/* Arrow */}
                <div className={cn(
          "absolute -top-1.5 w-3 h-3 bg-card border-l border-t border-border/50 rotate-45 z-0",
          align === "right" ? "right-5" : "left-5"
        )} />

                <div className="relative z-10 flex flex-col gap-1">
                    {children}
                </div>
            </div>
        </div>);

}

export function NeoDropdownItem({ onClick, children, className, variant = "default", icon, disabled }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-[12px] text-xs font-bold uppercase tracking-wide transition-colors text-left",
        disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer",
        variant === "destructive" ?
        "text-red-500 hover:bg-red-500/10" :
        "text-muted-foreground hover:text-foreground hover:bg-muted/10",
        className
      )}>
      
            {icon && <span className={cn(variant === "destructive" ? "text-red-500" : "opacity-70")}>{icon}</span>}
            {children}
        </button>);

}

export function NeoDropdownLabel({ children }) {
  return (
    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground/50">
            {children}
        </div>);

}

export function NeoDropdownSeparator() {
  return <div className="h-px bg-border/10 my-1 mx-2" />;
}