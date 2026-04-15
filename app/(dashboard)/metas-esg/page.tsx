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

const METAS_AMBIENTAIS = [
  { label: 'Reduzir desmatamento', meta: '10% ha', atual: 72, cor: '#16a34a' },
  { label: 'Aumentar cobertura nativa', meta: '10% da área', atual: 58, cor: '#16a34a' },
  { label: 'Reduzir emissão CO₂', meta: 'vs. 2020', atual: 45, cor: '#16a34a' },
  { label: 'Certificação ambiental', meta: 'até 1985', atual: 30, cor: '#f59e0b' },
]

const METAS_SOCIAIS = [
  { label: 'Empregos diretos', meta: '120 vagas', atual: 85, cor: '#2563eb' },
  { label: 'Treinamentos/ano', meta: '8 colaboradores', atual: 60, cor: '#8b5cf6' },
  { label: 'Governança corporativa', meta: 'Score 80+', atual: 77, cor: '#f59e0b' },
  { label: 'Rastreabilidade cadeia', meta: '100% lotes', atual: 98, cor: '#16a34a' },
]

// Score ESG projetado 2022-2028
const SCORE_PROJECAO = [
  { ano: 2022, meta: 65, real: 62 },
  { ano: 2023, meta: 68, real: 66 },
  { ano: 2024, meta: 72, real: 68 },
  { ano: 2025, meta: 76, real: null },
  { ano: 2026, meta: 80, real: null },
  { ano: 2027, meta: 84, real: null },
  { ano: 2028, meta: 88, real: null },
]

const W = 560
const H = 120
const PAD = { l: 30, r: 10, t: 10, b: 20 }
const xScale = (i: number) => PAD.l + i * ((W - PAD.l - PAD.r) / (SCORE_PROJECAO.length - 1))
const yScale = (v: number) => H - PAD.b - ((v - 55) / 40) * (H - PAD.t - PAD.b)

export default function MetasESGPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

  if (!mounted) return null

  const metaPoints = SCORE_PROJECAO.map((d, i) => `${xScale(i)},${yScale(d.meta)}`).join(' ')
  const realPoints = SCORE_PROJECAO.filter(d => d.real !== null).map((d, i) => `${xScale(i)},${yScale(d.real!)}`).join(' ')

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
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px}
        .panel-title{font-size:13px;font-weight:700;color:#111;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f3f4f6}
        .meta-list{display:flex;flex-direction:column;gap:14px}
        .meta-item{display:flex;flex-direction:column;gap:5px}
        .meta-top{display:flex;justify-content:space-between;align-items:baseline}
        .meta-label{font-size:13px;font-weight:500;color:#374151}
        .meta-sub{font-size:10px;color:#9ca3af}
        .meta-pct{font-size:13px;font-weight:700}
        .meta-track{height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}
        .meta-fill{height:100%;border-radius:4px;transition:width .3s}
        .linha-chart{width:100%;overflow:visible}
        .x-labels{display:flex;justify-content:space-between;margin-top:4px}
        .x-label{font-size:9px;color:#9ca3af;text-align:center}
        .legenda{display:flex;gap:16px;margin-top:8px}
        .leg-item{display:flex;align-items:center;gap:6px;font-size:11px;color:#6b7280}
        .leg-line{width:20px;height:2px;flex-shrink:0}
        .leg-dash{width:20px;height:2px;flex-shrink:0;background-image:repeating-linear-gradient(90deg,#9ca3af 0,#9ca3af 4px,transparent 4px,transparent 8px)}
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
                <div key={item.id} className={`sb-item${item.id==='metas-esg'?' active':''}`}
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
            <div className="topbar-title">Metas ESG</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            <div className="grid2">
              <div className="panel">
                <div className="panel-title">Metas ambientais</div>
                <div className="meta-list">
                  {METAS_AMBIENTAIS.map(m => (
                    <div key={m.label} className="meta-item">
                      <div className="meta-top">
                        <div>
                          <div className="meta-label">{m.label}</div>
                          <div className="meta-sub">{m.meta}</div>
                        </div>
                        <div className="meta-pct" style={{color:m.cor}}>{m.atual}%</div>
                      </div>
                      <div className="meta-track">
                        <div className="meta-fill" style={{width:`${m.atual}%`,background:m.cor}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">Metas sociais & governança</div>
                <div className="meta-list">
                  {METAS_SOCIAIS.map(m => (
                    <div key={m.label} className="meta-item">
                      <div className="meta-top">
                        <div>
                          <div className="meta-label">{m.label}</div>
                          <div className="meta-sub">{m.meta}</div>
                        </div>
                        <div className="meta-pct" style={{color:m.cor}}>{m.atual}%</div>
                      </div>
                      <div className="meta-track">
                        <div className="meta-fill" style={{width:`${m.atual}%`,background:m.cor}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">Score ESG — meta vs. realizado</div>
              <svg viewBox={`0 0 ${W} ${H}`} className="linha-chart">
                {/* Grid */}
                {[60,70,80,90].map(v => (
                  <g key={v}>
                    <line x1={PAD.l} y1={yScale(v)} x2={W-PAD.r} y2={yScale(v)} stroke="#f3f4f6" strokeWidth="1"/>
                    <text x={PAD.l-4} y={yScale(v)+4} fontSize="9" fill="#9ca3af" textAnchor="end">{v}</text>
                  </g>
                ))}
                {/* Meta (tracejada) */}
                <polyline fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 3" points={metaPoints}/>
                {/* Real */}
                <polyline fill="none" stroke="#16a34a" strokeWidth="2" points={realPoints}/>
                {/* Pontos reais */}
                {SCORE_PROJECAO.filter(d => d.real !== null).map((d, i) => (
                  <circle key={i} cx={xScale(i)} cy={yScale(d.real!)} r="3" fill="#16a34a"/>
                ))}
                {/* Ponto atual destacado */}
                <circle cx={xScale(2)} cy={yScale(68)} r="5" fill="#16a34a" stroke="#fff" strokeWidth="2"/>
                <text x={xScale(2)} y={yScale(68)-10} fontSize="10" fill="#16a34a" textAnchor="middle" fontWeight="bold">68</text>
              </svg>
              <div className="x-labels">
                {SCORE_PROJECAO.map(d => <div key={d.ano} className="x-label">{d.ano}</div>)}
              </div>
              <div className="legenda">
                <div className="leg-item"><div className="leg-dash"/>Meta</div>
                <div className="leg-item"><div className="leg-line" style={{background:'#16a34a'}}/>Realizado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}