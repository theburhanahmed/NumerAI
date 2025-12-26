/**
 * ShareButton Component
 * 
 * Social sharing functionality for readings and insights.
 */

'use client'

import * as React from "react"
import { Share2Icon, TwitterIcon, FacebookIcon, CopyIcon, CheckIcon } from "lucide-react"
import { BaseButton } from "@/components/base/BaseButton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface ShareData {
  title: string
  text: string
  url: string
  image?: string
}

export interface ShareButtonProps {
  data: ShareData
  variant?: 'button' | 'icon'
  className?: string
}

export function ShareButton({
  data,
  variant = 'button',
  className,
}: ShareButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const shareUrl = typeof window !== 'undefined' ? window.location.origin + data.url : data.url

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: shareUrl,
        })
        setOpen(false)
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    } else {
      setOpen(true)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy link')
    }
  }

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
    setOpen(false)
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, '_blank', 'width=550,height=420')
    setOpen(false)
  }

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleNativeShare}
          className={cn("p-2 rounded-lg hover:bg-accent transition-colors", className)}
          aria-label="Share"
        >
          <Share2Icon className="w-5 h-5" />
        </button>
        <ShareDialog
          open={open}
          onOpenChange={setOpen}
          onCopy={handleCopyLink}
          onTwitter={handleTwitterShare}
          onFacebook={handleFacebookShare}
          copied={copied}
          url={shareUrl}
        />
      </>
    )
  }

  return (
    <>
      <BaseButton
        variant="outline"
        onClick={handleNativeShare}
        className={cn("gap-2", className)}
      >
        <Share2Icon className="w-4 h-4" />
        Share
      </BaseButton>
      <ShareDialog
        open={open}
        onOpenChange={setOpen}
        onCopy={handleCopyLink}
        onTwitter={handleTwitterShare}
        onFacebook={handleFacebookShare}
        copied={copied}
        url={shareUrl}
      />
    </>
  )
}

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCopy: () => void
  onTwitter: () => void
  onFacebook: () => void
  copied: boolean
  url: string
}

function ShareDialog({
  open,
  onOpenChange,
  onCopy,
  onTwitter,
  onFacebook,
  copied,
  url,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex gap-3">
            <BaseButton
              variant="outline"
              onClick={onTwitter}
              className="flex-1 gap-2"
            >
              <TwitterIcon className="w-4 h-4" />
              Twitter
            </BaseButton>
            <BaseButton
              variant="outline"
              onClick={onFacebook}
              className="flex-1 gap-2"
            >
              <FacebookIcon className="w-4 h-4" />
              Facebook
            </BaseButton>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 px-3 py-2 rounded-md border bg-background text-sm"
            />
            <BaseButton
              variant="outline"
              onClick={onCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4" />
                  Copy
                </>
              )}
            </BaseButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

