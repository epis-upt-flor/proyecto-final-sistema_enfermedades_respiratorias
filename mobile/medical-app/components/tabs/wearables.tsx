"use client"

import { useState, useEffect } from "react"
import { HeartPulse, Activity, Moon, RefreshCw } from "lucide-react"
import { ModernButton } from "@/components/ui/ModernButton"
import { ModernCard } from "@/components/ui/ModernCard"
import type { Translation } from "@/lib/translations"
import { wearableService } from "@/lib/api/services"
import { useAppStore } from "@/store/useAppStore"
import { toast } from "sonner"

interface WearablesViewProps {
  t: Translation
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function WearablesView({ t, isLoading, setIsLoading }: WearablesViewProps) {
  const user = useAppStore((state) => state.user)
  const [metrics, setMetrics] = useState({
    heartRate: null as number | null,
    steps: null as number | null,
    spO2: null as number | null,
    lastSync: null as string | null,
    provider: null as string | null
  })
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [user])

  const loadMetrics = async () => {
    if (!user) return

    setIsLoadingMetrics(true)
    try {
      const data = await wearableService.getMetrics()
      setMetrics({
        heartRate: data.heartRate || null,
        steps: data.steps || null,
        spO2: data.spO2 || null,
        lastSync: data.lastSync || null,
        provider: data.provider || null
      })
    } catch (error: any) {
      console.error("Error al cargar métricas:", error)
      // No mostrar error si no hay métricas, simplemente dejar valores null
      if (error.status !== 404) {
        toast.error("Error al cargar métricas de wearables")
      }
    } finally {
      setIsLoadingMetrics(false)
    }
  }

  const handleSync = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Simular sincronización (en una app real, esto obtendría datos del dispositivo)
      const mockMetrics = {
        heartRate: Math.floor(Math.random() * 40) + 60, // 60-100 BPM
        steps: Math.floor(Math.random() * 3000) + 2000, // 2000-5000 pasos
        spO2: Math.floor(Math.random() * 5) + 95, // 95-100%
        lastSync: new Date().toISOString(),
        provider: 'HealthKit'
      }

      await wearableService.syncMetrics(mockMetrics)
      setMetrics(mockMetrics)
      toast.success("Métricas sincronizadas exitosamente")
    } catch (error: any) {
      console.error("Error al sincronizar:", error)
      toast.error("Error al sincronizar métricas")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-8 pb-32 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t.wearables.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-medium text-muted-foreground">{t.wearables.connected}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {metrics.provider && (
            <span className="text-xs text-muted-foreground">{metrics.provider}</span>
          )}
          <ModernButton
            size="sm"
            variant="outline"
            className="rounded-full h-8 text-xs bg-transparent"
            onClick={loadMetrics}
            disabled={isLoadingMetrics}
          >
            {isLoadingMetrics ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              'Actualizar'
            )}
          </ModernButton>
        </div>
      </div>

      {/* Main Visual */}
      <div className="flex justify-center py-4">
        <div className="w-64 h-64 relative flex items-center justify-center">
          {/* Abstract Rings */}
          <div className="absolute inset-0 rounded-full border-[12px] border-muted" />
          <div className="absolute inset-0 rounded-full border-[12px] border-primary border-r-transparent rotate-45 opacity-80" />
          <div className="absolute inset-4 rounded-full border-[12px] border-orange-100 dark:border-orange-900/30" />
          <div className="absolute inset-4 rounded-full border-[12px] border-orange-500 border-l-transparent -rotate-12 opacity-80" />

          <div className="text-center z-10 bg-background/80 backdrop-blur-sm p-4 rounded-full shadow-sm">
            <HeartPulse className={`w-8 h-8 text-destructive mx-auto mb-1 ${metrics.heartRate ? 'animate-pulse' : ''}`} />
            <span className="text-3xl font-bold block leading-none">
              {metrics.heartRate !== null ? metrics.heartRate : '--'}
            </span>
            <span className="text-xs text-muted-foreground font-medium">BPM</span>
            {!metrics.heartRate && (
              <p className="text-[10px] text-muted-foreground mt-1">No disponible</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ModernCard variant="glass" className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-blue-500">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">SpO2</span>
          </div>
          <p className="text-2xl font-bold">
            {metrics.spO2 !== null ? metrics.spO2 : '--'}
            {metrics.spO2 !== null && <span className="text-sm font-normal text-muted-foreground">%</span>}
          </p>
          {!metrics.spO2 && (
            <p className="text-[10px] text-muted-foreground">No disponible</p>
          )}
        </ModernCard>
        <ModernCard variant="glass" className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-500">
            <Moon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.wearables.sleep}</span>
          </div>
          <p className="text-2xl font-bold">
            {metrics.steps !== null ? metrics.steps.toLocaleString() : '--'}
            {metrics.steps !== null && (
              <span className="text-sm font-normal text-muted-foreground ml-1">pasos</span>
            )}
          </p>
          {!metrics.steps && (
            <p className="text-[10px] text-muted-foreground">No disponible</p>
          )}
        </ModernCard>
      </div>

      {metrics.lastSync && (
        <p className="text-xs text-center text-muted-foreground">
          Última sincronización: {new Date(metrics.lastSync).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      )}
      
      <ModernButton
        className="w-full h-14 text-lg shadow-xl shadow-primary/10 rounded-2xl"
        onClick={handleSync}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            Sincronizando...
          </>
        ) : (
          <>
            <RefreshCw className="w-5 h-5 mr-2" />
            {t.wearables.sync || 'Sincronizar'}
          </>
        )}
      </ModernButton>
    </div>
  )
}
