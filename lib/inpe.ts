// ================================================================
// lib/inpe.ts — Integração real com APIs INPE/TerraBrasilis
// Docs: https://terrabrasilis.dpi.inpe.br/en/available-services/
// ================================================================

const TB_BASE = 'https://terrabrasilis.dpi.inpe.br'
const TB_DASHBOARD = `${TB_BASE}/dashboard/api/v1/redis-cli`
const TB_GEOSERVER = `${TB_BASE}/geoserver/ows`
const FIRES_BASE = 'https://queimadas.dgi.inpe.br/queimadas/bdqueimadas/api'

// ── Tipos ──────────────────────────────────────────────────────
export interface ProdesData {
  year: number
  state: string
  biome: string
  area_km2: number
  source: 'PRODES'
}

export interface DeterAlert {
  id: string
  state: string
  area_ha: number
  date: string
  class: string
  biome: string
  lat: number
  lon: number
  source: 'DETER'
}

export interface FireFocus {
  id: string
  lat: number
  lon: number
  state: string
  municipality: string
  date: string
  risk: 'alto' | 'medio' | 'baixo'
  source: 'QUEIMADAS'
}

export interface InpeStats {
  prodes: ProdesData[]
  deter: DeterAlert[]
  fires: FireFocus[]
  lastUpdate: string
}

// ── PRODES — Série histórica de desmatamento ──────────────────
export async function getProdesData(
  biome: 'prodes_amazon' | 'prodes_cerrado' | 'prodes_legal_amazon' = 'prodes_amazon',
  state?: string
): Promise<ProdesData[]> {
  try {
    // Lista períodos disponíveis
    const periodsRes = await fetch(
      `${TB_DASHBOARD}/${biome}/periods`,
      { next: { revalidate: 86400 } } // cache 24h
    )
    if (!periodsRes.ok) throw new Error('PRODES periods fetch failed')
    const periods = await periodsRes.json()

    // Busca dados por estado se especificado
    const endpoint = state
      ? `${TB_DASHBOARD}/${biome}/uf/${state}/deforestation`
      : `${TB_DASHBOARD}/${biome}/deforestation`

    const dataRes = await fetch(endpoint, { next: { revalidate: 86400 } })
    if (!dataRes.ok) throw new Error('PRODES data fetch failed')
    const raw = await dataRes.json()

    // Normaliza resposta
    return (Array.isArray(raw) ? raw : raw.data || []).map((item: any) => ({
      year: item.endDate?.year || item.year || 0,
      state: item.loiname || state || 'Brasil',
      biome: biome.replace('prodes_', '').replace('_', ' '),
      area_km2: parseFloat(item.area || 0),
      source: 'PRODES' as const,
    }))
  } catch (err) {
    console.error('[INPE] PRODES error:', err)
    return []
  }
}

// ── DETER — Alertas em tempo real (WFS → JSON) ────────────────
export async function getDeterAlerts(
  biome: 'amazonia' | 'cerrado' = 'amazonia',
  state?: string,
  days: number = 30
): Promise<DeterAlert[]> {
  try {
    const layer = biome === 'amazonia' ? 'deter-amz:deter_public' : 'deter-cerrado:deter_cerrado_public'
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)
    const dateStr = dateFrom.toISOString().split('T')[0]

    let cqlFilter = `date>='${dateStr}'`
    if (state) cqlFilter += ` AND estado='${state}'`

    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: layer,
      outputFormat: 'application/json',
      CQL_FILTER: cqlFilter,
      maxFeatures: '500',
      srsName: 'EPSG:4326',
    })

    const res = await fetch(`${TB_GEOSERVER}?${params}`, {
      next: { revalidate: 3600 } // cache 1h
    })
    if (!res.ok) throw new Error('DETER WFS fetch failed')
    const geojson = await res.json()

    return (geojson.features || []).map((f: any) => {
      const props = f.properties || {}
      const coords = f.geometry?.coordinates
      const lat = Array.isArray(coords) ? coords[1] : -10
      const lon = Array.isArray(coords) ? coords[0] : -55
      const area = parseFloat(props.areakm || props.area_km || 0)

      return {
        id: props.gid || props.id || Math.random().toString(36).slice(2),
        state: props.estado || props.state || 'N/D',
        area_ha: area * 100,
        date: props.date || props.data_criacao || new Date().toISOString(),
        class: props.classname || props.classe || 'Desmatamento',
        biome: biome,
        lat,
        lon,
        source: 'DETER' as const,
      }
    })
  } catch (err) {
    console.error('[INPE] DETER error:', err)
    return []
  }
}

// ── QUEIMADAS — Focos de incêndio ────────────────────────────
export async function getFireFocus(
  state?: string,
  days: number = 7
): Promise<FireFocus[]> {
  try {
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const params = new URLSearchParams({
      path: '/api/focos/csv',
      date_from: dateFrom.toISOString().split('T')[0],
      date_to: new Date().toISOString().split('T')[0],
      output: 'json',
    })
    if (state) params.set('state', state)

    const res = await fetch(
      `${FIRES_BASE}/focos?${params}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('Queimadas fetch failed')
    const raw = await res.json()

    return (raw.data || raw || []).slice(0, 200).map((f: any) => ({
      id: f.id || Math.random().toString(36).slice(2),
      lat: parseFloat(f.latitude || f.lat || 0),
      lon: parseFloat(f.longitude || f.lon || 0),
      state: f.estado || f.state || state || '',
      municipality: f.municipio || f.municipality || '',
      date: f.data_hora_gmt || f.date || new Date().toISOString(),
      risk: f.risco_fogo > 0.7 ? 'alto' : f.risco_fogo > 0.3 ? 'medio' : 'baixo',
      source: 'QUEIMADAS' as const,
    }))
  } catch (err) {
    console.error('[INPE] Queimadas error:', err)
    return []
  }
}

// ── PRODES Taxas anuais por estado ────────────────────────────
export async function getProdesRates(biome = 'prodes_amazon'): Promise<any[]> {
  try {
    const res = await fetch(
      `${TB_DASHBOARD}/${biome}/increments`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) throw new Error()
    return await res.json()
  } catch {
    return []
  }
}

// ── Consolidado: todos os dados INPE ─────────────────────────
export async function getAllInpeData(state?: string): Promise<InpeStats> {
  const [prodes, deter, fires] = await Promise.allSettled([
    getProdesData('prodes_amazon', state),
    getDeterAlerts('amazonia', state, 30),
    getFireFocus(state, 7),
  ])

  return {
    prodes: prodes.status === 'fulfilled' ? prodes.value : [],
    deter: deter.status === 'fulfilled' ? deter.value : [],
    fires: fires.status === 'fulfilled' ? fires.value : [],
    lastUpdate: new Date().toISOString(),
  }
}

// ── Estatísticas resumidas por estado ─────────────────────────
export function summarizeByState(data: InpeStats) {
  const states: Record<string, { deter_alerts: number; fire_focus: number; area_ha: number }> = {}

  data.deter.forEach(a => {
    if (!states[a.state]) states[a.state] = { deter_alerts: 0, fire_focus: 0, area_ha: 0 }
    states[a.state].deter_alerts++
    states[a.state].area_ha += a.area_ha
  })

  data.fires.forEach(f => {
    if (!states[f.state]) states[f.state] = { deter_alerts: 0, fire_focus: 0, area_ha: 0 }
    states[f.state].fire_focus++
  })

  return Object.entries(states)
    .map(([state, stats]) => ({ state, ...stats, risk: stats.area_ha > 5000 ? 'Alto' : stats.area_ha > 1000 ? 'Médio' : 'Baixo' }))
    .sort((a, b) => b.area_ha - a.area_ha)
}