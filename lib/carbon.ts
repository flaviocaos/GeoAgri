// ================================================================
// lib/carbon.ts — Cálculo real de créditos de carbono
// Baseado em: IPCC AR6, VERRA VCS, metodologia AMS-III.BG
// ================================================================

// ── Fatores de sequestro por bioma e vegetação (tCO2e/ha/ano) ──
export const SEQUESTRATION_FACTORS: Record<string, Record<string, number>> = {
  amazonia: {
    floresta_primaria: 8.2,
    floresta_secundaria: 4.1,
    cerradao: 3.8,
    mata_ciliar: 5.2,
    default: 4.5,
  },
  cerrado: {
    cerrado_sentido_restrito: 2.1,
    campo_sujo: 1.2,
    mata_ciliar: 3.8,
    veredas: 2.8,
    default: 2.0,
  },
  mata_atlantica: {
    floresta_ombrofila: 7.1,
    floresta_estacional: 5.3,
    restinga: 2.4,
    default: 4.2,
  },
  caatinga: {
    caatinga_arborea: 1.8,
    caatinga_arbustiva: 0.9,
    default: 1.2,
  },
  pampa: { campo_nativo: 0.8, default: 0.7 },
  pantanal: { pantanal: 3.1, default: 2.5 },
}

// ── Fatores de emissão de pecuária (tCO2e/cab/ano) ──
export const LIVESTOCK_EMISSIONS: Record<string, number> = {
  bovino_corte: 1.8,      // Fator entérico + dejetos
  bovino_leite: 2.1,
  bubalino: 2.3,
  ovino: 0.19,
  caprino: 0.15,
  suino: 0.28,
  equino: 0.72,
  aves: 0.004,
}

// ── Fatores de solo (multiplicador) ──
export const SOIL_FACTORS: Record<string, number> = {
  latossolo_vermelho: 1.25,
  latossolo_amarelo: 1.15,
  argissolo: 1.00,
  neossolo: 0.80,
  gleissolo: 1.35,
  organossolo: 1.60,
  plintossolo: 0.90,
  cambissolo: 1.05,
}

// ── Fatores de prática agrícola (multiplicador) ──
export const PRACTICE_FACTORS: Record<string, number> = {
  plantio_direto: 1.30,       // +30% sequestro vs. convencional
  ilpf: 1.55,                 // Integração Lavoura-Pecuária-Floresta
  saf: 1.45,                  // Sistema Agroflorestal
  organico: 1.25,
  convencional: 1.00,
  irrigacao_gotejamento: 1.10,
  rotacao_cultura: 1.15,
  cobertura_morta: 1.20,
}

// ── Preços de referência do mercado voluntário (R$/tCO2e) ──
export const CARBON_PRICES: Record<string, { min: number; max: number; avg: number }> = {
  verra_vcs: { min: 45, max: 90, avg: 62 },
  gold_standard: { min: 65, max: 130, avg: 95 },
  cerrado_sustentavel: { min: 35, max: 58, avg: 46 },
  redd_plus: { min: 25, max: 50, avg: 37 },
  mercado_regulado_br: { min: 40, max: 80, avg: 58 }, // SBCE futuro
}

// ── Interface de entrada ──────────────────────────────────────
export interface CarbonInputs {
  total_area_ha: number
  native_veg_pct: number           // % área com vegetação nativa
  veg_type?: string                // tipo de vegetação
  biome?: string                   // bioma da propriedade
  soil_type?: string               // tipo de solo
  practice?: string                // prática agrícola
  // Pecuária
  livestock?: {
    tipo: string
    cabecas: number
  }[]
  // Agricultura
  crop_area_ha?: number
  crop_type?: string               // soja, milho, cana, etc.
  // Energia
  fuel_liters_year?: number        // diesel/gasolina consumido
  energy_kwh_year?: number         // energia elétrica consumida
}

// ── Interface de saída ────────────────────────────────────────
export interface CarbonResults {
  // Sequestro
  veg_area_ha: number
  sequestration_factor: number
  gross_sequestration_tco2e: number

  // Emissões
  livestock_emissions_tco2e: number
  fuel_emissions_tco2e: number
  energy_emissions_tco2e: number
  total_emissions_tco2e: number

  // Balanço
  net_balance_tco2e: number        // sequestro - emissões
  credits_eligible_tco2e: number   // créditos elegíveis para venda
  is_carbon_positive: boolean

  // Valor financeiro
  value_by_standard: Record<string, { credits: number; value_brl: number }>
  recommended_standard: string
  max_annual_revenue_brl: number

  // Indicadores
  carbon_intensity: number         // tCO2e/ha
  efficiency_score: number         // 0-100
  certification_eligible: string[]

  // Metodologia
  methodology_notes: string[]
}

// ── Função principal ──────────────────────────────────────────
export function calculateCarbon(inputs: CarbonInputs): CarbonResults {
  const {
    total_area_ha,
    native_veg_pct,
    veg_type = 'default',
    biome = 'cerrado',
    soil_type = 'latossolo_vermelho',
    practice = 'convencional',
    livestock = [],
    fuel_liters_year = 0,
    energy_kwh_year = 0,
  } = inputs

  // 1. Área de vegetação nativa
  const veg_area_ha = total_area_ha * (native_veg_pct / 100)

  // 2. Fator de sequestro base (tCO2e/ha/ano)
  const biomeFactors = SEQUESTRATION_FACTORS[biome] || SEQUESTRATION_FACTORS.cerrado
  const base_seq_factor = biomeFactors[veg_type] || biomeFactors.default

  // 3. Multiplicadores
  const soil_mult = SOIL_FACTORS[soil_type] || 1.0
  const practice_mult = PRACTICE_FACTORS[practice] || 1.0
  const sequestration_factor = parseFloat((base_seq_factor * soil_mult * practice_mult).toFixed(4))

  // 4. Sequestro bruto
  const gross_sequestration_tco2e = parseFloat((veg_area_ha * sequestration_factor).toFixed(2))

  // 5. Emissões de pecuária
  const livestock_emissions_tco2e = parseFloat(
    livestock.reduce((sum, l) => {
      const factor = LIVESTOCK_EMISSIONS[l.tipo] || LIVESTOCK_EMISSIONS.bovino_corte
      return sum + l.cabecas * factor
    }, 0).toFixed(2)
  )

  // 6. Emissões de combustível (diesel: 2.68 kgCO2e/L, gasolina: 2.21)
  const fuel_emissions_tco2e = parseFloat((fuel_liters_year * 0.00268).toFixed(2))

  // 7. Emissões de energia elétrica (fator MINIST. 2023: 0.0617 tCO2/MWh)
  const energy_emissions_tco2e = parseFloat((energy_kwh_year * 0.0000617).toFixed(2))

  // 8. Total de emissões
  const total_emissions_tco2e = parseFloat(
    (livestock_emissions_tco2e + fuel_emissions_tco2e + energy_emissions_tco2e).toFixed(2)
  )

  // 9. Balanço líquido
  const net_balance_tco2e = parseFloat((gross_sequestration_tco2e - total_emissions_tco2e).toFixed(2))
  const credits_eligible_tco2e = Math.max(0, net_balance_tco2e)
  const is_carbon_positive = net_balance_tco2e > 0

  // 10. Valor por padrão de certificação
  const value_by_standard: Record<string, { credits: number; value_brl: number }> = {}
  Object.entries(CARBON_PRICES).forEach(([std, prices]) => {
    value_by_standard[std] = {
      credits: credits_eligible_tco2e,
      value_brl: parseFloat((credits_eligible_tco2e * prices.avg).toFixed(2)),
    }
  })

  // 11. Padrão recomendado (maior valor elegível)
  const recommended_standard = credits_eligible_tco2e > 500
    ? 'verra_vcs'
    : credits_eligible_tco2e > 100
    ? 'cerrado_sustentavel'
    : 'redd_plus'

  const max_annual_revenue_brl = parseFloat(
    (credits_eligible_tco2e * CARBON_PRICES[recommended_standard].avg).toFixed(2)
  )

  // 12. Indicadores
  const carbon_intensity = parseFloat((total_emissions_tco2e / total_area_ha).toFixed(4))
  const efficiency_score = Math.min(100, Math.round(
    (native_veg_pct * 0.4) +
    (is_carbon_positive ? 30 : 0) +
    (practice !== 'convencional' ? 20 : 0) +
    Math.min(10, credits_eligible_tco2e / 100)
  ))

  // 13. Certificações elegíveis
  const certification_eligible: string[] = []
  if (native_veg_pct >= 20) certification_eligible.push('Soja Plus')
  if (native_veg_pct >= 30) certification_eligible.push('Rainforest Alliance')
  if (is_carbon_positive) certification_eligible.push('VERRA VCS')
  if (practice === 'organico') certification_eligible.push('IBD Orgânico')
  if (practice === 'ilpf') certification_eligible.push('ABC+ ILPF')
  if (credits_eligible_tco2e > 1000) certification_eligible.push('Gold Standard')

  // 14. Notas metodológicas
  const methodology_notes = [
    `Sequestro calculado com fator base ${base_seq_factor} tCO2e/ha/ano (${biome} / ${veg_type})`,
    `Fator de solo: ${soil_mult}x (${soil_type})`,
    `Fator de prática: ${practice_mult}x (${practice})`,
    `Emissões de pecuária: ${livestock.length} categorias, total ${livestock_emissions_tco2e} tCO2e/ano`,
    `Fator de emissão energia elétrica: 0,0617 tCO2/MWh (MINIST. Energia 2023)`,
    `Metodologia: IPCC AR6, VCS VM0045, ABC+ Brasil`,
  ]

  return {
    veg_area_ha,
    sequestration_factor,
    gross_sequestration_tco2e,
    livestock_emissions_tco2e,
    fuel_emissions_tco2e,
    energy_emissions_tco2e,
    total_emissions_tco2e,
    net_balance_tco2e,
    credits_eligible_tco2e,
    is_carbon_positive,
    value_by_standard,
    recommended_standard,
    max_annual_revenue_brl,
    carbon_intensity,
    efficiency_score,
    certification_eligible,
    methodology_notes,
  }
}

// ── Simulador de cenários ─────────────────────────────────────
export function simulateScenarios(base: CarbonInputs) {
  const scenarios = [
    { name: 'Atual', inputs: base },
    { name: 'Plantio Direto', inputs: { ...base, practice: 'plantio_direto' } },
    { name: 'ILPF', inputs: { ...base, practice: 'ilpf', native_veg_pct: base.native_veg_pct + 5 } },
    { name: 'Recuperação +10%', inputs: { ...base, native_veg_pct: Math.min(100, base.native_veg_pct + 10) } },
    { name: 'SAF Ideal', inputs: { ...base, practice: 'saf', native_veg_pct: Math.min(100, base.native_veg_pct + 15) } },
  ]
  return scenarios.map(s => ({ ...s, result: calculateCarbon(s.inputs) }))
}