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

export default function MapaPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [camada, setCamada] = useState<'osm'|'satelite'|'hibrido'>('osm')
  const [alertas, setAlertas] = useState<any[]>([])
  const [camadas, setCamadas] = useState([
    { id: 'alertas_pa', label: 'Alerta PA', cor: '#ef4444', ativo: true },
    { id: 'alertas_mt', label: 'Alerta MT', cor: '#f59e0b', ativo: true },
    { id: 'alertas_ro', label: 'Alerta RO', cor: '#f59e0b', ativo: true },
    { id: 'area_prot', label: 'Área Prot. AM', cor: '#16a34a', ativo: true },
  ])
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))

    // Busca alertas reais para plotar no mapa
    fetch('/api/inpe')
      .then(r => r.json())
      .then(d => setAlertas(d.alertas || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!mounted || !mapRef.current) return
    const L = (window as any).L
    if (!L || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [-14.235, -51.925],
      zoom: 5,
      zoomControl: true,
    })

    const layers: Record<string, any> = {
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }),
      satelite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri', maxZoom: 19 }),
    }
    layers.osm.addTo(map)
    mapInstanceRef.current = { map, layers, current: 'osm' }
  }, [mounted])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    const { map, layers, current } = mapInstanceRef.current
    const L = (window as any).L
    if (!L) return

    if (layers[current]) map.removeLayer(layers[current])
    const nova = camada === 'hibrido' ? layers.satelite : layers[camada]
    if (nova) { nova.addTo(map); mapInstanceRef.current.current = camada }
  }, [camada])

  useEffect(() => {
    if (!mapInstanceRef.current || alertas.length === 0) return
    const { map } = mapInstanceRef.current
    const L = (window as any).L
    if (!L) return

    alertas.slice(0, 50).forEach(a => {
      if (!a.lat && !a.lng) return
      const cor = a.area > 500 ? '#ef4444' : a.area > 100 ? '#f59e0b' : '#3b82f6'
      const icon = L.divIcon({
        html: `<div style="width:10px;height:10px;border-radius:50%;background:${cor};border:2px solid white;box-shadow:0 0 4px ${cor}88"></div>`,
        iconSize: [10, 10], className: '',
      })
      L.marker([a.lat || -14, a.lng || -52], { icon })
        .addTo(map)
        .bindPopup(`<div style="font-family:system-ui;min-width:140px"><b style="color:${cor}">${a.tipo}</b><br><small>${a.municipio} · ${a.estado}</small><br><small>${a.area} ha · ${a.data}</small></div>`)
    })
  }, [alertas])

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
        .topbar-right{display:flex;align-items:center;gap:8px}
        .status-pill{display:flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #86efac;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;color:#16a34a}
        .status-dot{width:6px;height:6px;border-radius:50%;background:#16a34a;animation:blink 2s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        .perfil-pill{background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;color:#2563eb}
        .map-content{flex:1;display:flex;position:relative;overflow:hidden}
        #map{flex:1;z-index:1}
        .map-ctrl{position:absolute;top:12px;left:12px;z-index:1000;display:flex;gap:6px}
        .map-btn{background:#fff;border:1px solid #e5e7eb;border-radius:7px;padding:6px 12px;font-size:12px;font-weight:600;color:#374151;cursor:pointer;transition:all .15s;box-shadow:0 1px 4px rgba(0,0,0,.1)}
        .map-btn:hover{border-color:#16a34a;color:#16a34a}
        .map-btn.active{background:#16a34a;color:#fff;border-color:#16a34a}
        .map-panel{position:absolute;top:12px;right:12px;z-index:1000;width:180px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.1);overflow:hidden}
        .mp-section{padding:12px 14px;border-bottom:1px solid #f3f4f6}
        .mp-section:last-child{border-bottom:none}
        .mp-title{font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
        .mp-item{display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer}
        .mp-item:last-child{margin-bottom:0}
        .mp-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .mp-label{font-size:12px;color:#374151;flex:1}
        .mp-toggle{width:16px;height:16px;border-radius:3px;border:1px solid #d1d5db;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0}
        .mp-toggle.on{background:#16a34a;border-color:#16a34a;color:#fff}
        .leg-item{display:flex;align-items:center;gap:6px;margin-bottom:5px;font-size:11px;color:#374151}
        .leg-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
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
                <div key={item.id} className={`sb-item${item.id==='mapa'?' active':''}`}
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
            <div className="topbar-title">Mapa Interativo</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
              <button style={{background:'#f3f4f6',border:'1px solid #e5e7eb',borderRadius:6,padding:'5px 10px',fontSize:11,fontWeight:600,color:'#374151',cursor:'pointer'}}
                onClick={() => fileRef.current?.click()}>
                📤 Importar
              </button>
              <input ref={fileRef} type="file" accept=".kml,.kmz,.geojson,.json,.csv" style={{display:'none'}}/>
            </div>
          </div>

          <div className="map-content">
            <div id="map" ref={mapRef} style={{flex:1,minHeight:'calc(100vh - 52px)'}}/>

            {/* CONTROLE CAMADAS */}
            <div className="map-ctrl">
              {(['osm','satelite','hibrido'] as const).map(c => (
                <button key={c} className={`map-btn${camada===c?' active':''}`} onClick={() => setCamada(c)}>
                  {c==='osm'?'OSM':c==='satelite'?'Satélite':'Híbrido'}
                </button>
              ))}
            </div>

            {/* PAINEL CAMADAS + LEGENDA */}
            <div className="map-panel">
              <div className="mp-section">
                <div className="mp-title">Camadas</div>
                {camadas.map(c => (
                  <div key={c.id} className="mp-item"
                    onClick={() => setCamadas(prev => prev.map(x => x.id===c.id ? {...x,ativo:!x.ativo} : x))}>
                    <div className="mp-dot" style={{background:c.cor}}/>
                    <span className="mp-label">{c.label}</span>
                    <div className={`mp-toggle${c.ativo?' on':''}`}>{c.ativo?'✓':''}</div>
                  </div>
                ))}
              </div>
              <div className="mp-section">
                <div className="mp-title">Legenda</div>
                {[
                  ['#ef4444','Risco Alto'],
                  ['#f59e0b','Risco Médio'],
                  ['#3b82f6','Risco Baixo'],
                  ['#16a34a','Área Protegida'],
                ].map(([cor,label]) => (
                  <div key={label} className="leg-item">
                    <div className="leg-dot" style={{background:cor}}/>
                    {label}
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