import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 hover:shadow-md text-gray-900 dark:text-gray-800",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-[#084073] shadow-sm border border-primary/20",
        destructive:
          "bg-destructive text-white hover:bg-red-600 shadow-sm border border-destructive/20",
        outline:
          "border border-input bg-white text-gray-900 dark:text-gray-800 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 shadow-sm disabled:text-gray-900 dark:disabled:text-gray-500",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[#094073] hover:text-white shadow-sm border border-secondary/20",
  ghost: "text-gray-900 dark:text-gray-800 hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        gradient: "bg-gradient-primary text-white hover:opacity-90 shadow-md hover:shadow-lg",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm border border-green-600/20",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700 shadow-sm border border-yellow-600/20",
        info: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm border border-blue-600/20",
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
