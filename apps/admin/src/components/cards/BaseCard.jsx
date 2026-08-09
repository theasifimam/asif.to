import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";








/**
 * BaseCard - Foundation card component for Soft Neo-Bento
 */
export function BaseCard({
  children,
  className,
  onClick,
  hover = false
}) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-card p-5",
        "shadow-card",
        hover &&
        "cursor-pointer transition-smooth hover:shadow-elevated hover:scale-[1.01]",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}>
      
      {children}
    </div>);

}















/**
 * UserCard - Display user information
 */
export function UserCard({ user, actions, onClick, className }) {
  const statusColors = {
    active: "bg-primary/20 text-primary",
    suspended: "bg-yellow-500/20 text-yellow-400",
    deleted: "bg-destructive/20 text-destructive"
  };

  return (
    <BaseCard
      className={cn("flex items-center gap-4", className)}
      onClick={onClick}
      hover={!!onClick}>
      
      {/* Avatar */}
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
        {user.avatar ?
        <img
          src={user.avatar}
          alt={user.name}
          className="h-full w-full object-cover" /> :


        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-muted-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{user.name}</span>
          {user.status &&
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              statusColors[user.status]
            )}>
            
              {user.status}
            </span>
          }
        </div>
        {user.username &&
        <span className="text-sm text-muted-foreground">
            @{user.username}
          </span>
        }
        {user.email && !user.username &&
        <span className="text-sm text-muted-foreground truncate">
            {user.email}
          </span>
        }
      </div>

      {/* Actions */}
      {actions && <div className="shrink-0">{actions}</div>}
    </BaseCard>);

}
















/**
 * ContentCard - Display content items (posts, stories, reels)
 */
export function ContentCard({
  content,
  actions,
  onClick,
  className
}) {
  const typeColors = {
    post: "bg-blue-500/20 text-blue-400",
    story: "bg-purple-500/20 text-purple-400",
    reel: "bg-pink-500/20 text-pink-400"
  };

  const statusColors = {
    active: "bg-primary/20 text-primary",
    removed: "bg-destructive/20 text-destructive",
    expired: "bg-muted text-muted-foreground"
  };

  return (
    <BaseCard
      className={cn("flex flex-col gap-3", className)}
      onClick={onClick}
      hover={!!onClick}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              typeColors[content.type]
            )}>
            
            {content.type}
          </span>
          {content.status &&
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              statusColors[content.status]
            )}>
            
              {content.status}
            </span>
          }
        </div>
        {actions}
      </div>

      {/* Thumbnail */}
      {content.thumbnail &&
      <div className="aspect-video overflow-hidden rounded-[16px] bg-muted">
          <img
          src={content.thumbnail}
          alt="Content preview"
          className="h-full w-full object-cover" />
        
        </div>
      }

      {/* Preview text */}
      {content.preview &&
      <p className="text-sm text-muted-foreground line-clamp-2">
          {content.preview}
        </p>
      }

      {/* Footer */}
      {(content.author || content.createdAt) &&
      <div className="flex items-center justify-between text-xs text-muted-foreground">
          {content.author && <span>by {content.author}</span>}
          {content.createdAt && <span>{content.createdAt}</span>}
        </div>
      }
    </BaseCard>);

}















/**
 * ReportCard - Display report items
 */
export function ReportCard({
  report,
  actions,
  onClick,
  className
}) {
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    resolved: "bg-primary/20 text-primary",
    dismissed: "bg-muted text-muted-foreground"
  };

  return (
    <BaseCard
      className={cn("flex flex-col gap-3", className)}
      onClick={onClick}
      hover={!!onClick}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {report.type}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              statusColors[report.status]
            )}>
            
            {report.status}
          </span>
        </div>
        {actions}
      </div>

      {/* Reason */}
      <p className="font-medium">{report.reason}</p>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {report.reporter && <span>Reported by {report.reporter}</span>}
        {report.createdAt && <span>{report.createdAt}</span>}
      </div>
    </BaseCard>);

}










/**
 * ActionCard - Clickable card for actions
 */
export function ActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  variant = "default",
  className
}) {
  const variants = {
    default: "bg-card hover:bg-muted",
    accent: "bg-primary/10 hover:bg-primary/20 text-primary",
    danger: "bg-destructive/10 hover:bg-destructive/20 text-destructive"
  };

  return (
    <div
      className={cn(
        "rounded-[24px] p-5",
        "shadow-soft",
        "cursor-pointer transition-smooth",
        "flex items-center gap-4",
        "hover:shadow-card hover:scale-[1.02]",
        "active:scale-[0.98]",
        variants[variant],
        className
      )}
      onClick={onClick}>
      
      {Icon &&
      <div
        className={cn(
          "rounded-[12px] p-3",
          variant === "default" ? "bg-muted" : "bg-current/10"
        )}>
        
          <Icon className="h-5 w-5" />
        </div>
      }
      <div className="flex-1">
        <span className="font-semibold">{title}</span>
        {description &&
        <p className="text-sm text-muted-foreground">{description}</p>
        }
      </div>
    </div>);

}

export default BaseCard;