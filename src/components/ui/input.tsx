import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base: Pixel/Retro Input 스타일
        "flex h-10 w-full min-w-0 bg-card px-4 py-2",
        "font-retro text-lg transition-all duration-100 outline-none",
        // 픽셀 보더 시스템
        "border-4 border-foreground",
        "shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.15),inset_-2px_-2px_0_0_rgba(255,255,255,0.1)]",
        // 파일 인풋 스타일
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:border-r-4 file:border-foreground file:bg-secondary file:px-3 file:text-sm file:font-pixel file:mr-3 file:uppercase file:tracking-wider",
        // 플레이스홀더
        "placeholder:text-muted-foreground/60 placeholder:font-retro",
        // 셀렉션 색상
        "selection:bg-primary/30 selection:text-foreground",
        // 포커스 상태
        "focus:border-primary focus:bg-card",
        "focus:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.15),inset_-2px_-2px_0_0_rgba(255,255,255,0.1),0_0_0_2px_var(--primary)]",
        // 비활성화 상태
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
        // 에러 상태
        "aria-invalid:border-destructive",
        "aria-invalid:focus:border-destructive aria-invalid:focus:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.15),inset_-2px_-2px_0_0_rgba(255,255,255,0.1),0_0_0_2px_var(--destructive)]",
        // 모바일 최적화
        "md:h-10 md:text-base",
        className
      )}
      {...props}
    />
  )
}

// Textarea 변형 추가
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Base: Pixel/Retro Textarea 스타일
        "flex min-h-[120px] w-full bg-card px-4 py-3",
        "font-retro text-lg transition-all duration-100 outline-none resize-none",
        // 픽셀 보더 시스템
        "border-4 border-foreground",
        "shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.15),inset_-2px_-2px_0_0_rgba(255,255,255,0.1)]",
        // 플레이스홀더
        "placeholder:text-muted-foreground/60 placeholder:font-retro",
        // 셀렉션 색상
        "selection:bg-primary/30 selection:text-foreground",
        // 포커스 상태
        "focus:border-primary focus:bg-card",
        "focus:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.15),inset_-2px_-2px_0_0_rgba(255,255,255,0.1),0_0_0_2px_var(--primary)]",
        // 비활성화 상태
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale",
        // 에러 상태
        "aria-invalid:border-destructive",
        "aria-invalid:focus:border-destructive aria-invalid:focus:shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.15),inset_-2px_-2px_0_0_rgba(255,255,255,0.1),0_0_0_2px_var(--destructive)]",
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
      {/* 픽셀 돋보기 아이콘 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="text-muted-foreground"
        >
          {/* 픽셀 아트 돋보기 */}
          <rect x="4" y="2" width="6" height="2" />
          <rect x="2" y="4" width="2" height="2" />
          <rect x="10" y="4" width="2" height="2" />
          <rect x="2" y="6" width="2" height="2" />
          <rect x="10" y="6" width="2" height="2" />
          <rect x="4" y="8" width="6" height="2" />
          <rect x="10" y="10" width="2" height="2" />
          <rect x="12" y="12" width="2" height="2" />
          <rect x="14" y="14" width="2" height="2" />
        </svg>
      </div>
      <Input
        type="search"
        className={cn("pl-12", className)}
        {...props}
      />
    </div>
  )
}

export { Input, Textarea, SearchInput }
