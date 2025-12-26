/**
 * QuickActions Component
 * 
 * Quick actions menu for common tasks and shortcuts.
 */

'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SparklesIcon,
  CalendarIcon,
  FileTextIcon,
  UsersIcon,
  MessageSquareIcon,
  SettingsIcon,
  ZapIcon,
} from "lucide-react"
// Using a simple popover/dialog approach since dropdown-menu doesn't exist
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BaseButton } from "@/components/base/BaseButton"
import { cn } from "@/lib/utils"

export interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  shortcut?: string
  badge?: string
}

const defaultActions: QuickAction[] = [
  {
    id: "daily-reading",
    label: "Daily Reading",
    icon: <SparklesIcon className="w-4 h-4" />,
    href: "/daily-reading",
  },
  {
    id: "ai-chat",
    label: "AI Chat",
    icon: <MessageSquareIcon className="w-4 h-4" />,
    href: "/ai-chat",
  },
  {
    id: "generate-report",
    label: "Generate Report",
    icon: <FileTextIcon className="w-4 h-4" />,
    href: "/reports/generate",
  },
  {
    id: "add-person",
    label: "Add Person",
    icon: <UsersIcon className="w-4 h-4" />,
    href: "/people/add",
  },
  {
    id: "book-consultation",
    label: "Book Consultation",
    icon: <CalendarIcon className="w-4 h-4" />,
    href: "/consultations/book",
  },
]

export interface QuickActionsProps {
  actions?: QuickAction[]
  className?: string
  trigger?: React.ReactNode
}

export function QuickActions({
  actions = defaultActions,
  className,
  trigger,
}: QuickActionsProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const handleAction = (action: QuickAction) => {
    router.push(action.href)
    setOpen(false)
  }

  return (
    <>
      {trigger || (
        <BaseButton
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className={cn("gap-2", className)}
        >
          <ZapIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Quick Actions</span>
        </BaseButton>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Quick Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-accent transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  {action.icon}
                  <span>{action.label}</span>
                </div>
                {action.badge && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {action.badge}
                  </span>
                )}
                {action.shortcut && (
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    {action.shortcut}
                  </kbd>
                )}
              </button>
            ))}
            <div className="border-t my-2" />
            <button
              onClick={() => {
                router.push("/settings")
                setOpen(false)
              }}
              className="w-full text-left px-4 py-3 rounded-md hover:bg-accent transition-colors flex items-center gap-2"
            >
              <SettingsIcon className="w-4 h-4" />
              Settings
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

