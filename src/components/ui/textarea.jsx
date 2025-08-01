import * as React from "react"
import { cn } from "@/lib/utils";

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <select
        className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        ref={ref}
        {...props}
        >
        {children}
        </select>
    );
});
Select.displayName = "Select";

const SelectValue = React.forwardRef(({ className, ...props }, ref) => (
    <option ref={ref} className={cn("", className)} {...props} />
));
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <optgroup ref={ref} className={cn("", className)} {...props}>{children}</optgroup>
));
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, ...props }, ref) => (
    <option ref={ref} className={cn("text-sm", className)} {...props} />
));
SelectItem.displayName = "SelectItem"

export { Select, SelectValue, SelectContent, SelectItem };
