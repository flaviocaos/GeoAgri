import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client com service role — apenas no servidor
export const supabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

// Helpers de autenticação
export const auth = {
  signUp: async (email: string, password: string, name: string, role: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    })
    return { data, error }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/nova-senha`
    })
    return { data, error }
  }
}

// Helpers de banco de dados
export const db = {
  // Propriedades
  getProperties: async (userId: string) => {
    return supabase.from('properties').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  },

  createProperty: async (data: any) => {
    return supabase.from('properties').insert(data).select().single()
  },

  updateProperty: async (id: string, data: any) => {
    return supabase.from('properties').update(data).eq('id', id).select().single()
  },

  deleteProperty: async (id: string) => {
    return supabase.from('properties').delete().eq('id', id)
  },

  // Alertas
  getAlerts: async (userId: string, limit = 50) => {
    return supabase.from('alerts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit)
  },

  markAlertRead: async (id: string) => {
    return supabase.from('alerts').update({ read: true }).eq('id', id)
  },

  markAllAlertsRead: async (userId: string) => {
    return supabase.from('alerts').update({ read: true }).eq('user_id', userId)
  },

  // Relatórios ESG
  getReports: async (propertyId: string) => {
    return supabase.from('esg_reports').select('*').eq('property_id', propertyId).order('created_at', { ascending: false })
  },

  createReport: async (data: any) => {
    return supabase.from('esg_reports').insert(data).select().single()
  },

  // Perfil do usuário
  getProfile: async (userId: string) => {
    return supabase.from('profiles').select('*').eq('id', userId).single()
  },

  updateProfile: async (userId: string, data: any) => {
    return supabase.from('profiles').update(data).eq('id', userId).select().single()
  },
}