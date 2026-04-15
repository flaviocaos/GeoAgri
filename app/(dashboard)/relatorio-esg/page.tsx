'use client'
import { useState, useEffect } from 'react'

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

type Secao = { titulo: string; conteudo: string; status: 'ok'|'atencao'|'critico' }

export default function RelatorioESGPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [nome, setNome] = useState('')
  const [area, setArea] = useState('')
  const [estado, setEstado] = useState('')
  const [loading, setLoading] = useState(false)
  const [secoes, setSecoes] = useState<Secao[]>([])
  const [scoreTotal, setScoreTotal] = useState<number|null>(null)
  const [scoreA, setScoreA] = useState<number|null>(null)
  const [scoreS, setScoreS] = useState<number|null>(null)
  const [scoreG, setScoreG] = useState<number|null>(null)
  const [aberto, setAberto] = useState<number|null>(null)
  const [gerado, setGerado] = useState(false)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

  const gerarRelatorio = async () => {
    if (!nome || !area || !estado) return
    setLoading(true)
    setSecoes([])
    setGerado(false)

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Você é um especialista em ESG agrícola e sustentabilidade rural brasileiro. Gere um relatório ESG completo para a seguinte propriedade:

Nome: ${nome}
Área: ${area} ha
Estado: ${estado}
Produtor: ${user?.email || 'Produtor Rural'}

Retorne APENAS JSON válido (sem markdown) no formato:
{
  "score_total": number,
  "score_ambiental": number,
  "score_social": number,
  "score_governanca": number,
  "secoes": [
    {"titulo": "INDICADORES AMBIENTAIS", "conteudo": "texto detalhado", "status": "ok|atencao|critico"},
    {"titulo": "INDICADORES SOCIAIS", "conteudo": "texto detalhado", "status": "ok|atencao|critico"},
    {"titulo": "GOVERNANÇA", "conteudo": "texto detalhado", "status": "ok|atencao|critico"},
    {"titulo": "RISCOS CLIMÁTICOS", "conteudo": "texto detalhado", "status": "ok|atencao|critico"},
    {"titulo": "RECOMENDAÇÕES", "conteudo": "texto detalhado", "status": "ok"}
  ]
}`
          }]
        })
      })
      const data = await res.json()
      const txt = data.content?.find((b: any) => b.type === 'text')?.text || ''
      const match = txt.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        setScoreTotal(parsed.score_total)
        setScoreA(parsed.score_ambiental)
        setScoreS(parsed.score_social)
        setScoreG(parsed.score_governanca)
        setSecoes(parsed.secoes || [])
        setAberto(0)
        setGerado(true)
      }
    } catch {
      alert('Erro ao gerar relatório. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    const titulo = document.title
    document.title = `Relatorio_ESG_${nome}_${new Date().toISOString().slice(0,10)}`
    window.print()
    document.title = titulo
  }

  if (!mounted) return null

  const STATUS_COR: Record<string,string> = { ok:'#16a34a', atencao:'#f59e0b', critico:'#ef4444' }
  const STATUS_BG: Record<string,string>  = { ok:'#d1fae5', atencao:'#fef3c7', critico:'#fee2e2' }
  const STATUS_LABEL: Record<string,string> = { ok:'Regular', atencao:'Atenção', critico:'Crítico' }

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
        .content{flex:1;padding:20px 24px;display:flex;flex-direction:column;gap:16px}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}
        .panel-title{font-size:13px;font-weight:700;color:#111}
        .form-row{display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;padding:16px 18px;align-items:end}
        .field{display:flex;flex-direction:column;gap:5px}
        .field-label{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
        .field-input{background:#f9fafb;border:1px solid #e5e7eb;border-radius:7px;padding:8px 12px;font-size:13px;color:#111;font-family:inherit;outline:none}
        .field-input:focus{border-color:#16a34a}
        .gerar-btn{background:#16a34a;color:#fff;border:none;border-radius:7px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;height:38px}
        .gerar-btn:hover{background:#15803d}
        .gerar-btn:disabled{opacity:.5;cursor:not-allowed}
        .score-banner{background:linear-gradient(135deg,#16a34a,#15803d);border-radius:10px;padding:20px 24px;display:flex;align-items:center;gap:32px}
        .score-main{text-align:center}
        .score-num{font-size:52px;font-weight:800;color:#fff;letter-spacing:-3px;line-height:1}
        .score-label{font-size:12px;color:rgba(255,255,255,.7);margin-top:4px}
        .score-subs{display:flex;gap:24px}
        .score-sub{text-align:center;padding:12px 16px;background:rgba(255,255,255,.15);border-radius:8px}
        .score-sub-val{font-size:22px;font-weight:800;color:#fff}
        .score-sub-label{font-size:10px;color:rgba(255,255,255,.7);margin-top:2px}
        .secao-item{border-bottom:1px solid #f3f4f6}
        .secao-item:last-child{border-bottom:none}
        .secao-header{display:flex;align-items:center;gap:12px;padding:13px 18px;cursor:pointer;transition:background .15s}
        .secao-header:hover{background:#f9fafb}
        .secao-badge{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}
        .secao-titulo{flex:1;font-size:13px;font-weight:600;color:#374151}
        .secao-toggle{font-size:12px;color:#9ca3af}
        .secao-body{padding:0 18px 14px;font-size:13px;color:#6b7280;line-height:1.7}
        .loading-box{padding:32px;text-align:center;color:#9ca3af}
        .spinner{width:28px;height:28px;border:3px solid #e5e7eb;border-top-color:#16a34a;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pdf-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:600;color:#374151;cursor:pointer}
        .pdf-btn:hover{background:#e5e7eb}
        @media print{.sidebar,.topbar,.form-row,.gerar-btn,.pdf-btn{display:none!important}.main{margin-left:0!important}}
      `}</style>

      <div className="layout">
        <div className="sidebar">
          <div className="sb-brand">
            <div className="sb-logo">G</div>
            <div className="sb-title">GeoAgri</div>
          </div>
          {MENU.map(group => (
            <div key={group.group} className="sb-group">
              <div className="sb-group-label">{group.group}</div>
              {group.items.map(item => (
                <div key={item.id} className={`sb-item${item.id==='relatorio-esg'?' active':''}`}
                  onClick={() => window.location.href = item.href}>
                  <span>{item.icon}</span><span>{item.label}</span>
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

        <div className="main">
          <div className="topbar">
            <div className="topbar-title">Relatório ESG</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              {gerado && <button className="pdf-btn" onClick={downloadPDF}>📄 PDF</button>}
            </div>
          </div>

          <div className="content">
            {/* FORMULÁRIO */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">Dados da propriedade</div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label className="field-label">Nome da propriedade</label>
                  <input className="field-input" placeholder="Fazenda São João" value={nome} onChange={e=>setNome(e.target.value)}/>
                </div>
                <div className="field">
                  <label className="field-label">Área (ha)</label>
                  <input className="field-input" type="number" placeholder="5000" value={area} onChange={e=>setArea(e.target.value)}/>
                </div>
                <div className="field">
                  <label className="field-label">Estado</label>
                  <select className="field-input" value={estado} onChange={e=>setEstado(e.target.value)}>
                    <option value="">Selecione</option>
                    {['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'].map(e=>(
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <button className="gerar-btn" onClick={gerarRelatorio} disabled={loading||!nome||!area||!estado}>
                  {loading ? '⏳ Gerando...' : '✦ Gerar Relatório ESG com IA'}
                </button>
              </div>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="panel">
                <div className="loading-box">
                  <div className="spinner"/>
                  <div style={{fontSize:13}}>Gerando relatório ESG com Claude AI...</div>
                  <div style={{fontSize:11,marginTop:4}}>Analisando indicadores ambientais, sociais e de governança</div>
                </div>
              </div>
            )}

            {/* RESULTADO */}
            {gerado && scoreTotal !== null && (
              <>
                {/* SCORE BANNER */}
                <div className="score-banner">
                  <div className="score-main">
                    <div className="score-num">{scoreTotal}</div>
                    <div className="score-label">Score ESG — {nome}</div>
                  </div>
                  <div className="score-subs">
                    {[['Ambiental',scoreA],['Social',scoreS],['Governança',scoreG]].map(([l,v])=>(
                      <div key={String(l)} className="score-sub">
                        <div className="score-sub-val">{v}</div>
                        <div className="score-sub-label">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginLeft:'auto',fontSize:11,color:'rgba(255,255,255,.6)'}}>
                    Análise por IA · GeoAgri v4.0
                  </div>
                </div>

                {/* SEÇÕES */}
                <div className="panel">
                  {secoes.map((s, i) => (
                    <div key={i} className="secao-item">
                      <div className="secao-header" onClick={() => setAberto(aberto===i?null:i)}>
                        <span className="secao-badge" style={{background:STATUS_BG[s.status],color:STATUS_COR[s.status]}}>
                          {STATUS_LABEL[s.status]}
                        </span>
                        <span className="secao-titulo">{s.titulo}</span>
                        <span className="secao-toggle">{aberto===i?'▾':'▸'}</span>
                      </div>
                      {aberto===i && (
                        <div className="secao-body">{s.conteudo}</div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}