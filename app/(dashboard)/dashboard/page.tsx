'use client'
import { useEffect, useState } from 'react'

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

const PRODES = [
  { ano:2019, val:11088 }, { ano:2020, val:11088 },
  { ano:2021, val:13235 }, { ano:2022, val:11568 },
  { ano:2023, val:11594 }, { ano:2024, val:10000 },
]
const MAX_P = 14000

const ESG = [
  { label:'Ambiental', val:64, cor:'#16a34a' },
  { label:'Social', val:68, cor:'#2563eb' },
  { label:'Governança', val:77, cor:'#ca8a04' },
]

const REGIOES = [
  { regiao:'Pará', desmat:'3.200 km²', bioma:'Amazônia', risco:'Alto', score:'56/100', tend:'▲ +8%' },
  { regiao:'Mato Grosso', desmat:'2.800 km²', bioma:'Cerrado', risco:'Alto', score:'61/100', tend:'▼ -3%' },
  { regiao:'Amazonas', desmat:'2.100 km²', bioma:'Amazônia', risco:'Médio', score:'70/100', tend:'— 0%' },
  { regiao:'Rondônia', desmat:'980 km²', bioma:'Amazônia', risco:'Médio', score:'65/100', tend:'▼ -5%' },
  { regiao:'Maranhão', desmat:'720 km²', bioma:'Cerrado', risco:'Baixo', score:'75/100', tend:'▼ -12%' },
]

export default function Dashboard() {
  const [inpeData, setInpeData] = useState<any>(null)
  const [loadingInpe, setLoadingInpe] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
    fetch('/api/inpe')
      .then(r => r.json())
      .then(d => { setInpeData(d); setLoadingInpe(false) })
      .catch(() => setLoadingInpe(false))
  }, [])

  if (!mounted) return null

  const regioes = inpeData?.alertas
    ? inpeData.alertas.slice(0, 5).map((a: any) => ({
        regiao: a.municipio || a.estado,
        desmat: `${a.area} ha`,
        bioma: a.bioma,
        risco: a.area > 500 ? 'Alto' : a.area > 100 ? 'Médio' : 'Baixo',
        score: '—', tend: '—',
      }))
    : REGIOES

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#f5f5f5;color:#111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}
        .layout{display:flex;min-height:100vh}
        .sidebar{width:200px;flex-shrink:0;background:#fff;border-right:1px solid #e5e7eb;display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:10;overflow-y:auto}
        .sb-brand{display:flex;align-items:center;gap:8px;padding:16px;border-bottom:1px solid #e5e7eb;position:sticky;top:0;background:#fff;cursor:pointer;text-decoration:none}
        .sb-logo{width:28px;height:28px;background:#16a34a;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#fff;font-weight:800}
        .sb-title{font-size:15px;font-weight:800;color:#16a34a}
        .sb-group{padding:10px 10px 4px}
        .sb-group-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;padding:0 6px;margin-bottom:4px}
        .sb-item{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:500;color:#6b7280;transition:all .15s;position:relative;text-decoration:none}
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
        .tb-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:5px 10px;font-size:11px;font-weight:600;color:#374151;cursor:pointer}
        .content{flex:1;padding:20px 24px}
        .aviso{background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:10px 14px;font-size:12px;color:#713f12;margin-bottom:16px;display:flex;align-items:center;gap:8px}
        .metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px}
        .mc{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px}
        .mc-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:8px}
        .mc-value{font-size:24px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
        .mc-sub{font-size:11px;color:#9ca3af}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px}
        .panel-title{font-size:13px;font-weight:700;color:#111;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #f3f4f6}
        .bar-chart{display:flex;align-items:flex-end;gap:8px;height:160px;padding-top:10px}
        .bar-col{display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;height:100%}
        .bar-fill{width:100%;background:#f87171;border-radius:4px 4px 0 0}
        .bar-label{font-size:10px;color:#9ca3af;white-space:nowrap}
        .bar-val{font-size:9px;color:#ef4444;font-weight:700}
        .esg-list{display:flex;flex-direction:column;gap:14px;padding-top:10px}
        .esg-item{display:flex;flex-direction:column;gap:5px}
        .esg-top{display:flex;justify-content:space-between;font-size:12px}
        .esg-track{height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden}
        .esg-fill{height:100%;border-radius:4px}
        .tabela-wrap{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .tabela-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        table{width:100%;border-collapse:collapse}
        th{padding:10px 18px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;background:#f9fafb;border-bottom:1px solid #f3f4f6}
        td{padding:11px 18px;font-size:12px;border-bottom:1px solid #f9fafb}
        tr:last-child td{border-bottom:none}
        tr:hover td{background:#f9fafb}
        .badge-risco{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}
        .badge-alto{background:#fee2e2;color:#ef4444}
        .badge-medio{background:#fef3c7;color:#f59e0b}
        .badge-baixo{background:#d1fae5;color:#16a34a}
      `}</style>

      <div className="layout">
        <div className="sidebar">
          <a href="/dashboard" className="sb-brand" style={{textDecoration:'none'}}>
            <div className="sb-logo">G</div>
            <div className="sb-title">GeoAgri</div>
          </a>
          {MENU.map(group => (
            <div key={group.group} className="sb-group">
              <div className="sb-group-label">{group.group}</div>
              {group.items.map(item => (
                <a key={item.id} href={item.href}
                  className={`sb-item${item.id==='dashboard'?' active':''}`}>
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </a>
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
            <div className="topbar-title">Dashboard</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
              <button className="tb-btn">📋 CSV</button>
              <button className="tb-btn">📄 PDF</button>
            </div>
          </div>

          <div className="content">
            <div className="aviso">
              <span>ℹ️</span>
              <span>{loadingInpe ? 'Conectando ao INPE/TerraBrasilis...' :
                inpeData?.alertas ? `✅ ${inpeData.total} alertas DETER carregados — Fonte: ${inpeData.fonte}` :
                'Dados INPE/PRODES — Em produção, conectar via terrabrasilis.dpi.inpe.br para dados reais em tempo real.'
              }</span>
            </div>

            <div className="metrics">
              {[
                ['Área Monitorada','42.3 Mha','#16a34a','Amazônia Legal'],
                ['Alertas DETER', loadingInpe?'...':String(inpeData?.total||'—'), '#ef4444', inpeData?.alertas?'dados reais INPE':'requerem ação'],
                ['Score ESG','68/100','#ca8a04','Categoria B+'],
                ['Créditos CO₂','1.240 t','#2563eb','Estimativa ano'],
                ['Conformidade','72%','#16a34a','Score legal'],
              ].map(([label,val,cor,sub]) => (
                <div key={String(label)} className="mc">
                  <div className="mc-label">{label}</div>
                  <div className="mc-value" style={{color:String(cor)}}>{val}</div>
                  <div className="mc-sub">{sub}</div>
                </div>
              ))}
            </div>

            <div className="grid2">
              <div className="panel">
                <div className="panel-title">Desmatamento anual (km²) — PRODES</div>
                <div className="bar-chart">
                  {PRODES.map(p => (
                    <div key={p.ano} className="bar-col">
                      <div className="bar-val">{(p.val/1000).toFixed(0)}k</div>
                      <div style={{flex:1,display:'flex',alignItems:'flex-end',width:'100%'}}>
                        <div className="bar-fill" style={{height:`${(p.val/MAX_P)*100}%`}}/>
                      </div>
                      <div className="bar-label">{p.ano}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">Distribuição ESG</div>
                <div className="esg-list">
                  {ESG.map(e => (
                    <div key={e.label} className="esg-item">
                      <div className="esg-top">
                        <span style={{color:'#6b7280'}}>{e.label}</span>
                        <span style={{fontWeight:700,color:e.cor}}>{e.val}</span>
                      </div>
                      <div className="esg-track">
                        <div className="esg-fill" style={{width:`${e.val}%`,background:e.cor}}/>
                      </div>
                    </div>
                  ))}
                  <div style={{textAlign:'center',marginTop:8}}>
                    <span style={{fontSize:28,fontWeight:800,color:'#111'}}>68</span>
                    <span style={{fontSize:12,color:'#9ca3af',marginLeft:4}}>/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="tabela-wrap">
              <div className="tabela-header">Regiões críticas — Alertas DETER</div>
              <table>
                <thead>
                  <tr>
                    <th>Região</th><th>Desmat.</th><th>Bioma</th>
                    <th>Risco</th><th>Score ESG</th><th>Tendência</th>
                  </tr>
                </thead>
                <tbody>
                  {regioes.map((r: any, i: number) => (
                    <tr key={i}>
                      <td style={{fontWeight:600}}>{r.regiao}</td>
                      <td style={{color:'#ef4444',fontWeight:600}}>{r.desmat}</td>
                      <td style={{color:'#6b7280'}}>{r.bioma}</td>
                      <td>
                        <span className={`badge-risco ${r.risco==='Alto'?'badge-alto':r.risco==='Médio'?'badge-medio':'badge-baixo'}`}>
                          {r.risco}
                        </span>
                      </td>
                      <td style={{color:'#374151'}}>{r.score}</td>
                      <td style={{color:r.tend?.includes('▲')?'#ef4444':r.tend?.includes('▼')?'#16a34a':'#6b7280',fontWeight:600}}>{r.tend}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}