import { useEffect, useRef, useState } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number
  rootMargin?: string
  freezeOnceVisible?: boolean
}

/**
 * Hook to detect if element is visible in viewport
 * Used to pause off-screen animations for performance
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
): [React.RefObject<HTMLDivElement>, boolean] {
  const {
    threshold = 0,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // If already visible and frozen, don't observe
    if (freezeOnceVisible && isVisible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      if (element) {
        observer.unobserve(element)
      }
    }
  }, [threshold, rootMargin, freezeOnceVisible, isVisible])

  return [ref, isVisible]
}

