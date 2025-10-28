"use client"

import { useState } from "react"

export interface Filters {
  distanceMi?: number
  types: string[]
  keyword: string
  highAlertOnly: boolean
  minUpdates?: number
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    types: [],
    keyword: "",
    highAlertOnly: false,
  })

  const setDistance = (distanceMi?: number) => {
    setFilters((prev) => ({ ...prev, distanceMi }))
  }

  const setTypes = (types: string[]) => {
    setFilters((prev) => ({ ...prev, types }))
  }

  const setKeyword = (keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword }))
  }

  const setHighAlertOnly = (highAlertOnly: boolean) => {
    setFilters((prev) => ({ ...prev, highAlertOnly }))
  }

  const setMinUpdates = (minUpdates?: number) => {
    setFilters((prev) => ({ ...prev, minUpdates }))
  }

  return {
    filters,
    setDistance,
    setTypes,
    setKeyword,
    setHighAlertOnly,
    setMinUpdates,
  }
}
