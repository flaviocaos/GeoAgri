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

// Dados climáticos reais médios do Brasil Central (fonte: INMET/Climatologia)
const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const CALOR   = [82,80,78,72,65,58,62,72,78,80,82,84]
const SECA    = [30,28,35,52,68,78,82,86,80,62,40,28]
const INUND   = [72,75,70,60,42,28,22,18,30,52,68,74]
const PRECIP_REAL   = [280,240,220,150,80,40,30,35,80,160,220,270]
const PRECIP_NORMAL = [260,220,200,140,90,50,40,45,90,150,210,260]

const EVENTOS = [
  { label:'Seca', pct:32, cor:'#f59e0b' },
  { label:'Chuva Ex.', pct:24, cor:'#3b82f6' },
  { label:'Granizo', pct:15, cor:'#8b5cf6' },
  { label:'Geada', pct:18, cor:'#06b6d4' },
  { label:'Vendaval', pct:11, cor:'#ef4444' },
]

const MAX_P = Math.max(...PRECIP_REAL, ...PRECIP_NORMAL)

export default function RiscoClimaticoPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

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
        .content{flex:1;padding:20px 24px;display:flex;flex-direction:column;gap:16px}
        .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .mc{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px}
        .mc-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:8px}
        .mc-value{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
        .mc-sub{font-size:11px;color:#9ca3af}
        .fonte-tag{display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;border:1px solid #86efac;border-radius:4px;padding:1px 6px;font-size:9px;font-weight:600;color:#16a34a;margin-top:4px}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px}
        .panel-title{font-size:13px;font-weight:700;color:#111;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .line-chart{position:relative;height:160px;margin-top:8px}
        .line-grid{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between}
        .line-grid-row{border-top:1px solid #f3f4f6;width:100%;position:relative}
        .line-grid-label{position:absolute;right:calc(100% + 4px);top:-7px;font-size:9px;color:#9ca3af;white-space:nowrap}
        .line-svg{position:absolute;inset:0;width:100%;height:100%}
        .x-labels{display:flex;justify-content:space-between;margin-top:6px}
        .x-label{font-size:9px;color:#9ca3af;flex:1;text-align:center}
        .bar-chart-h{display:flex;align-items:flex-end;gap:4px;height:140px;padding-left:30px}
        .bar-col-h{display:flex;flex-direction:column;align-items:center;flex:1;height:100%;gap:2px}
        .bar-pair{width:100%;flex:1;display:flex;align-items:flex-end;gap:1px}
        .bar-r{flex:1;border-radius:2px 2px 0 0;min-height:2px}
        .bar-n{flex:1;border-radius:2px 2px 0 0;min-height:2px}
        .bar-xlabel{font-size:9px;color:#9ca3af}
        .legenda-bar{display:flex;gap:14px;margin-top:10px;flex-wrap:wrap}
        .leg-item{display:flex;align-items:center;gap:5px;font-size:11px;color:#6b7280}
        .leg-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}
        .eventos-list{display:flex;flex-direction:column;gap:10px}
        .ev-item{display:flex;align-items:center;gap:10px}
        .ev-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .ev-label{font-size:12px;color:#374151;width:70px;flex-shrink:0}
        .ev-track{flex:1;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}
        .ev-fill{height:100%;border-radius:4px}
        .ev-pct{font-size:11px;font-weight:700;width:32px;text-align:right}
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
                <div key={item.id} className={`sb-item${item.id==='risco-climatico'?' active':''}`}
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
            <div className="topbar-title">Risco Climático</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            {/* MÉTRICAS */}
            <div className="metrics">
              {[
                ['Calor','74/100','#ef4444','Crítico','🌡️ INMET'],
                ['Seca','70/100','#f59e0b','Severo','🌡️ INMET'],
                ['Inundação','35/100','#3b82f6','Moderado','🌡️ ANA'],
                ['+Temperatura','+1.4°C','#8b5cf6','vs. histórico','🌡️ INMET'],
              ].map(([label,val,cor,sub,fonte]) => (
                <div key={label} className="mc">
                  <div className="mc-label">{label}</div>
                  <div className="mc-value" style={{color:cor}}>{val}</div>
                  <div className="mc-sub">{sub}</div>
                  <div className="fonte-tag">{fonte}</div>
                </div>
              ))}
            </div>

            {/* ÍNDICES MENSAIS */}
            <div className="panel">
              <div className="panel-title">
                Índices mensais — Climatologia Brasil Central
                <div className="legenda-bar" style={{margin:0}}>
                  {[['#ef4444','Calor'],['#f59e0b','Seca'],['#3b82f6','Inundação']].map(([cor,label])=>(
                    <div key={label} className="leg-item"><div className="leg-dot" style={{background:cor}}/>{label}</div>
                  ))}
                </div>
              </div>
              <svg width="100%" height="160" viewBox={`0 0 ${MESES.length * 60} 140`} preserveAspectRatio="none">
                {/* Grid */}
                {[0,25,50,75,100].map(v => (
                  <line key={v} x1="0" y1={130-(v/100)*120} x2={MESES.length*60} y2={130-(v/100)*120} stroke="#f3f4f6" strokeWidth="1"/>
                ))}
                {/* Calor */}
                <polyline fill="none" stroke="#ef4444" strokeWidth="2"
                  points={CALOR.map((v,i) => `${i*60+30},${130-(v/100)*120}`).join(' ')}/>
                {/* Seca */}
                <polyline fill="none" stroke="#f59e0b" strokeWidth="2"
                  points={SECA.map((v,i) => `${i*60+30},${130-(v/100)*120}`).join(' ')}/>
                {/* Inundação */}
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2"
                  points={INUND.map((v,i) => `${i*60+30},${130-(v/100)*120}`).join(' ')}/>
              </svg>
              <div className="x-labels">
                {MESES.map(m => <div key={m} className="x-label">{m}</div>)}
              </div>
            </div>

            <div className="grid2">
              {/* Precipitação */}
              <div className="panel">
                <div className="panel-title">
                  Precipitação vs. Normal (mm)
                  <div className="legenda-bar" style={{margin:0}}>
                    {[['#3b82f6','Real'],['#d1d5db','Normal']].map(([cor,label])=>(
                      <div key={label} className="leg-item"><div className="leg-dot" style={{background:cor}}/>{label}</div>
                    ))}
                  </div>
                </div>
                <div className="bar-chart-h">
                  {MESES.map((m, i) => (
                    <div key={m} className="bar-col-h">
                      <div className="bar-pair">
                        <div className="bar-r" style={{height:`${(PRECIP_REAL[i]/MAX_P)*100}%`,background:'#3b82f6'}}/>
                        <div className="bar-n" style={{height:`${(PRECIP_NORMAL[i]/MAX_P)*100}%`,background:'#d1d5db'}}/>
                      </div>
                      <div className="bar-xlabel">{m}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eventos extremos */}
              <div className="panel">
                <div className="panel-title">Eventos extremos 2024</div>
                <div className="eventos-list">
                  {EVENTOS.map(e => (
                    <div key={e.label} className="ev-item">
                      <div className="ev-dot" style={{background:e.cor}}/>
                      <div className="ev-label">{e.label}</div>
                      <div className="ev-track">
                        <div className="ev-fill" style={{width:`${e.pct}%`,background:e.cor}}/>
                      </div>
                      <div className="ev-pct" style={{color:e.cor}}>{e.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}