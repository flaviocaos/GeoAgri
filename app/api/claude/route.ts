import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    // Verifica autenticação
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verifica limite de uso do plano
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, ai_calls_this_month')
      .eq('id', session.user.id)
      .single()

    const limits: Record<string, number> = {
      gratuito: 0,
      starter: 10,
      pro: -1, // ilimitado
      enterprise: -1,
    }

    const plan = profile?.plan || 'gratuito'
    const limit = limits[plan]
    const used = profile?.ai_calls_this_month || 0

    if (limit === 0) {
      return NextResponse.json({ error: 'Seu plano não inclui IA. Faça upgrade para usar esta funcionalidade.' }, { status: 403 })
    }

    if (limit > 0 && used >= limit) {
      return NextResponse.json({ error: `Limite de ${limit} consultas de IA atingido este mês. Faça upgrade para continuar.` }, { status: 429 })
    }

    // Chama a API do Claude
    const body = await req.json()
    const apiKey = process.env.ANTHROPIC_API_KEY!

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // Incrementa contador de uso
    await supabase
      .from('profiles')
      .update({ ai_calls_this_month: used + 1 })
      .eq('id', session.user.id)

    // Registra no log de uso
    await supabase.from('usage_logs').insert({
      user_id: session.user.id,
      type: 'ai_chat',
      tokens_used: data.usage?.input_tokens + data.usage?.output_tokens || 0,
    })

    return NextResponse.json(data, { status: response.status })

  } catch (error: any) {
    console.error('Claude API error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}