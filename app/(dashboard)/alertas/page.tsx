'use client'
import { useState, useEffect, useMemo } from 'react'

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

function calcSev(area: number) {
  if (area > 500) return 'critico'
  if (area > 100) return 'atencao'
  return 'informativo'
}

export default function AlertasPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [selecionado, setSelecionado] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))

    fetch('/api/inpe')
      .then(r => r.json())
      .then(d => {
        if (d.erro) { setErro(d.erro); setLoading(false); return }
        setAlertas(d.alertas || [])
        setLoading(false)
      })
      .catch(() => { setErro('Erro ao conectar com INPE.'); setLoading(false) })
  }, [])

  const criticos = useMemo(() => alertas.filter(a => calcSev(a.area) === 'critico'), [alertas])
  const atencao = useMemo(() => alertas.filter(a => calcSev(a.area) === 'atencao'), [alertas])
  const informativos = useMemo(() => alertas.filter(a => calcSev(a.area) === 'informativo'), [alertas])

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
        .content{flex:1;padding:20px 24px}
        .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
        .sum-card{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:18px;border-left:4px solid}
        .sum-card.critico{border-left-color:#ef4444}
        .sum-card.atencao{border-left-color:#f59e0b}
        .sum-card.info{border-left-color:#3b82f6}
        .sum-num{font-size:32px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
        .sum-num.critico{color:#ef4444}
        .sum-num.atencao{color:#f59e0b}
        .sum-num.info{color:#3b82f6}
        .sum-label{font-size:13px;font-weight:600;color:#374151;margin-bottom:2px}
        .sum-sub{font-size:11px;color:#9ca3af}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:16px}
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;display:flex;align-items:center;justify-content:space-between}
        .panel-title{font-size:13px;font-weight:700;color:#111}
        .marcar-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#374151;cursor:pointer}
        .alerta-item{display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:background .15s}
        .alerta-item:last-child{border-bottom:none}
        .alerta-item:hover{background:#f9fafb}
        .alerta-item.selected{background:#f0fdf4}
        .al-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .al-dot.critico{background:#ef4444}
        .al-dot.atencao{background:#f59e0b}
        .al-dot.informativo{background:#3b82f6}
        .al-info{flex:1;min-width:0}
        .al-title{font-size:13px;font-weight:600;color:#111;margin-bottom:2px}
        .al-meta{font-size:11px;color:#6b7280}
        .al-badge{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap}
        .al-badge.critico{background:#fee2e2;color:#ef4444}
        .al-badge.atencao{background:#fef3c7;color:#f59e0b}
        .al-badge.informativo{background:#dbeafe;color:#3b82f6}
        .al-btn{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:#374151;cursor:pointer;white-space:nowrap}
        .loading-box{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px;gap:12px;color:#9ca3af}
        .spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#16a34a;border-radius:50%;animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .erro-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;color:#dc2626;font-size:13px;text-align:center}
        .retry-btn{margin-top:10px;background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;color:#dc2626;cursor:pointer}
        .fonte-tag{display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;border:1px solid #86efac;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:600;color:#16a34a}
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
                <div key={item.id} className={`sb-item${item.id==='alertas'?' active':''}`}
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
            <div className="topbar-title">Alertas em Tempo Real</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            {loading ? (
              <div className="loading-box">
                <div className="spinner"/>
                <div style={{fontSize:13}}>Buscando alertas em tempo real do INPE/TerraBrasilis...</div>
              </div>
            ) : erro ? (
              <div className="erro-box">
                ⚠️ {erro}
                <br/>
                <button className="retry-btn" onClick={() => window.location.reload()}>↺ Tentar novamente</button>
              </div>
            ) : (
              <>
                {/* SUMMARY */}
                <div className="summary">
                  <div className="sum-card critico">
                    <div className="sum-num critico">{criticos.length}</div>
                    <div className="sum-label">Críticos</div>
                    <div className="sum-sub">Ação imediata · área &gt; 500ha</div>
                  </div>
                  <div className="sum-card atencao">
                    <div className="sum-num atencao">{atencao.length}</div>
                    <div className="sum-label">Atenção</div>
                    <div className="sum-sub">Monitorar · área 100–500ha</div>
                  </div>
                  <div className="sum-card info">
                    <div className="sum-num info">{informativos.length}</div>
                    <div className="sum-label">Informativos</div>
                    <div className="sum-sub">Sem urgência · área &lt; 100ha</div>
                  </div>
                </div>

                {/* LISTA */}
                <div className="panel">
                  <div className="panel-header">
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className="panel-title">Alertas em tempo real</div>
                      <span className="fonte-tag">📡 DETER/INPE</span>
                      <span style={{fontSize:11,color:'#9ca3af'}}>{alertas.length} registros</span>
                    </div>
                    <button className="marcar-btn">Marcar todos lidos</button>
                  </div>

                  {alertas.length === 0 ? (
                    <div className="loading-box">
                      <div style={{fontSize:13,color:'#9ca3af'}}>Nenhum alerta encontrado.</div>
                    </div>
                  ) : alertas.map((a, i) => {
                    const sev = calcSev(a.area)
                    return (
                      <div key={i} className={`alerta-item${selecionado===i?' selected':''}`}
                        onClick={() => setSelecionado(selecionado===i?null:i)}>
                        <div className={`al-dot ${sev}`}/>
                        <div className="al-info">
                          <div className="al-title">
                            {a.tipo === 'DESMATAMENTO' ? '🌲' : a.tipo === 'DEGRADACAO' ? '⚠️' : '⛏️'} {a.tipo} — {a.area} ha
                          </div>
                          <div className="al-meta">
                            {a.municipio} · {a.estado} · {a.bioma} · {a.data}
                          </div>
                        </div>
                        <span className={`al-badge ${sev}`}>
                          {sev === 'critico' ? 'crítico' : sev === 'atencao' ? 'atenção' : 'info'}
                        </span>
                        <button className="al-btn" onClick={e => { e.stopPropagation(); window.location.href='/mapa' }}>
                          Ver mapa
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}