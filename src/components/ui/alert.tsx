import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  // Paper & Ink Alert: 깔끔한 알림 스타일
  [
    "relative w-full p-4",
    "border rounded-lg",
    "grid has-[>svg]:grid-cols-[calc(var(--spacing)*5)_1fr] grid-cols-[0_1fr]",
    "has-[>svg]:gap-x-3 gap-y-1 items-start",
    "[&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  ].join(" "),
  {
    variants: {
      variant: {
        // Default: 기본 알림
        default: [
          "bg-card text-card-foreground",
          "border-border",
        ].join(" "),

        // Destructive: 경고/에러
        destructive: [
          "bg-destructive/10 text-destructive",
          "border-destructive/30",
          "[&>svg]:text-destructive",
          "*:data-[slot=alert-description]:text-destructive/80",
        ].join(" "),

        // Success: 성공
        success: [
          "bg-emerald-50 text-emerald-900",
          "border-emerald-200",
          "[&>svg]:text-emerald-600",
          "dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800",
        ].join(" "),

        // Warning: 주의
        warning: [
          "bg-amber-50 text-amber-900",
          "border-amber-200",
          "[&>svg]:text-amber-600",
          "dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800",
        ].join(" "),

        // Info: 정보
        info: [
          "bg-sky-50 text-sky-900",
          "border-sky-200",
          "[&>svg]:text-sky-600",
          "dark:bg-sky-900/20 dark:text-sky-200 dark:border-sky-800",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4",
        "font-sans text-sm font-medium",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1",
        "font-sans text-sm leading-relaxed",
        "text-muted-foreground",
        "[&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
