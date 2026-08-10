"use client";

import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { Bell, Search, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * AdminTopbar - Top navigation bar for admin panel
 *
 * Features:
 * - Page title display
 * - Search (placeholder)
 * - Notifications (placeholder)
 * - Theme toggle
 * - User profile
 */
export function AdminTopbar({ className, title }) {
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Get user info on client side
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser({ name: currentUser.name, email: currentUser.email });
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In a real implementation, this would toggle the theme class
    document.documentElement.classList.toggle("light", isDark);
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between px-6",
        "bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      {/* Left: Title */}
      <div>
        {title && (
          <h1 className="text-xl font-black uppercase tracking-wider">
            {title}
          </h1>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-[12px]",
            "bg-muted text-muted-foreground",
            "transition-smooth hover:bg-muted/80 hover:text-foreground",
          )}
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-[12px]",
            "bg-muted text-muted-foreground",
            "transition-smooth hover:bg-muted/80 hover:text-foreground",
          )}
        >
          <Bell className="h-5 w-5" />
          {/* Notification badge */}
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            3
          </span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-[12px]",
            "bg-muted text-muted-foreground",
            "transition-smooth hover:bg-muted/80 hover:text-foreground",
          )}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Divider */}
        <div className="mx-2 h-8 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-bold">
              {user?.name?.charAt(0) || "A"}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.email || "admin@asif.app"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
