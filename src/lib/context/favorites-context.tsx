"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface FavoritesContextType {
  favorites: Set<string>
  bookmarks: Set<string>
  silenced: Set<string>
  toggleFavorite: (id: string) => void
  toggleBookmark: (id: string) => void
  toggleSilence: (id: string) => void
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["inc-001", "inc-004"]))
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set(["inc-002", "inc-004"]))
  const [silenced, setSilenced] = useState<Set<string>>(new Set())

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      console.log("[v0] Toggle favorite:", id, next.has(id) ? "added" : "removed")
      return next
    })
  }

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      console.log("[v0] Toggle bookmark:", id, next.has(id) ? "added" : "removed")
      return next
    })
  }

  const toggleSilence = (id: string) => {
    setSilenced((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      console.log("[v0] Toggle silence:", id, next.has(id) ? "silenced" : "unsilenced")
      return next
    })
  }

  return (
    <FavoritesContext.Provider
      value={{ favorites, bookmarks, silenced, toggleFavorite, toggleBookmark, toggleSilence }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavoritesContext must be used within FavoritesProvider")
  }
  return context
}
