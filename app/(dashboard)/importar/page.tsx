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

const FORMATOS = [
  { ext: 'KML', desc: 'Google Earth', icon: '🗺️' },
  { ext: 'KMZ', desc: 'Google Earth comprimido', icon: '🗺️' },
  { ext: 'GeoJSON', desc: 'Formato GIS padrão', icon: '📐' },
  { ext: 'SHP', desc: 'Shapefile (ZIP)', icon: '📦' },
  { ext: 'CSV', desc: 'Planilha com coordenadas', icon: '📊' },
  { ext: 'XLSX', desc: 'Excel com dados', icon: '📗' },
  { ext: 'GPX', desc: 'GPS Exchange', icon: '📍' },
]

type Arquivo = { nome: string; tipo: string; tamanho: string; status: 'ok' | 'erro' | 'processando'; preview?: any[] }

export default function ImportarPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [drag, setDrag] = useState(false)
  const [arquivos, setArquivos] = useState<Arquivo[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

  const processarArquivo = (file: File) => {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'OUTRO'
    const tamanho = file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size/1024).toFixed(1)} KB` : `${(file.size/1048576).toFixed(1)} MB`
    const novo: Arquivo = { nome: file.name, tipo: ext, tamanho, status: 'processando' }
    setArquivos(prev => [...prev, novo])

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      try {
        if (ext === 'CSV') {
          const lines = content.split('\n').filter(l => l.trim())
          const headers = lines[0].split(',').map(h => h.trim())
          const rows = lines.slice(1, 6).map(l => {
            const cols = l.split(',')
            return Object.fromEntries(headers.map((h, i) => [h, cols[i]?.trim() || '']))
          })
          setArquivos(prev => prev.map(a => a.nome === file.name ? { ...a, status: 'ok', preview: rows } : a))
        } else if (ext === 'GEOJSON' || ext === 'JSON') {
          const data = JSON.parse(content)
          const features = (data.features || []).slice(0, 5).map((f: any, i: number) => ({
            '#': i + 1,
            Tipo: f.geometry?.type || '—',
            Propriedades: Object.keys(f.properties || {}).slice(0, 3).join(', ') || '—'
          }))
          setArquivos(prev => prev.map(a => a.nome === file.name ? { ...a, status: 'ok', preview: features } : a))
        } else {
          setArquivos(prev => prev.map(a => a.nome === file.name ? { ...a, status: 'ok' } : a))
        }
      } catch {
        setArquivos(prev => prev.map(a => a.nome === file.name ? { ...a, status: 'erro' } : a))
      }
    }
    reader.onerror = () => setArquivos(prev => prev.map(a => a.nome === file.name ? { ...a, status: 'erro' } : a))

    if (ext === 'CSV' || ext === 'GEOJSON' || ext === 'JSON' || ext === 'KML') {
      reader.readAsText(file)
    } else {
      setTimeout(() => setArquivos(prev => prev.map(a => a.nome === file.name ? { ...a, status: 'ok' } : a)), 800)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    Array.from(e.dataTransfer.files).forEach(processarArquivo)
  }

  const remover = (nome: string) => setArquivos(prev => prev.filter(a => a.nome !== nome))

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
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        .drop-zone{margin:16px;border:2px dashed #d1fae5;border-radius:10px;padding:36px 24px;text-align:center;cursor:pointer;transition:all .15s;background:#f9fafb}
        .drop-zone:hover,.drop-zone.drag{border-color:#16a34a;background:#f0fdf4}
        .drop-icon{font-size:36px;margin-bottom:12px}
        .drop-title{font-size:14px;font-weight:600;color:#374151;margin-bottom:4px}
        .drop-sub{font-size:12px;color:#9ca3af;margin-bottom:14px}
        .fmt-pills{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
        .fmt-pill{background:#f3f4f6;border:1px solid #e5e7eb;border-radius:5px;padding:3px 8px;font-size:11px;font-weight:600;color:#374151}
        .formatos-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;padding:16px}
        .fmt-card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 8px;text-align:center}
        .fmt-card-icon{font-size:20px;margin-bottom:6px}
        .fmt-card-ext{font-size:11px;font-weight:700;color:#374151;margin-bottom:2px}
        .fmt-card-desc{font-size:9px;color:#9ca3af}
        .arquivo-item{display:flex;align-items:flex-start;gap:12px;padding:13px 18px;border-bottom:1px solid #f9fafb}
        .arquivo-item:last-child{border-bottom:none}
        .arq-icon{width:36px;height:36px;border-radius:8px;background:#f0fdf4;border:1px solid #86efac;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
        .arq-info{flex:1;min-width:0}
        .arq-nome{font-size:13px;font-weight:600;color:#111;margin-bottom:2px}
        .arq-meta{font-size:11px;color:#9ca3af;margin-bottom:6px}
        .arq-status{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700}
        .arq-status.ok{background:#d1fae5;color:#16a34a}
        .arq-status.erro{background:#fee2e2;color:#ef4444}
        .arq-status.processando{background:#fef3c7;color:#f59e0b}
        .preview-table{width:100%;border-collapse:collapse;margin-top:8px;font-size:11px}
        .preview-table th{background:#f3f4f6;padding:5px 8px;text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb}
        .preview-table td{padding:5px 8px;border-bottom:1px solid #f9fafb;color:#374151}
        .del-btn{background:none;border:none;cursor:pointer;color:#9ca3af;font-size:16px;padding:4px;transition:color .15s;flex-shrink:0}
        .del-btn:hover{color:#ef4444}
        .mapa-btn{background:#16a34a;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;margin-top:6px}
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
                <div key={item.id} className={`sb-item${item.id==='importar'?' active':''}`}
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
            <div className="topbar-title">Importar Dados</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            <div className="panel">
              <div className="panel-header">Importar arquivos geoespaciais e tabulares</div>
              <div
                className={`drop-zone${drag?' drag':''}`}
                onDragOver={e=>{e.preventDefault();setDrag(true)}}
                onDragLeave={()=>setDrag(false)}
                onDrop={onDrop}
                onClick={()=>fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" multiple
                  accept=".kml,.kmz,.geojson,.json,.shp,.zip,.csv,.xlsx,.xls,.gpx,.dxf,.gml"
                  style={{display:'none'}}
                  onChange={e=>Array.from(e.target.files||[]).forEach(processarArquivo)}
                />
                <div className="drop-icon">📁</div>
                <div className="drop-title">Arraste ou clique para importar</div>
                <div className="drop-sub">KML · KMZ · GeoJSON · SHF · CSV · XLSX · GPX</div>
                <div className="fmt-pills">
                  {['KML','KMZ','GeoJSON','SHF','CSV','XLSX','GPX'].map(f=>(
                    <span key={f} className="fmt-pill">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">Formatos suportados</div>
              <div className="formatos-grid">
                {FORMATOS.map(f=>(
                  <div key={f.ext} className="fmt-card">
                    <div className="fmt-card-icon">{f.icon}</div>
                    <div className="fmt-card-ext">{f.ext}</div>
                    <div className="fmt-card-desc">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {arquivos.length > 0 && (
              <div className="panel">
                <div className="panel-header">Arquivos importados ({arquivos.length})</div>
                {arquivos.map((a,i)=>(
                  <div key={i} className="arquivo-item">
                    <div className="arq-icon">
                      {a.tipo==='CSV'||a.tipo==='XLSX'?'📊':a.tipo==='KML'||a.tipo==='KMZ'?'🗺️':a.tipo==='GEOJSON'||a.tipo==='JSON'?'📐':'📦'}
                    </div>
                    <div className="arq-info">
                      <div className="arq-nome">{a.nome}</div>
                      <div className="arq-meta">{a.tipo} · {a.tamanho}</div>
                      <span className={`arq-status ${a.status}`}>
                        {a.status==='ok'?'✅ Importado com sucesso':a.status==='erro'?'❌ Erro ao processar':'⏳ Processando...'}
                      </span>
                      {a.preview && a.preview.length > 0 && (
                        <table className="preview-table">
                          <thead>
                            <tr>{Object.keys(a.preview[0]).map(k=><th key={k}>{k}</th>)}</tr>
                          </thead>
                          <tbody>
                            {a.preview.map((row,ri)=>(
                              <tr key={ri}>{Object.values(row).map((v,vi)=><td key={vi}>{String(v)}</td>)}</tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      {a.status==='ok' && (
                        <button className="mapa-btn" onClick={()=>window.location.href='/mapa'}>
                          🗺️ Visualizar no Mapa
                        </button>
                      )}
                    </div>
                    <button className="del-btn" onClick={()=>remover(a.nome)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}