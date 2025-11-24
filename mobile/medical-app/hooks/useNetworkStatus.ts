/**
 * Hook para detectar el estado de conexión a internet
 */

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const setOnlineStatus = useAppStore((state) => state.setOnlineStatus)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setOnlineStatus(true)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setOnlineStatus(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Actualizar el estado inicial
    setOnlineStatus(isOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus])

  return isOnline
}

