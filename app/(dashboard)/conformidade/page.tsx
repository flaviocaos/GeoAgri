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

type Status = 'ok' | 'pendente' | 'irregular' | 'urgente'

const CAR_AMBIENTAL: {titulo:string;numero?:string;status:Status;detalhe:string}[] = [
  { titulo:'CAR registrado', numero:'MT-1234-2019', status:'ok', detalhe:'53% da área' },
  { titulo:'Reserva Legal averbada', status:'pendente', detalhe:'Déficit de 12% de área' },
  { titulo:'APP delimitada', status:'irregular', detalhe:'Área conflitante identificada' },
  { titulo:'IBAMA — sem embargo', status:'ok', detalhe:'Consulta OK' },
  { titulo:'Licença SEMA MT', status:'pendente', detalhe:'Renovação vence 01/2025' },
]

const LEGISLACAO: {titulo:string;orgao:string;status:Status;detalhe:string}[] = [
  { titulo:'Nota Fiscal Produtor', orgao:'Em dia', status:'ok', detalhe:'' },
  { titulo:'ITR — exercício 2024', orgao:'Pago', status:'ok', detalhe:'' },
  { titulo:'Certificação Soja Plus', orgao:'Auditoria agendada', status:'pendente', detalhe:'' },
  { titulo:'RTID Regularização', orgao:'Prazo vencido — urgente', status:'urgente', detalhe:'' },
  { titulo:'SISBOV rastreabilidade', orgao:'60% do rebanho ativo', status:'pendente', detalhe:'' },
]

const STATUS_CONFIG: Record<Status, {cor:string;bg:string;label:string;icon:string}> = {
  ok:       { cor:'#16a34a', bg:'#d1fae5', label:'Regular',  icon:'✅' },
  pendente: { cor:'#f59e0b', bg:'#fef3c7', label:'Pendente', icon:'⚠️' },
  irregular:{ cor:'#ef4444', bg:'#fee2e2', label:'Irregular',icon:'❌' },
  urgente:  { cor:'#dc2626', bg:'#fef2f2', label:'Urgente',  icon:'🚨' },
}

export default function ConformidadePage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  const conformes  = [...CAR_AMBIENTAL, ...LEGISLACAO].filter(i => i.status === 'ok').length
  const pendentes  = [...CAR_AMBIENTAL, ...LEGISLACAO].filter(i => i.status === 'pendente').length
  const irregulares= [...CAR_AMBIENTAL, ...LEGISLACAO].filter(i => i.status === 'irregular' || i.status === 'urgente').length
  const total      = CAR_AMBIENTAL.length + LEGISLACAO.length
  const score      = Math.round((conformes / total) * 100)

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
        .mc{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:16px;border-left:4px solid}
        .mc-label{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#9ca3af;margin-bottom:8px}
        .mc-value{font-size:28px;font-weight:800;letter-spacing:-1px;margin-bottom:4px}
        .mc-sub{font-size:11px;color:#9ca3af}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        .conf-item{display:flex;align-items:flex-start;gap:12px;padding:12px 18px;border-bottom:1px solid #f9fafb;cursor:pointer;transition:background .15s}
        .conf-item:last-child{border-bottom:none}
        .conf-item:hover{background:#f9fafb}
        .conf-icon{width:32px;height:32px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
        .conf-info{flex:1}
        .conf-titulo{font-size:13px;font-weight:600;color:#111;margin-bottom:2px}
        .conf-detalhe{font-size:11px;color:#6b7280}
        .conf-badge{padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;white-space:nowrap;flex-shrink:0;align-self:center}
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
                <div key={item.id} className={`sb-item${item.id==='conformidade'?' active':''}`}
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
            <div className="topbar-title">Conformidade Legal</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            <div className="metrics">
              {[
                ['Conformes', conformes, '#16a34a', '#16a34a', 'Regulares'],
                ['Pendentes', pendentes, '#f59e0b', '#f59e0b', 'Requerem ação'],
                ['Irregulares', irregulares, '#ef4444', '#ef4444', 'Urgente'],
                ['Score Legal', `${score}%`, '#2563eb', '#2563eb', 'conformidade'],
              ].map(([label,val,cor,border,sub]) => (
                <div key={String(label)} className="mc" style={{borderLeftColor:String(border)}}>
                  <div className="mc-label">{label}</div>
                  <div className="mc-value" style={{color:String(cor)}}>{val}</div>
                  <div className="mc-sub">{sub}</div>
                </div>
              ))}
            </div>

            <div className="grid2">
              <div className="panel">
                <div className="panel-header">CAR & Ambiental</div>
                {CAR_AMBIENTAL.map((item, i) => {
                  const cfg = STATUS_CONFIG[item.status]
                  return (
                    <div key={i} className="conf-item">
                      <div className="conf-icon" style={{background:cfg.bg}}>{cfg.icon}</div>
                      <div className="conf-info">
                        <div className="conf-titulo">{item.titulo}</div>
                        <div className="conf-detalhe">{item.numero || item.detalhe}</div>
                      </div>
                      <span className="conf-badge" style={{background:cfg.bg,color:cfg.cor}}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>

              <div className="panel">
                <div className="panel-header">Legislação & Certificações</div>
                {LEGISLACAO.map((item, i) => {
                  const cfg = STATUS_CONFIG[item.status]
                  return (
                    <div key={i} className="conf-item">
                      <div className="conf-icon" style={{background:cfg.bg}}>{cfg.icon}</div>
                      <div className="conf-info">
                        <div className="conf-titulo">{item.titulo}</div>
                        <div className="conf-detalhe">{item.orgao}</div>
                      </div>
                      <span className="conf-badge" style={{background:cfg.bg,color:cfg.cor}}>{cfg.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}