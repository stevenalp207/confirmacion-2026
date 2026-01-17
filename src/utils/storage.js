import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write errors
    }
  }, [key, value])

  return [value, setValue]
}

export function useSessionStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = sessionStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore write errors
    }
  }, [key, value])

  return [value, setValue]
}

// Simple cache with TTL using localStorage
export function createCache(namespace = 'app-cache') {
  function makeKey(key) {
    return `${namespace}:${key}`
  }

  function set(key, value, ttlMs = 0) {
    const data = {
      value,
      expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
    }
    try {
      localStorage.setItem(makeKey(key), JSON.stringify(data))
    } catch {
      // ignore
    }
  }

  function get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(makeKey(key))
      if (!raw) return fallback
      const data = JSON.parse(raw)
      if (data.expiresAt && data.expiresAt > 0 && Date.now() > data.expiresAt) {
        localStorage.removeItem(makeKey(key))
        return fallback
      }
      return data.value
    } catch {
      return fallback
    }
  }

  function clear(key) {
    try {
      localStorage.removeItem(makeKey(key))
    } catch {
      // ignore
    }
  }

  return { set, get, clear }
}
