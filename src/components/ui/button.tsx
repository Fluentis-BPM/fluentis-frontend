import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Base styles intentionally avoid setting text color so each variant controls contrast explicitly.
// We also avoid accidental inheritance by resetting bg/text in every variant.
// NOTE: Many buttons in the codebase still pass Tailwind color utilities (e.g. bg-* text-*).
// That overrides the design-token driven variants and leads to inconsistent appearance.
// A dev-time warning (below) flags this so we can migrate usages to proper variants.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 select-none",
  {
    variants: {
      variant: {
        // Primary / high emphasis
        default: "bg-primary text-primary-foreground border border-primary/20 shadow-sm hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground border border-destructive/30 shadow-sm hover:bg-destructive/90",
        outline: "bg-white text-foreground border border-input hover:bg-gray-50 dark:hover:bg-gray-100",
        secondary: "bg-secondary text-secondary-foreground border border-secondary/30 shadow-sm hover:bg-secondary/90",
        ghost: "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        link: "bg-transparent text-primary underline-offset-4 hover:underline hover:text-primary/80",
        gradient: "bg-gradient-primary text-white shadow-md hover:opacity-90",
        // Additional semantic intents
        tertiary: "bg-tertiary text-white border border-tertiary/30 shadow-sm hover:bg-tertiary/90",
        neutral: "bg-muted text-muted-foreground border border-border hover:bg-muted/80",
        inverse: "bg-foreground text-background border border-foreground/20 hover:bg-foreground/90",
        "gradient-secondary": "bg-gradient-secondary text-white shadow-md hover:opacity-90",
        success: "bg-green-600 text-white border border-green-600/30 shadow-sm hover:bg-green-600/90",
        warning: "bg-yellow-600 text-white border border-yellow-600/30 shadow-sm hover:bg-yellow-600/90",
        info: "bg-blue-600 text-white border border-blue-600/30 shadow-sm hover:bg-blue-600/90",
        // Subtle variant for low emphasis actions
        subtle: "bg-muted text-muted-foreground hover:bg-muted/80 border border-border",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xs: "h-7 rounded px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    if (process.env.NODE_ENV !== 'production' && className) {
      // Heuristic: flag direct color utility overrides that likely conflict with variant styling.
      const overridePattern = /(^|\s)(bg-|text-|border-)(primary|secondary|tertiary|green|red|blue|yellow|gray|slate|zinc|neutral|white|black)/
      if (overridePattern.test(className) && !/data-allow-color-override/.test(className)) {
        console.warn(
          `[Button] Detected direct color utility in className ("${className}"). This can override variant styles and cause inconsistent colors. ` +
          `Prefer using a variant (primary/default, secondary, destructive, success, warning, info, gradient, gradient-secondary, tertiary, neutral, inverse, subtle) instead.`
        )
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }








