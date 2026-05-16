const FLASH_KEY = 'flashMessage'

export const setFlashMessage = ({ type, content }) => {
  if (!content) return
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, content }))
}

export const consumeFlashMessage = () => {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY)
    if (!raw) return null
    sessionStorage.removeItem(FLASH_KEY)
    return JSON.parse(raw)
  } catch {
    sessionStorage.removeItem(FLASH_KEY)
    return null
  }
}
