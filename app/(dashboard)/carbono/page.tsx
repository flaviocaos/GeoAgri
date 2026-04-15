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

// Padrões de mercado de carbono reais (preços públicos abril/2026)
const MERCADOS = [
  { padrao: 'VERRA (VCS)', preco: 'R$ 45-80', elegivel: true },
  { padrao: 'Gold Standard', preco: 'R$ 80-120', elegivel: null },
  { padrao: 'Cerrado Sust.', preco: 'R$ 25-55', elegivel: true },
  { padrao: 'REDD+', preco: 'R$ 25-45', elegivel: null },
]

const SOLOS = ['Latossolo (1.2+)','Argissolo (1.0)','Cambissolo (0.8)','Neossolo (0.6)']
const PRATICAS = ['Plantio Direto (+30%)','Integração LP (+25%)','Convencional (base)','Pastagem Deg. (-20%)']

function calcularCreditos(area: number, vegNativa: number, tipoSolo: string, pratica: string) {
  const fatorSolo = tipoSolo.includes('1.2') ? 1.2 : tipoSolo.includes('1.0') ? 1.0 : tipoSolo.includes('0.8') ? 0.8 : 0.6
  const fatorPratica = pratica.includes('+30') ? 1.3 : pratica.includes('+25') ? 1.25 : pratica.includes('-20') ? 0.8 : 1.0
  const base = area * (vegNativa / 100) * fatorSolo * fatorPratica
  return Math.round(base)
}

export default function CarbonoPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [area, setArea] = useState(5000)
  const [vegNativa, setVegNativa] = useState(30)
  const [tipoSolo, setTipoSolo] = useState(SOLOS[0])
  const [pratica, setPratica] = useState(PRATICAS[0])
  const [emissao, setEmissao] = useState(2.5)
  const [preco, setPreco] = useState(50)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

  if (!mounted) return null

  const creditos = calcularCreditos(area, vegNativa, tipoSolo, pratica)
  const creditosLiq = Math.max(0, creditos - Math.round(emissao * area / 1000))
  const valorMercado = creditosLiq * preco
  const multaEvitada = Math.round(area * (vegNativa / 100) * 0.15 * 1000)
  const creditoRural = Math.round(area * 0.8 * 0.5)
  const custoCert = -12000
  const custoPlantio = -35000
  const retorno3anos = valorMercado + multaEvitada + creditoRural + custoCert + custoPlantio

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
        .content{flex:1;padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        .form-body{padding:16px 18px;display:flex;flex-direction:column;gap:12px}
        .field{display:flex;flex-direction:column;gap:5px}
        .field-label{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}
        .field-input{background:#f9fafb;border:1px solid #e5e7eb;border-radius:7px;padding:8px 12px;font-size:13px;color:#111;font-family:inherit;outline:none}
        .field-input:focus{border-color:#16a34a}
        .result-box{background:linear-gradient(135deg,#16a34a,#15803d);border-radius:10px;padding:20px;text-align:center;margin:0 18px 16px}
        .result-num{font-size:40px;font-weight:800;color:#fff;letter-spacing:-2px}
        .result-unit{font-size:13px;color:rgba(255,255,255,.7);margin-top:2px}
        .result-sub{display:flex;justify-content:center;gap:20px;margin-top:12px}
        .result-sub-item{text-align:center}
        .result-sub-val{font-size:14px;font-weight:700;color:#fff}
        .result-sub-label{font-size:10px;color:rgba(255,255,255,.6)}
        .financ-list{padding:0 18px 16px;display:flex;flex-direction:column;gap:8px}
        .fin-item{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#f9fafb;border-radius:7px}
        .fin-label{font-size:12px;color:#374151}
        .fin-sub{font-size:10px;color:#9ca3af}
        .fin-val{font-size:14px;font-weight:700}
        .fin-val.pos{color:#16a34a}
        .fin-val.neg{color:#ef4444}
        .fin-total{display:flex;justify-content:space-between;align-items:center;padding:12px 18px;border-top:2px solid #e5e7eb;background:#f0fdf4}
        .mercado-table{width:100%;border-collapse:collapse}
        .mercado-table th{padding:10px 18px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;background:#f9fafb;border-bottom:1px solid #f3f4f6}
        .mercado-table td{padding:11px 18px;font-size:12px;border-bottom:1px solid #f9fafb}
        .mercado-table tr:last-child td{border-bottom:none}
        .elig{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}
        .elig.sim{background:#d1fae5;color:#16a34a}
        .elig.ver{background:#fef3c7;color:#f59e0b}
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
                <div key={item.id} className={`sb-item${item.id==='carbono'?' active':''}`}
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
            <div className="topbar-title">Carbono & Módulo Financeiro</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            {/* CALCULADORA */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="panel">
                <div className="panel-header">Calculadora de créditos de carbono</div>
                <div className="form-body">
                  <div className="field">
                    <label className="field-label">Área Total (ha)</label>
                    <input className="field-input" type="number" value={area} onChange={e=>setArea(Number(e.target.value))}/>
                  </div>
                  <div className="field">
                    <label className="field-label">Vegetação Nativa (%)</label>
                    <input className="field-input" type="number" min="0" max="100" value={vegNativa} onChange={e=>setVegNativa(Number(e.target.value))}/>
                  </div>
                  <div className="field">
                    <label className="field-label">Tipo de Solo</label>
                    <select className="field-input" value={tipoSolo} onChange={e=>setTipoSolo(e.target.value)}>
                      {SOLOS.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label className="field-label">Prática Sustentável</label>
                    <select className="field-input" value={pratica} onChange={e=>setPratica(e.target.value)}>
                      {PRATICAS.map(p=><option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div className="field">
                      <label className="field-label">Emissão Pecuária (t/ha)</label>
                      <input className="field-input" type="number" step="0.1" value={emissao} onChange={e=>setEmissao(Number(e.target.value))}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Preço por Tonelada (R$)</label>
                      <input className="field-input" type="number" value={preco} onChange={e=>setPreco(Number(e.target.value))}/>
                    </div>
                  </div>
                </div>
                <div className="result-box">
                  <div className="result-num">{creditosLiq.toLocaleString()}</div>
                  <div className="result-unit">tCO₂/ano estimados</div>
                  <div className="result-sub">
                    <div className="result-sub-item">
                      <div className="result-sub-val">R$ {valorMercado.toLocaleString()}</div>
                      <div className="result-sub-label">Valor de mercado</div>
                    </div>
                    <div className="result-sub-item">
                      <div className="result-sub-val">{creditos.toLocaleString()}</div>
                      <div className="result-sub-label">tCO₂ bruto</div>
                    </div>
                    <div className="result-sub-item">
                      <div className="result-sub-val" style={{color:'#fde047'}}>Verificar</div>
                      <div className="result-sub-label">Status projeto</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MÓDULO FINANCEIRO + MERCADO */}
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div className="panel">
                <div className="panel-header">Módulo financeiro ESG</div>
                <div className="financ-list">
                  {[
                    [`Créditos carbono VERRA (${creditosLiq}×R$${preco})`, `${creditosLiq} tCO₂/ano`, valorMercado, true],
                    ['Multa ambiental evitada (APP)', 'estimativa legal', multaEvitada, true],
                    ['Crédito rural verde (LCA/CRA)', 'linha especial', creditoRural, true],
                    ['Custo certificação ESG', 'auditoria', custoCert, false],
                    ['Implantação Plantio Direto', 'investimento', custoPlantio, false],
                  ].map(([label, sub, val, pos]) => (
                    <div key={String(label)} className="fin-item">
                      <div>
                        <div className="fin-label">{label}</div>
                        <div className="fin-sub">{String(sub)}</div>
                      </div>
                      <div className={`fin-val ${pos?'pos':'neg'}`}>
                        {pos?'+':''}R$ {Math.abs(Number(val)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="fin-total">
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:'#374151'}}>Retorno estimado (3 anos)</div>
                    <div style={{fontSize:10,color:'#9ca3af'}}>Projeção conservadora</div>
                  </div>
                  <div style={{fontSize:18,fontWeight:800,color:retorno3anos>=0?'#16a34a':'#ef4444'}}>
                    {retorno3anos>=0?'+':''}R$ {retorno3anos.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">Mercado de carbono</div>
                <table className="mercado-table">
                  <thead>
                    <tr><th>Padrão</th><th>Preço/t</th><th>Elegível</th></tr>
                  </thead>
                  <tbody>
                    {MERCADOS.map(m => (
                      <tr key={m.padrao}>
                        <td style={{fontWeight:600}}>{m.padrao}</td>
                        <td style={{color:'#374151'}}>{m.preco}</td>
                        <td>
                          <span className={`elig ${m.elegivel===true?'sim':'ver'}`}>
                            {m.elegivel===true?'Sim':'Verificar'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}