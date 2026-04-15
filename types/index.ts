export type UserRole = 'produtor' | 'agronomo' | 'banco' | 'regulador'


export type PlanType = 'gratuito' | 'starter' | 'pro' | 'enterprise'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  plan: PlanType
  avatar_url?: string
  created_at: string
}

export interface Property {
  id: string
  user_id: string
  name: string
  area_ha: number
  state: string
  city: string
  biome: string
  activity: string[]
  lat?: number
  lon?: number
  car_number?: string
  esg_score?: number
  created_at: string
  updated_at: string
}

export interface Alert {
  id: string
  user_id: string
  property_id?: string
  title: string
  description: string
  level: 'critico' | 'atencao' | 'info'
  source: 'inpe' | 'deter' | 'sistema'
  read: boolean
  created_at: string
}

export interface EsgReport {
  id: string
  property_id: string
  user_id: string
  score_total: number
  score_ambiental: number
  score_social: number
  score_governanca: number
  content: {
    ambiental: string
    social: string
    governanca: string
    riscos: string
    recomendacoes: string
  }
  created_at: string
}

export interface CarbonCalc {
  id: string
  property_id: string
  area_ha: number
  veg_pct: number
  soil_type: string
  practice: string
  emission_factor: number
  credits_ton: number
  value_brl: number
  created_at: string
}

export interface Plan {
  id: PlanType
  name: string
  price_monthly: number
  price_yearly: number
  features: string[]
  limits: {
    properties: number
    ai_calls_month: number
    reports_month: number
    users: number
  }
  stripe_price_id_monthly: string
  stripe_price_id_yearly: string
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'gratuito',
    name: 'Gratuito',
    price_monthly: 0,
    price_yearly: 0,
    features: ['1 propriedade', 'Mapa básico OSM', 'Dashboard simples', 'Sem IA'],
    limits: { properties: 1, ai_calls_month: 0, reports_month: 0, users: 1 },
    stripe_price_id_monthly: '',
    stripe_price_id_yearly: '',
  },
  {
    id: 'starter',
    name: 'Starter',
    price_monthly: 97,
    price_yearly: 77,
    features: ['3 propriedades', 'IA limitada (10 consultas/mês)', '2 relatórios ESG/mês', 'Alertas INPE', 'Suporte email'],
    limits: { properties: 3, ai_calls_month: 10, reports_month: 2, users: 1 },
    stripe_price_id_monthly: 'price_starter_monthly',
    stripe_price_id_yearly: 'price_starter_yearly',
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 297,
    price_yearly: 237,
    features: ['10 propriedades', 'IA ilimitada', 'Relatórios ESG ilimitados', 'Dados INPE em tempo real', 'Calculadora carbono', 'Exportar PDF', 'Suporte prioritário'],
    limits: { properties: 10, ai_calls_month: -1, reports_month: -1, users: 3 },
    stripe_price_id_monthly: 'price_pro_monthly',
    stripe_price_id_yearly: 'price_pro_yearly',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: 897,
    price_yearly: 717,
    features: ['Propriedades ilimitadas', 'IA ilimitada', 'Multi-empresa', 'API própria', 'Dashboard personalizado', 'Dados INPE real-time', 'Gerente de conta dedicado'],
    limits: { properties: -1, ai_calls_month: -1, reports_month: -1, users: -1 },
    stripe_price_id_monthly: 'price_enterprise_monthly',
    stripe_price_id_yearly: 'price_enterprise_yearly',
  },
]