"use client"

import { InfoIcon } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function InfoTooltip({
  content,
  label = "More information",
}: {
  content: string
  label?: string
}) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            aria-label={label}
            tabIndex={0}
            className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
          >
            <InfoIcon className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
