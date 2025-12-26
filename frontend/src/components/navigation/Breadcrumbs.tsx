/**
 * Breadcrumbs Component
 * 
 * Navigation breadcrumbs component for showing current location in the app.
 */

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon, HomeIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <HomeIcon className="w-4 h-4" />
            </Link>
          </li>
        )}
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1
          
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "font-medium",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  
  const routeLabels: Record<string, string> = {
    dashboard: "Dashboard",
    profile: "Profile",
    "birth-chart": "Birth Chart",
    "daily-reading": "Daily Reading",
    "ai-chat": "AI Chat",
    reports: "Reports",
    people: "People",
    consultations: "Consultations",
    subscription: "Subscription",
    settings: "Settings",
    compatibility: "Compatibility",
    "lo-shu-grid": "Lo Shu Grid",
    "life-path": "Life Path",
  }

  return segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
    
    return {
      label,
      href: index < segments.length - 1 ? href : undefined,
    }
  })
}

