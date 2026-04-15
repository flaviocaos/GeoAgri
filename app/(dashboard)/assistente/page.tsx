'use client'
import { useState, useEffect, useRef } from 'react'

const MENU = [
  { group: 'GERAL', items: [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/dashboard' },
    { id: 'assistente', label: 'Assistente IA', icon: '🤖', href: '/assistente' },
    { id: 'alertas', label: 'Alertas', icon: '🔔', badge: 5, href: '/alertas' },
  ]},
  { group: 'DADOS', items: [
    { id: 'importar', label: 'Importar Dados', icon: '📤', href: '/importar' },
    { id: 'mapa', label: 'Mapa', icon: '🗺️', href: '/mapa' },
  ]},
  { group: 'ANÁLISES', items: [
    { id: 'analise-ia', label: 'Analisar IA Imagem', icon: '🔍', href: '/analise-ia' },
    { id: 'desmatamento', label: 'Desmatamento', icon: '🌲', href: '/desmatamento' },
    { id: 'risco-climatico', label: 'Risco Climático', icon: '🌡️', href: '/risco-climatico' },
  ]},
  { group: 'GESTÃO', items: [
    { id: 'carbono', label: 'Carbono & Financeiro', icon: '♻️', href: '/carbono' },
    { id: 'conformidade', label: 'Conformidade', icon: '✅', href: '/conformidade' },
    { id: 'metas-esg', label: 'Metas ESG', icon: '🎯', href: '/metas-esg' },
    { id: 'comparar', label: 'Comparar Fazendas', icon: '⚖️', href: '/comparar' },
    { id: 'relatorio-esg', label: 'Relatório ESG', icon: '📊', href: '/relatorio-esg' },
  ]},
]

const SUGESTOES = [
  'Qual o risco de ESG na minha região?',
  'Como melhorar meu score ESG?',
  'Quanto vale meu crédito de carbono?',
  'O que é reserva legal?',
  'Como reduzir desmatamento?',
]

const HISTORICO = [
  { tipo: 'critico', icone: '🔴', titulo: 'Queimada detectada — 340ha', local: 'Pará', tempo: '2h', status: 'crítico' },
  { tipo: 'atencao', icone: '🟡', titulo: 'Precipitação abaixo do normal', local: 'atenção', tempo: '5h', status: 'atenção' },
  { tipo: 'info', icone: '🔵', titulo: 'Relatório PRODES divulgado', local: 'info', tempo: '1d', status: 'info' },
  { tipo: 'positivo', icone: '🟢', titulo: 'Vegetação nativa +2% detectada', local: 'positivo', tempo: '2d', status: 'positivo' },
  { tipo: 'atencao', icone: '🟡', titulo: 'APP com área reduzida', local: 'atenção', tempo: '3d', status: 'atenção' },
  { tipo: 'positivo', icone: '🟢', titulo: 'CAR regularizado com sucesso', local: 'positivo', tempo: '5d', status: 'positivo' },
]

type Msg = { role: 'user' | 'assistant'; text: string }

export default function AssistentePage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    const parsed = JSON.parse(u)
    setUser(parsed)
    setMsgs([{
      role: 'assistant',
      text: `Olá! Sou o assistente GeoAgri, especializado em agronegócio sustentável, ESG e análise geoespacial. Estou conectado ao perfil **${parsed.profile || 'Produtor Rural'}**. Como posso ajudar hoje? 🌱`
    }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const enviar = async (texto?: string) => {
    const q = texto || input.trim()
    if (!q || loading) return
    setInput('')
    setMsgs(prev => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: 'Você é o Assistente Agrícola GeoAgri, especialista em agronegócio sustentável, ESG, créditos de carbono, desmatamento, INPE, PRODES, DETER, CAR, reserva legal e legislação ambiental brasileira. Responda sempre em português brasileiro de forma clara, objetiva e profissional. Use emojis com moderação.',
          messages: [
            ...msgs.filter(m => m.role !== 'assistant' || msgs.indexOf(m) > 0).map(m => ({
              role: m.role,
              content: m.text
            })),
            { role: 'user', content: q }
          ]
        })
      })
      const data = await res.json()
      const txt = data.content?.find((b: any) => b.type === 'text')?.text || 'Erro ao obter resposta.'
      setMsgs(prev => [...prev, { role: 'assistant', text: txt }])
    } catch {
      setMsgs(prev => [...prev, { role: 'assistant', text: 'Erro ao conectar com a IA. Verifique sua conexão.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f5f5f5;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}
        .layout{display:flex;min-height:100vh}
        .sidebar{width:200px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:10;overflow-y:auto}
        .sb-brand{display:flex;align-items:center;gap:8px;padding:16px;border-bottom:1px solid #e5e7eb;position:sticky;top:0;background:#fff}
        .sb-logo{width:28px;height:28px;background:#16a34a;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;font-weight:800}
        .sb-title{font-size:15px;font-weight:800;color:#16a34a}
        .sb-group{padding:10px 10px 4px}
        .sb-group-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;padding:0 6px;margin-bottom:4px}
        .sb-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:#6b7280;transition:all .15s;position:relative}
        .sb-item:hover{background:#f0fdf4;color:#16a34a}
        .sb-item.active{background:#16a34a;color:#fff}
        .sb-badge{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:#ef4444;color:#fff;font-size:9px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center}
        .sb-footer{margin-top:auto;padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;align-items:center;gap:8px;position:sticky;bottom:0;background:#fff}
        .sb-avatar{width:28px;height:28px;border-radius:50%;background:#d1fae5;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#16a34a;cursor:pointer}
        .sb-uname{font-size:11px;font-weight:600;color:#374151}
        .sb-urole{font-size:10px;color:#9ca3af}
        .main{flex:1;margin-left:200px;display:flex;flex-direction:column;min-height:100vh}
        .topbar{height:52px;background:#fff;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:5}
        .topbar-title{font-size:16px;font-weight:700;color:#111}
        .topbar-right{display:flex;align-items:center;gap:10px}
        .status-pill{display:flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #86efac;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;color:#16a34a}
        .status-dot{width:6px;height:6px;border-radius:50%;background:#16a34a;animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .perfil-pill{background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;color:#2563eb}
        .date-text{font-size:11px;color:#9ca3af}
        .content{flex:1;display:flex;gap:16px;padding:20px 24px;min-height:0}
        .chat-wrap{flex:1;display:flex;flex-direction:column;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .chat-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;gap:10px}
        .chat-avatar{width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,#16a34a,#4ade80);display:flex;align-items:center;justify-content:center;font-size:16px}
        .chat-name{font-size:13px;font-weight:700;color:#111}
        .chat-sub{font-size:11px;color:#16a34a}
        .chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;min-height:300px;max-height:calc(100vh - 280px)}
        .msg{display:flex;gap:10px;max-width:85%}
        .msg.user{align-self:flex-end;flex-direction:row-reverse}
        .msg-avatar{width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
        .msg-avatar.ai{background:#d1fae5;color:#16a34a}
        .msg-avatar.user{background:#dbeafe;color:#2563eb}
        .msg-bubble{padding:10px 13px;border-radius:10px;font-size:13px;line-height:1.6;white-space:pre-wrap}
        .msg-bubble.ai{background:#f9fafb;border:1px solid #e5e7eb;color:#111}
        .msg-bubble.user{background:#16a34a;color:#fff}
        .typing{display:flex;gap:4px;align-items:center;padding:10px 13px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px}
        .typing span{width:6px;height:6px;border-radius:50%;background:#9ca3af;animation:typing 1.2s infinite}
        .typing span:nth-child(2){animation-delay:.2s}
        .typing span:nth-child(3){animation-delay:.4s}
        @keyframes typing{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .sugestoes{display:flex;gap:8px;flex-wrap:wrap;padding:10px 16px;border-top:1px solid #f3f4f6}
        .sug-btn{background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:5px 10px;font-size:11px;font-weight:500;color:#16a34a;cursor:pointer;transition:all .15s;white-space:nowrap}
        .sug-btn:hover{background:#dcfce7}
        .chat-input-wrap{padding:12px 16px;border-top:1px solid #e5e7eb;display:flex;gap:8px}
        .chat-input{flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;font-size:13px;font-family:inherit;outline:none;resize:none;min-height:40px;max-height:100px}
        .chat-input:focus{border-color:#16a34a}
        .send-btn{background:#16a34a;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap}
        .send-btn:hover{background:#15803d}
        .send-btn:disabled{opacity:.5;cursor:not-allowed}
        .hist-wrap{width:260px;flex-shrink:0;background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
        .hist-header{padding:14px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        .hist-sub{font-size:11px;color:#9ca3af;font-weight:400;margin-left:4px}
        .hist-list{flex:1;overflow-y:auto;padding:8px}
        .hist-item{display:flex;gap:10px;padding:10px;border-radius:8px;cursor:pointer;transition:background .15s;border-bottom:1px solid #f9fafb}
        .hist-item:hover{background:#f9fafb}
        .hist-icon{font-size:18px;flex-shrink:0;margin-top:2px}
        .hist-title{font-size:12px;font-weight:600;color:#111;margin-bottom:2px}
        .hist-meta{font-size:10px;display:flex;gap:6px;align-items:center}
        .hist-status{padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700}
        .st-critico{background:#fee2e2;color:#ef4444}
        .st-atencao{background:#fef3c7;color:#f59e0b}
        .st-info{background:#dbeafe;color:#2563eb}
        .st-positivo{background:#d1fae5;color:#16a34a}
        .hist-tempo{color:#9ca3af}
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">G</div>
            <div className="sb-title">GeoAgri</div>
          </div>
          {MENU.map(group => (
            <div key={group.group} className="sb-group">
              <div className="sb-group-label">{group.group}</div>
              {group.items.map(item => (
                <div key={item.id}
                  className={`sb-item${item.id==='assistente'?' active':''}`}
                  onClick={() => window.location.href = item.href}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
          <div className="sb-footer">
            <div className="sb-avatar" onClick={() => { localStorage.removeItem('geoagri_user'); window.location.href='/login' }}>G</div>
            <div>
              <div className="sb-uname">{user?.email?.split('@')[0] || 'GeoAgri'}</div>
              <div className="sb-urole">Produtor Rural</div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          <div className="topbar">
            <div className="topbar-title">Assistente IA Agrícola</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div className="date-text">{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            {/* CHAT */}
            <div className="chat-wrap">
              <div className="chat-header">
                <div className="chat-avatar">🤖</div>
                <div>
                  <div className="chat-name">Assistente Agrícola GeoAgri</div>
                  <div className="chat-sub">Powered by Claude AI · Especialista em agronegócio sustentável</div>
                </div>
              </div>

              <div className="chat-msgs">
                {msgs.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    <div className={`msg-avatar ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                      {m.role === 'assistant' ? '🤖' : '👤'}
                    </div>
                    <div className={`msg-bubble ${m.role === 'assistant' ? 'ai' : 'user'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="msg">
                    <div className="msg-avatar ai">🤖</div>
                    <div className="typing">
                      <span/><span/><span/>
                    </div>
                  </div>
                )}
                <div ref={bottomRef}/>
              </div>

              <div className="sugestoes">
                {SUGESTOES.map(s => (
                  <button key={s} className="sug-btn" onClick={() => enviar(s)}>{s}</button>
                ))}
              </div>

              <div className="chat-input-wrap">
                <textarea
                  className="chat-input"
                  placeholder="Pergunte sobre sua fazenda, ESG, clima, carbono..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
                  rows={1}
                />
                <button className="send-btn" onClick={() => enviar()} disabled={loading || !input.trim()}>
                  Enviar
                </button>
              </div>
            </div>

            {/* HISTÓRICO */}
            <div className="hist-wrap">
              <div className="hist-header">
                Histórico de alertas <span className="hist-sub">— 12 meses</span>
              </div>
              <div className="hist-list">
                {HISTORICO.map((h, i) => (
                  <div key={i} className="hist-item">
                    <div className="hist-icon">{h.icone}</div>
                    <div>
                      <div className="hist-title">{h.titulo}</div>
                      <div className="hist-meta">
                        <span className={`hist-status st-${h.tipo}`}>{h.status}</span>
                        <span className="hist-tempo">{h.tempo}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}