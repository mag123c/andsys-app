import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Paper & Ink Textarea - 깔끔하고 가독성 좋은
        "flex min-h-[120px] w-full bg-card px-3 py-2",
        "font-sans text-sm transition-all duration-200 outline-none resize-none",
        // 보더 시스템
        "border border-border rounded-md",
        // 플레이스홀더
        "placeholder:text-muted-foreground/60",
        // 셀렉션 색상
        "selection:bg-accent/20 selection:text-foreground",
        // 포커스 상태
        "focus:border-ring focus:ring-2 focus:ring-ring/20",
        // 비활성화 상태
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
        // 에러 상태
        "aria-invalid:border-destructive aria-invalid:focus:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
