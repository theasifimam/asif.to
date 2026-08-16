export function Label({ children, className = "", ...props }) { return <label className={`text-sm font-medium leading-none ${className}`} {...props}>{children}</label>; }
