import { useEffect } from "react"

interface KeyboardShortcutsOptions {
  enabled: boolean
  onNewRant?: () => void
  onNextRant?: () => void
  onPrevRant?: () => void
  onLike?: () => void
  onBookmark?: () => void
  onComment?: () => void
  onFocusSearch?: () => void
  onClose?: () => void
  onShowHelp?: () => void
}

export function useKeyboardShortcuts({
  enabled,
  onNewRant,
  onNextRant,
  onPrevRant,
  onLike,
  onBookmark,
  onComment,
  onFocusSearch,
  onClose,
  onShowHelp,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return
    function handle(e: KeyboardEvent) {
      if (e.target && (e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return
      switch (e.key) {
        case "n":
          onNewRant?.()
          break
        case "j":
        case "ArrowDown":
          onNextRant?.()
          break
        case "k":
        case "ArrowUp":
          onPrevRant?.()
          break
        case "l":
          onLike?.()
          break
        case "b":
          onBookmark?.()
          break
        case "c":
          onComment?.()
          break
        case "/":
          e.preventDefault()
          onFocusSearch?.()
          break
        case "Escape":
          onClose?.()
          break
        case "?":
          onShowHelp?.()
          break
      }
    }
    window.addEventListener("keydown", handle)
    return () => window.removeEventListener("keydown", handle)
  }, [enabled, onNewRant, onNextRant, onPrevRant, onLike, onBookmark, onComment, onFocusSearch, onClose, onShowHelp])
}
