const KEY = "emu.silenced"

export const getSilenced = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}")
  } catch {
    return {}
  }
}

export const isSilenced = (id: string) => !!getSilenced()[id]

export const toggleSilenceLocal = (id: string) => {
  const map = getSilenced()
  map[id] = !map[id]
  localStorage.setItem(KEY, JSON.stringify(map))
  return map[id]
}

