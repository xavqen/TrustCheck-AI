import Link from "next/link";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-w-0 max-w-full items-center justify-center gap-2 rounded-2xl text-center text-sm font-medium leading-snug ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "min-h-10 px-4 py-2",
        sm: "min-h-9 px-3 py-1.5 text-xs sm:text-sm",
        lg: "min-h-12 px-5 py-3 text-sm sm:px-6 sm:text-base",
        icon: "size-10 shrink-0 p-0"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean; href?: string };

export function Button({ className, variant, size, asChild, children, ...props }: ButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<{ className?: string }>;
    return React.cloneElement(child, { className: cn(buttonVariants({ variant, size, className }), child.props.className) });
  }
  if (props.href) {
    return <Link href={props.href} className={cn(buttonVariants({ variant, size, className }))}>{children}</Link>;
  }
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props}>{children}</button>;
}
