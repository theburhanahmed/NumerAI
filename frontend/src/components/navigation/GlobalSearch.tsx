/**
 * GlobalSearch Component
 * 
 * Global search functionality for finding features and content.
 */

'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, XIcon, CommandIcon } from "lucide-react"
import { BaseInput } from "@/components/base/BaseInput"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface SearchResult {
  id: string
  title: string
  description?: string
  href: string
  category: string
  icon?: React.ReactNode
}

export interface GlobalSearchProps {
  results?: SearchResult[]
  onSearch?: (query: string) => Promise<SearchResult[]>
  className?: string
}

const defaultSearchResults: SearchResult[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    description: "View your numerology overview",
    href: "/dashboard",
    category: "Navigation",
  },
  {
    id: "birth-chart",
    title: "Birth Chart",
    description: "Your complete numerology profile",
    href: "/birth-chart",
    category: "Features",
  },
  {
    id: "daily-reading",
    title: "Daily Reading",
    description: "Today's numerology insights",
    href: "/daily-reading",
    category: "Features",
  },
  {
    id: "ai-chat",
    title: "AI Chat",
    description: "Chat with our AI numerologist",
    href: "/ai-chat",
    category: "Features",
  },
  {
    id: "compatibility",
    title: "Compatibility",
    description: "Check relationship compatibility",
    href: "/compatibility",
    category: "Features",
  },
  {
    id: "reports",
    title: "Reports",
    description: "Generate numerology reports",
    href: "/reports",
    category: "Features",
  },
]

export function GlobalSearch({ results, onSearch, className }: GlobalSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [searchResults, setSearchResults] = React.useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = React.useState(false)
  const router = useRouter()

  // Keyboard shortcut: Cmd/Ctrl + K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape" && open) {
        setOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open])

  // Search functionality
  React.useEffect(() => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    
    const performSearch = async () => {
      if (onSearch) {
        const results = await onSearch(query)
        setSearchResults(results)
      } else {
        // Default search
        const filtered = (results || defaultSearchResults).filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(filtered)
      }
      setIsSearching(false)
    }

    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [query, onSearch, results])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    setOpen(false)
    setQuery("")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
          className
        )}
        aria-label="Open search"
      >
        <SearchIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <CommandIcon className="w-3 h-3" />K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          
          <div className="px-6 pb-4">
            <BaseInput
              placeholder="Search features, pages, and content..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto px-6 pb-6">
            {isSearching ? (
              <div className="text-center py-8 text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-3 rounded-md hover:bg-accent transition-colors flex items-start gap-3"
                  >
                    {result.icon && (
                      <div className="mt-0.5 text-muted-foreground">
                        {result.icon}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{result.title}</div>
                      {result.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {result.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.category}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="text-center py-8 text-muted-foreground">
                No results found for "{query}"
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Start typing to search...
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

