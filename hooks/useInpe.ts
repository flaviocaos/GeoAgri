'use client'
import { useState, useEffect, useCallback } from 'react'

interface InpeState {
  data: any
  loading: boolean
  error: string | null
  lastUpdate: string | null
  cached: boolean
}

// Hook para buscar dados INPE via nossa API proxy
export function useInpe(type: string, state?: string, days?: number) {
  const [inpe, setInpe] = useState<InpeState>({
    data: null, loading: true, error: null, lastUpdate: null, cached: false
  })

  const fetch_ = useCallback(async () => {
    setInpe(prev => ({ ...prev, loading: true, error: null }))
    try {
      const params = new URLSearchParams({ type })
      if (state) params.set('state', state)
      if (days) params.set('days', String(days))

      const res = await fetch(`/api/inpe?${params}`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao buscar dados INPE')

      setInpe({
        data,
        loading: false,
        error: null,
        lastUpdate: data.lastUpdate || new Date().toISOString(),
        cached: data.cached || false,
      })
    } catch (err: any) {
      setInpe(prev => ({ ...prev, loading: false, error: err.message }))
    }
  }, [type, state, days])

  useEffect(() => { fetch_() }, [fetch_])

  return { ...inpe, refetch: fetch_ }
}

// Hook para PRODES histórico
export function useProdes(biome?: string, state?: string) {
  return useInpe('prodes', state)
}

// Hook para alertas DETER
export function useDeter(state?: string, days = 30) {
  return useInpe('deter', state, days)
}

// Hook para focos de queimadas
export function useFires(state?: string, days = 7) {
  return useInpe('fires', state, days)
}

// Hook para resumo consolidado
export function useInpeSummary(state?: string) {
  return useInpe('summary', state)
}

// Hook para cálculo de carbono (não faz fetch, calcula localmente)
export function useCarbonCalc(inputs: any) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const calculate = useCallback(async () => {
    if (!inputs) return
    setLoading(true)
    // Pequeno delay para UX
    await new Promise(r => setTimeout(r, 200))
    const { calculateCarbon } = await import('@/lib/carbon')
    setResult(calculateCarbon(inputs))
    setLoading(false)
  }, [JSON.stringify(inputs)])

  useEffect(() => { calculate() }, [calculate])

  return { result, loading, recalculate: calculate }
}