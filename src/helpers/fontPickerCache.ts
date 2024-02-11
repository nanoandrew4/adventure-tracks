import FontPicker from 'font-picker'

const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY

const fontPickerCache = new Map<string, FontPicker>()

function getCachedPicker(pickerId: string): FontPicker {
  if (fontPickerCache.has(pickerId)) return fontPickerCache.get(pickerId) as FontPicker

  const newFontPicker = new FontPicker(apiKey, 'Open Sans', { pickerId: pickerId, limit: 300 })
  fontPickerCache.set(pickerId, newFontPicker)
  return newFontPicker
}

export { getCachedPicker }
