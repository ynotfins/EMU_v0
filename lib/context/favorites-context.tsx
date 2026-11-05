"use client"

import * as React from "react"

interface FavoritesContextType {
  favorites: Set<string>
  bookmarks: Set<string>
  silenced: Set<string>
  toggleFavorite: (id: string) => void
  toggleBookmark: (id: string) => void
  toggleSilence: (id: string) => void
}

const defaultFavoritesContext: FavoritesContextType = {
  favorites: new Set(["inc-001", "inc-004"]),
  bookmarks: new Set(["inc-002", "inc-004"]),
  silenced: new Set(),
  toggleFavorite: () => {},
  toggleBookmark: () => {},
  toggleSilence: () => {},
}

const FavoritesContext = React.createContext<FavoritesContextType>(defaultFavoritesContext)

function StatefulFavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<Set<string>>(
    new Set(defaultFavoritesContext.favorites),
  )
  const [bookmarks, setBookmarks] = React.useState<Set<string>>(
    new Set(defaultFavoritesContext.bookmarks),
  )
  const [silenced, setSilenced] = React.useState<Set<string>>(new Set())

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

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  if (typeof window === "undefined") {
    return <FavoritesContext.Provider value={defaultFavoritesContext}>{children}</FavoritesContext.Provider>
  }

  return (
    <StatefulFavoritesProvider>{children}</StatefulFavoritesProvider>
  )
}

export function useFavoritesContext() {
  const context = React.useContext(FavoritesContext)
  return context
}
