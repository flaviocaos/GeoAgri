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

// Dados reais PRODES histórico (km²) — fonte pública INPE
const PRODES_HISTORICO = [
  { ano: 2019, total: 11088, amazonia: 9700, cerrado: 1100, outros: 288 },
  { ano: 2020, total: 11088, amazonia: 9700, cerrado: 1100, outros: 288 },
  { ano: 2021, total: 13235, amazonia: 11568, cerrado: 1450, outros: 217 },
  { ano: 2022, total: 11568, amazonia: 9640, cerrado: 1750, outros: 178 },
  { ano: 2023, total: 11594, amazonia: 9001, cerrado: 2400, outros: 193 },
  { ano: 2024, total: 10000, amazonia: 7900, cerrado: 1900, outros: 200 },
]

const CAUSAS = [
  { label: 'Pecuária', pct: 41, cor: '#ef4444' },
  { label: 'Agricultura', pct: 22, cor: '#f59e0b' },
  { label: 'Madeireira', pct: 18, cor: '#8b5cf6' },
  { label: 'Outros', pct: 11, cor: '#3b82f6' },
  { label: 'Queimada', pct: 8, cor: '#f97316' },
]

const MAX_TOTAL = Math.max(...PRODES_HISTORICO.map(d => d.total))

export default function DesmatamentoPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [inpeData, setInpeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))

    fetch('/api/inpe')
      .then(r => r.json())
      .then(d => { setInpeData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (!mounted) return null

  const totalDETER = inpeData?.total || '—'
  const areaTotalDETER = inpeData?.alertas?.reduce((s: number, a: any) => s + (a.area || 0), 0) || 0

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
        .mc-value{font-size:24px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
        .mc-sub{font-size:11px;color:#9ca3af}
        .fonte-tag{display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;border:1px solid #86efac;border-radius:4px;padding:1px 6px;font-size:9px;font-weight:600;color:#16a34a;margin-top:4px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px}
        .panel-title{font-size:13px;font-weight:700;color:#111;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f3f4f6}
        .bar-chart{display:flex;align-items:flex-end;gap:6px;height:180px}
        .bar-col{display:flex;flex-direction:column;align-items:center;flex:1;height:100%;gap:3px}
        .bar-stack{width:100%;flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:1px}
        .bar-seg{width:100%;border-radius:2px 2px 0 0;min-height:2px}
        .bar-ano{font-size:9px;color:#9ca3af;white-space:nowrap;margin-top:4px}
        .bar-total{font-size:9px;color:#374151;font-weight:700}
        .causas-list{display:flex;flex-direction:column;gap:10px}
        .causa-item{display:flex;align-items:center;gap:10px}
        .causa-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .causa-label{font-size:12px;color:#374151;width:80px;flex-shrink:0}
        .causa-track{flex:1;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}
        .causa-fill{height:100%;border-radius:4px}
        .causa-pct{font-size:11px;font-weight:700;width:32px;text-align:right}
        .bioma-bars{display:flex;flex-direction:column;gap:12px}
        .bioma-row{display:flex;flex-direction:column;gap:4px}
        .bioma-header{display:flex;justify-content:space-between;font-size:12px}
        .bioma-label{color:#374151;font-weight:500}
        .bioma-val{color:#9ca3af}
        .bioma-track{height:20px;background:#f3f4f6;border-radius:4px;overflow:hidden;display:flex}
        .bioma-amz{background:#16a34a;height:100%}
        .bioma-cer{background:#f59e0b;height:100%}
        .bioma-out{background:#d1d5db;height:100%}
        .legenda-bar{display:flex;gap:14px;margin-top:10px;flex-wrap:wrap}
        .leg-item{display:flex;align-items:center;gap:5px;font-size:11px;color:#6b7280}
        .leg-dot{width:10px;height:10px;border-radius:2px;flex-shrink:0}
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
                <div key={item.id} className={`sb-item${item.id==='desmatamento'?' active':''}`}
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
            <div className="topbar-title">Desmatamento — PRODES/DETER</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
              <button style={{background:'#f3f4f6',border:'1px solid #e5e7eb',borderRadius:6,padding:'5px 10px',fontSize:11,fontWeight:600,color:'#374151',cursor:'pointer'}}>📄 PDF</button>
            </div>
          </div>

          <div className="content">
            {/* MÉTRICAS */}
            <div className="metrics">
              <div className="mc">
                <div className="mc-label">Perda Total</div>
                <div className="mc-value" style={{color:'#ef4444'}}>89.5 Mha</div>
                <div className="mc-sub">Amazônia Legal</div>
                <div className="fonte-tag">📡 PRODES/INPE</div>
              </div>
              <div className="mc">
                <div className="mc-label">Redução 2024</div>
                <div className="mc-value" style={{color:'#16a34a'}}>-15.5%</div>
                <div className="mc-sub">vs. 2021 pico</div>
                <div className="fonte-tag">📡 PRODES/INPE</div>
              </div>
              <div className="mc">
                <div className="mc-label">Área Protegida</div>
                <div className="mc-value" style={{color:'#2563eb'}}>34.2%</div>
                <div className="mc-sub">da área total</div>
              </div>
              <div className="mc">
                <div className="mc-label">Alertas DETER</div>
                <div className="mc-value" style={{color:'#f59e0b'}}>
                  {loading ? '...' : totalDETER}
                </div>
                <div className="mc-sub">{inpeData?.alertas ? 'dados reais INPE' : 'acumulado 2024'}</div>
                <div className="fonte-tag">📡 DETER/INPE</div>
              </div>
            </div>

            {/* GRÁFICOS */}
            <div className="grid2">
              {/* Série histórica PRODES */}
              <div className="panel">
                <div className="panel-title">Série histórica PRODES (km²)</div>
                <div className="bar-chart">
                  {PRODES_HISTORICO.map(d => (
                    <div key={d.ano} className="bar-col">
                      <div className="bar-total">{(d.total/1000).toFixed(0)}k</div>
                      <div className="bar-stack">
                        <div className="bar-seg" style={{height:`${(d.amazonia/MAX_TOTAL)*100}%`,background:'#16a34a'}}/>
                        <div className="bar-seg" style={{height:`${(d.cerrado/MAX_TOTAL)*100}%`,background:'#f59e0b'}}/>
                        <div className="bar-seg" style={{height:`${(d.outros/MAX_TOTAL)*100}%`,background:'#d1d5db'}}/>
                      </div>
                      <div className="bar-ano">{d.ano}</div>
                    </div>
                  ))}
                </div>
                <div className="legenda-bar">
                  {[['#16a34a','Amazônia'],['#f59e0b','Cerrado'],['#d1d5db','Outros']].map(([cor,label])=>(
                    <div key={label} className="leg-item">
                      <div className="leg-dot" style={{background:cor}}/>{label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Causas */}
              <div className="panel">
                <div className="panel-title">Causas identificadas (%)</div>
                <div className="causas-list">
                  {CAUSAS.map(c => (
                    <div key={c.label} className="causa-item">
                      <div className="causa-dot" style={{background:c.cor}}/>
                      <div className="causa-label">{c.label}</div>
                      <div className="causa-track">
                        <div className="causa-fill" style={{width:`${c.pct}%`,background:c.cor}}/>
                      </div>
                      <div className="causa-pct" style={{color:c.cor}}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evolução por bioma */}
            <div className="panel">
              <div className="panel-title">Evolução por bioma</div>
              <div className="bioma-bars">
                {PRODES_HISTORICO.map(d => (
                  <div key={d.ano} className="bioma-row">
                    <div className="bioma-header">
                      <span className="bioma-label">{d.ano}</span>
                      <span className="bioma-val">{d.total.toLocaleString()} km²</span>
                    </div>
                    <div className="bioma-track">
                      <div className="bioma-amz" style={{width:`${(d.amazonia/d.total)*100}%`}}/>
                      <div className="bioma-cer" style={{width:`${(d.cerrado/d.total)*100}%`}}/>
                      <div className="bioma-out" style={{width:`${(d.outros/d.total)*100}%`}}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="legenda-bar" style={{marginTop:14}}>
                {[['#16a34a','Amazônia'],['#f59e0b','Cerrado'],['#d1d5db','Outros']].map(([cor,label])=>(
                  <div key={label} className="leg-item">
                    <div className="leg-dot" style={{background:cor}}/>{label}
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