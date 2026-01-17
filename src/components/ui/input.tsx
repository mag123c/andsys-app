import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: Paper & Ink Input 스타일 - 깔끔하고 가독성 좋은
        "flex h-10 w-full min-w-0 bg-card px-3 py-2",
        "font-sans text-sm transition-all duration-200 outline-none",
        // 보더 시스템
        "border border-border rounded-md",
        // 파일 인풋 스타일
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-secondary file:px-3 file:text-sm file:font-medium file:mr-3 file:rounded-md",
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

// Textarea 컴포넌트
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base: Paper & Ink Textarea 스타일
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

// 검색 인풋 (돋보기 아이콘 포함)
function SearchInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <div className="relative">
      {/* 돋보기 아이콘 */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <Input
        type="search"
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  )
}

export { Input, Textarea, SearchInput }
