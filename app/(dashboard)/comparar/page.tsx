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

const FAZENDAS = [
  {
    nome: 'Fazenda Modelo', area: 5000, uf: 'MT', ref: true,
    esg: 68, ambiental: 64, social: 68, governanca: 71,
    desmat: 2800, carbono: 1240, legal: 70,
  },
  {
    nome: 'Agrícola Novo Horizonte', area: 3200, uf: 'PA', ref: false,
    esg: 54, ambiental: 52, social: 58, governanca: 62,
    desmat: 4100, carbono: 820, legal: 48,
  },
  {
    nome: 'Fazenda São Lucas', area: 7800, uf: 'GO', ref: false,
    esg: 79, ambiental: 82, social: 76, governanca: 80,
    desmat: 960, carbono: 2500, legal: 88,
  },
]

const AXES = ['Ambiental','Social','Governança','Demat.','Legal']
const COLORS = ['#16a34a','#ef4444','#2563eb']

function radarPoints(values: number[], cx: number, cy: number, r: number) {
  return values.map((v, i) => {
    const angle = (i / values.length) * Math.PI * 2 - Math.PI / 2
    const rv = (v / 100) * r
    return [cx + Math.cos(angle) * rv, cy + Math.sin(angle) * rv]
  })
}

export default function CompararPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

  if (!mounted) return null

  const cx = 180, cy = 140, r = 110

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
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        .comp-grid{display:grid;gap:0}
        .comp-row{display:grid;grid-template-columns:160px repeat(3,1fr);border-bottom:1px solid #f9fafb}
        .comp-row:last-child{border-bottom:none}
        .comp-row.header{background:#f9fafb;border-bottom:1px solid #f3f4f6}
        .comp-cell{padding:11px 16px;font-size:12px;display:flex;align-items:center}
        .comp-cell.label{color:#6b7280;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.4px}
        .comp-cell.ref-card{background:#f0fdf4;border-right:1px solid #e5e7eb}
        .ref-badge{background:#16a34a;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:3px;margin-left:6px}
        .comp-val{font-weight:700;font-size:13px}
        .radar-wrap{display:flex;align-items:center;justify-content:center;gap:32px;padding:20px}
        .radar-legend{display:flex;flex-direction:column;gap:10px}
        .rl-item{display:flex;align-items:center;gap:8px;font-size:12px}
        .rl-dot{width:12px;height:12px;border-radius:2px;flex-shrink:0}
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
                <div key={item.id} className={`sb-item${item.id==='comparar'?' active':''}`}
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
            <div className="topbar-title">Comparar Fazendas</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            {/* TABELA COMPARATIVA */}
            <div className="panel">
              <div className="panel-header">Comparativo de propriedades</div>
              <div className="comp-grid">
                {/* Header */}
                <div className="comp-row header">
                  <div className="comp-cell label"/>
                  {FAZENDAS.map((f,i) => (
                    <div key={f.nome} className={`comp-cell${f.ref?' ref-card':''}`} style={{fontWeight:700,fontSize:12}}>
                      {f.nome}
                      {f.ref && <span className="ref-badge">Referência</span>}
                      <div style={{fontSize:10,color:'#9ca3af',fontWeight:400,marginTop:2}}>{f.area.toLocaleString()} ha · {f.uf}</div>
                    </div>
                  ))}
                </div>

                {[
                  ['Score ESG', FAZENDAS.map(f=>f.esg), (v:number)=>v>=70?'#16a34a':v>=55?'#f59e0b':'#ef4444'],
                  ['Ambiental', FAZENDAS.map(f=>f.ambiental), (v:number)=>v>=70?'#16a34a':v>=55?'#f59e0b':'#ef4444'],
                  ['Social', FAZENDAS.map(f=>f.social), (v:number)=>v>=70?'#16a34a':v>=55?'#f59e0b':'#ef4444'],
                  ['Governança', FAZENDAS.map(f=>f.governanca), (v:number)=>v>=70?'#16a34a':v>=55?'#f59e0b':'#ef4444'],
                  ['Desmat. (ha)', FAZENDAS.map(f=>f.desmat), (v:number)=>v<1500?'#16a34a':v<3000?'#f59e0b':'#ef4444'],
                  ['Carbono (t)', FAZENDAS.map(f=>f.carbono), (v:number)=>v>=2000?'#16a34a':v>=1000?'#f59e0b':'#ef4444'],
                  ['Conformidade', FAZENDAS.map(f=>f.legal), (v:number)=>v>=70?'#16a34a':v>=50?'#f59e0b':'#ef4444'],
                ].map(([label, vals, colorFn]) => (
                  <div key={String(label)} className="comp-row">
                    <div className="comp-cell label">{label}</div>
                    {(vals as number[]).map((v,i) => (
                      <div key={i} className={`comp-cell${FAZENDAS[i].ref?' ref-card':''}`}>
                        <span className="comp-val" style={{color:(colorFn as Function)(v)}}>{v}{String(label).includes('ha')||String(label).includes('t')?'':'/100'}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* RADAR */}
            <div className="panel">
              <div className="panel-header">Radar comparativo</div>
              <div className="radar-wrap">
                <svg width={cx*2} height={cy*2} viewBox={`0 0 ${cx*2} ${cy*2}`}>
                  {/* Grid circles */}
                  {[0.25,0.5,0.75,1].map(s => (
                    <polygon key={s} fill="none" stroke="#f3f4f6" strokeWidth="1"
                      points={radarPoints([100,100,100,100,100],cx,cy,r*s).map(p=>p.join(',')).join(' ')}/>
                  ))}
                  {/* Axes */}
                  {AXES.map((_,i) => {
                    const angle = (i/AXES.length)*Math.PI*2 - Math.PI/2
                    return <line key={i} x1={cx} y1={cy} x2={cx+Math.cos(angle)*r} y2={cy+Math.sin(angle)*r} stroke="#e5e7eb" strokeWidth="1"/>
                  })}
                  {/* Labels */}
                  {AXES.map((label,i) => {
                    const angle = (i/AXES.length)*Math.PI*2 - Math.PI/2
                    const x = cx + Math.cos(angle)*(r+18)
                    const y = cy + Math.sin(angle)*(r+18)
                    return <text key={i} x={x} y={y+4} fontSize="10" fill="#6b7280" textAnchor="middle">{label}</text>
                  })}
                  {/* Fazendas */}
                  {FAZENDAS.map((f,fi) => {
                    const vals = [f.ambiental, f.social, f.governanca, Math.max(0,100-f.desmat/50), f.legal]
                    const pts = radarPoints(vals, cx, cy, r)
                    return (
                      <polygon key={f.nome}
                        points={pts.map(p=>p.join(',')).join(' ')}
                        fill={COLORS[fi]+'22'} stroke={COLORS[fi]} strokeWidth="1.5"/>
                    )
                  })}
                </svg>
                <div className="radar-legend">
                  {FAZENDAS.map((f,i) => (
                    <div key={f.nome} className="rl-item">
                      <div className="rl-dot" style={{background:COLORS[i]}}/>
                      <div>
                        <div style={{fontWeight:600,color:'#374151'}}>{f.nome}</div>
                        <div style={{fontSize:10,color:'#9ca3af'}}>{f.area.toLocaleString()} ha · ESG {f.esg}/100</div>
                      </div>
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