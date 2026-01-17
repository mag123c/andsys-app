import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Pixel/Retro Card: RPG 윈도우 스타일
        "bg-card text-card-foreground flex flex-col gap-4",
        // 픽셀 보더 시스템 (이중 테두리)
        "border-4 border-foreground",
        // 3D 픽셀 효과
        "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.15),inset_4px_4px_0_0_rgba(255,255,255,0.3),8px_8px_0_0_rgba(0,0,0,0.4)]",
        // 호버 효과
        "transition-all duration-100 ease-linear",
        "hover:shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.15),inset_4px_4px_0_0_rgba(255,255,255,0.3),10px_10px_0_0_rgba(0,0,0,0.4)]",
        "hover:translate-x-[-2px] hover:translate-y-[-2px]",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 pt-4",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        // 픽셀 구분선 (하단 보더)
        "[.border-b]:pb-4 [.border-b]:border-b-4 [.border-b]:border-foreground/30",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        // 픽셀 폰트로 타이틀
        "font-pixel text-sm leading-tight tracking-wider uppercase",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "font-retro text-base text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 pb-4 font-retro text-lg", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-4 px-4 pb-4",
        // 상단 픽셀 구분선
        "[.border-t]:pt-4 [.border-t]:border-t-4 [.border-t]:border-foreground/30",
        className
      )}
      {...props}
    />
  )
}

// 추가 변형: 인벤토리 아이템 카드
function ItemCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-card"
      className={cn(
        "bg-card text-card-foreground p-2",
        // 인벤토리 슬롯 스타일
        "border-4 border-foreground",
        "shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.2),inset_2px_2px_0_0_rgba(255,255,255,0.2),4px_4px_0_0_rgba(0,0,0,0.3)]",
        // 호버: 선택 효과
        "transition-all duration-100",
        "hover:border-primary hover:bg-primary/10",
        "hover:shadow-[inset_-2px_-2px_0_0_rgba(0,0,0,0.2),inset_2px_2px_0_0_rgba(255,255,255,0.2),6px_6px_0_0_var(--primary)]",
        className
      )}
      {...props}
    />
  )
}

// 추가 변형: 퀘스트 카드
function QuestCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="quest-card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-4",
        // 황금 테두리 (퀘스트 느낌)
        "border-4 border-[var(--pixel-gold)]",
        "shadow-[inset_-4px_-4px_0_0_rgba(0,0,0,0.15),inset_4px_4px_0_0_rgba(255,255,255,0.3),8px_8px_0_0_rgba(0,0,0,0.4)]",
        // 코너 장식 효과
        "relative",
        "before:absolute before:top-0 before:left-0 before:w-4 before:h-4 before:border-t-4 before:border-l-4 before:border-[var(--pixel-gold)]",
        "after:absolute after:bottom-0 after:right-0 after:w-4 after:h-4 after:border-b-4 after:border-r-4 after:border-[var(--pixel-gold)]",
        "transition-all duration-100",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  ItemCard,
  QuestCard,
}
