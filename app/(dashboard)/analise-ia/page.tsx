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

export default function AnaliseIAPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [imagem, setImagem] = useState<{url:string;base64:string;nome:string;tipo:string}|null>(null)
  const [drag, setDrag] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<string|null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('geoagri_user')
    if (!u) { window.location.href = '/login'; return }
    setUser(JSON.parse(u))
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setImagem({ url: result, base64: result.split(',')[1], nome: file.name, tipo: file.type })
      setResultado(null)
    }
    reader.readAsDataURL(file)
  }

  const analisar = async () => {
    if (!imagem) return
    setLoading(true)
    setResultado(null)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: imagem.tipo, data: imagem.base64 } },
              { type: 'text', text: `Você é um especialista em sensoriamento remoto e análise geoespacial agrícola. Analise esta imagem de satélite/drone e forneça:

1. **Tipo de uso do solo** — identifique vegetação, agricultura, área urbana, solo exposto, corpos d'água
2. **Saúde da vegetação** — estimativa de vigor (NDVI proxy) e cobertura verde
3. **Anomalias detectadas** — desmatamento, queimadas, erosão, inundação
4. **Estimativa de área** — proporções aproximadas de cada classe
5. **Recomendações** — ações sugeridas para o produtor rural
6. **Score ESG estimado** — impacto ambiental da área analisada (0-100)

Responda em português brasileiro de forma técnica mas clara.` }
            ]
          }]
        })
      })
      const data = await res.json()
      const txt = data.content?.find((b: any) => b.type === 'text')?.text || 'Erro na análise.'
      setResultado(txt)
    } catch {
      setResultado('Erro ao conectar com a IA. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }

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
        .content{flex:1;padding:20px 24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
        .panel{background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden}
        .panel-header{padding:14px 18px;border-bottom:1px solid #f3f4f6;font-size:13px;font-weight:700;color:#111}
        .drop-zone{margin:16px;border:2px dashed #d1fae5;border-radius:10px;padding:36px 16px;text-align:center;cursor:pointer;transition:all .15s;background:#f9fafb;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
        .drop-zone:hover,.drop-zone.drag{border-color:#16a34a;background:#f0fdf4}
        .drop-icon{font-size:40px}
        .drop-title{font-size:13px;font-weight:600;color:#374151}
        .drop-sub{font-size:11px;color:#9ca3af}
        .img-preview{margin:12px 16px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb}
        .img-preview img{width:100%;display:block;max-height:240px;object-fit:cover}
        .img-info{padding:10px 14px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:11px;color:#6b7280}
        .analisar-btn{margin:0 16px 16px;width:calc(100% - 32px);background:#16a34a;color:#fff;border:none;border-radius:8px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:8px}
        .analisar-btn:hover{background:#15803d}
        .analisar-btn:disabled{opacity:.5;cursor:not-allowed}
        .resultado-box{padding:18px;font-size:13px;line-height:1.7;color:#374151;white-space:pre-wrap}
        .empty-result{padding:48px 24px;text-align:center;color:#9ca3af}
        .empty-icon{font-size:40px;margin-bottom:12px}
        .loading-box{padding:48px 24px;text-align:center}
        .spinner{width:32px;height:32px;border:3px solid #e5e7eb;border-top-color:#16a34a;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px}
        @keyframes spin{to{transform:rotate(360deg)}}
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
                <div key={item.id} className={`sb-item${item.id==='analise-ia'?' active':''}`}
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
            <div className="topbar-title">Análise de Imagem com IA</div>
            <div className="topbar-right">
              <div className="status-pill"><span className="status-dot"/>Sistema Ativo</div>
              <div className="perfil-pill">Produtor Rural</div>
              <div style={{fontSize:11,color:'#9ca3af'}}>{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})}</div>
            </div>
          </div>

          <div className="content">
            {/* UPLOAD */}
            <div className="panel">
              <div className="panel-header">Análise de imagem com IA</div>
              {!imagem ? (
                <div
                  className={`drop-zone${drag?' drag':''}`}
                  onDragOver={e=>{e.preventDefault();setDrag(true)}}
                  onDragLeave={()=>setDrag(false)}
                  onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}}
                  onClick={()=>fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
                    onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f)}}/>
                  <div className="drop-icon">🛰️</div>
                  <div className="drop-title">Envie imagem da lavoura/área</div>
                  <div className="drop-sub">Drone · Satélite · Campo · JPG · PNG</div>
                </div>
              ) : (
                <>
                  <div className="img-preview">
                    <img src={imagem.url} alt="preview"/>
                  </div>
                  <div className="img-info">
                    📎 {imagem.nome} · Clique abaixo para analisar
                  </div>
                </>
              )}
              <button className="analisar-btn" onClick={imagem?analisar:()=>fileRef.current?.click()} disabled={loading}>
                {loading ? (
                  <><div style={{width:16,height:16,border:'2px solid rgba(255,255,255,.4)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 1s linear infinite'}}/> Analisando...</>
                ) : imagem ? '✦ Analisar com IA' : '📷 Selecionar imagem'}
              </button>
              {imagem && (
                <div style={{padding:'0 16px 16px',textAlign:'center'}}>
                  <button onClick={()=>{setImagem(null);setResultado(null)}}
                    style={{background:'none',border:'none',color:'#9ca3af',fontSize:12,cursor:'pointer',textDecoration:'underline'}}>
                    Trocar imagem
                  </button>
                </div>
              )}
            </div>

            {/* RESULTADO */}
            <div className="panel">
              <div className="panel-header">Resultado</div>
              {loading ? (
                <div className="loading-box">
                  <div className="spinner"/>
                  <div style={{fontSize:13,color:'#6b7280'}}>Analisando imagem com Claude AI...</div>
                  <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Identificando uso do solo, vegetação e anomalias</div>
                </div>
              ) : resultado ? (
                <div className="resultado-box">{resultado}</div>
              ) : (
                <div className="empty-result">
                  <div className="empty-icon">🔍</div>
                  <div style={{fontSize:13,fontWeight:600,color:'#374151',marginBottom:4}}>Envie uma imagem para análise</div>
                  <div style={{fontSize:12,color:'#9ca3af'}}>O Claude AI irá identificar uso do solo,<br/>vegetação, anomalias e gerar recomendações.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}