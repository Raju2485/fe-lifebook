const isStorageAvailable = () => {
  try {
    const key = '__storage_test__'
    window.localStorage.setItem(key, key)
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export const setLocalStorage = (key, value) => {
  if (!isStorageAvailable()) return false

  try {
    const serialized =
      typeof value === 'string' ? value : JSON.stringify(value)
    window.localStorage.setItem(key, serialized)
    return true
  } catch {
    return false
  }
}

export const getLocalStorage = (key, defaultValue = null) => {
  if (!isStorageAvailable()) return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    if (item === null) return defaultValue

    try {
      return JSON.parse(item)
    } catch {
      return item
    }
  } catch {
    return defaultValue
  }
}

export const removeLocalStorage = (key) => {
  if (!isStorageAvailable()) return false

  try {
    window.localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export const clearLocalStorage = () => {
  if (!isStorageAvailable()) return false

  try {
    window.localStorage.clear()
    return true
  } catch {
    return false
  }
}
