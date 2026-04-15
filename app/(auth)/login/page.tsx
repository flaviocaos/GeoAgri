'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PROFILES = [
  { id: 'produtor',  label: 'Produtor',   icon: '👨‍🌾' },
  { id: 'agronomo',  label: 'Agrônomo',   icon: '🌿'  },
  { id: 'banco',     label: 'Banco/Inv.', icon: '🏦'  },
  { id: 'regulador', label: 'Regulador',  icon: '⚖️'  },
]

// Usuários locais para teste (sem Supabase)
const USERS = [
  { email: 'admin@geoagri.com', password: 'geoagri123' },
  { email: 'geoagri',           password: '123'         },
]

export default function LoginPage() {
  const router   = useRouter()
  const [profile,  setProfile]  = useState('produtor')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Login local para desenvolvimento
    await new Promise(r => setTimeout(r, 600))
    const user = USERS.find(u => u.email === email && u.password === password)
    if (user) {
      localStorage.setItem('geoagri_user', JSON.stringify({ email, profile }))
      router.push('/dashboard')
    } else {
      setError('Email ou senha incorretos.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lr {
          min-height: 100vh; display: flex;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background: #07100a; color: #fff;
        }
        .lr-left {
          flex: 1; min-width: 0; display: flex; flex-direction: column;
          padding: 48px 56px 180px 56px; position: relative; overflow: hidden;
          background:
            radial-gradient(ellipse 90% 70% at 10% 60%, rgba(21,128,61,.45) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 20%, rgba(6,60,20,.5) 0%, transparent 55%),
            #07100a;
        }
        .lr-left::after {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(74,222,128,.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(74,222,128,.035) 1px, transparent 1px);
          background-size: 52px 52px; pointer-events: none;
        }
        .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 72px; position: relative; z-index: 1; }
        .brand-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #15803d, #4ade80); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .brand-name { font-size: 20px; font-weight: 800; letter-spacing: -.4px; }
        .brand-name b { color: #4ade80; font-weight: 800; }
        .hero { position: relative; z-index: 1; max-width: 480px; }
        .badge { display: inline-flex; align-items: center; gap: 7px; border: 1px solid rgba(74,222,128,.28); background: rgba(74,222,128,.07); border-radius: 20px; padding: 5px 14px; font-size: 11px; font-weight: 600; color: #4ade80; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 26px; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; }
        .hero-h1 { font-size: 46px; font-weight: 800; line-height: 1.08; letter-spacing: -2px; margin-bottom: 20px; }
        .hero-h1 em { font-style: normal; color: #4ade80; }
        .hero-p { font-size: 15px; color: rgba(255,255,255,.48); line-height: 1.75; margin-bottom: 44px; max-width: 400px; }
        .feats { display: flex; flex-direction: column; gap: 15px; }
        .feat { display: flex; align-items: flex-start; gap: 13px; }
        .feat-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ade80; margin-top: 7px; flex-shrink: 0; }
        .feat-text { font-size: 13.5px; color: rgba(255,255,255,.52); line-height: 1.5; }
        .feat-text strong { color: rgba(255,255,255,.9); font-weight: 600; }
        .mini-map { position: absolute; bottom: 36px; left: 56px; right: 56px; height: 118px; border: 1px solid rgba(74,222,128,.12); border-radius: 12px; background: rgba(5,18,10,.8); overflow: hidden; z-index: 1; }
        .mini-map-label { position: absolute; top: 9px; left: 13px; font-size: 10px; font-weight: 700; letter-spacing: .9px; color: rgba(74,222,128,.7); text-transform: uppercase; z-index: 2; }
        .pulse-dot { position: absolute; width: 9px; height: 9px; border-radius: 50%; background: #4ade80; z-index: 2; animation: pdot 2.2s ease-in-out infinite; }
        @keyframes pdot { 0%,100% { box-shadow: 0 0 0 0 rgba(74,222,128,.6); } 50% { box-shadow: 0 0 0 10px rgba(74,222,128,.0); } }
        .lr-div { width: 1px; flex-shrink: 0; background: linear-gradient(to bottom, transparent 0%, rgba(74,222,128,.14) 20%, rgba(74,222,128,.14) 80%, transparent 100%); }
        .lr-right { width: 460px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 48px; background: rgba(4,10,5,.55); backdrop-filter: blur(28px); border-left: 1px solid rgba(74,222,128,.07); }
        .form-box { width: 100%; max-width: 340px; }
        .fh-eyebrow { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.6px; color: #4ade80; margin-bottom: 9px; }
        .fh-title { font-size: 27px; font-weight: 800; letter-spacing: -.7px; margin-bottom: 5px; }
        .fh-sub { font-size: 13px; color: rgba(255,255,255,.36); margin-bottom: 34px; }
        .pfl-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: rgba(255,255,255,.32); margin-bottom: 10px; }
        .pfl-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 28px; }
        .pfl-btn { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 11px 4px 9px; cursor: pointer; text-align: center; transition: border-color .15s, background .15s; color: rgba(255,255,255,.42); font-family: inherit; }
        .pfl-btn:hover { border-color: rgba(74,222,128,.35); background: rgba(74,222,128,.06); color: rgba(255,255,255,.8); }
        .pfl-btn.on { border-color: rgba(74,222,128,.55); background: rgba(74,222,128,.1); color: #fff; }
        .pfl-icon { font-size: 20px; margin-bottom: 5px; line-height: 1; }
        .pfl-lbl { font-size: 10px; font-weight: 600; line-height: 1; }
        .field { margin-bottom: 14px; }
        .f-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: rgba(255,255,255,.32); margin-bottom: 7px; }
        .f-wrap { position: relative; }
        .f-input { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 13px 16px; font-family: inherit; font-size: 14px; color: #fff; outline: none; transition: border-color .15s, background .15s; }
        .f-input::placeholder { color: rgba(255,255,255,.18); }
        .f-input:focus { border-color: rgba(74,222,128,.5); background: rgba(74,222,128,.04); }
        .f-input.pr { padding-right: 46px; }
        .eye-btn { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 15px; color: rgba(255,255,255,.25); padding: 4px; transition: color .15s; line-height: 1; }
        .eye-btn:hover { color: rgba(255,255,255,.65); }
        .forgot { display: block; text-align: right; font-size: 11px; color: rgba(74,222,128,.5); text-decoration: none; margin-top: -3px; margin-bottom: 20px; transition: color .15s; }
        .forgot:hover { color: #4ade80; }
        .err-box { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.28); border-radius: 8px; padding: 10px 12px; font-size: 12px; color: #fca5a5; margin-bottom: 14px; }
        .hint-box { background: rgba(74,222,128,.07); border: 1px solid rgba(74,222,128,.2); border-radius: 8px; padding: 10px 12px; font-size: 11px; color: rgba(74,222,128,.8); margin-bottom: 14px; line-height: 1.6; }
        .submit { width: 100%; background: linear-gradient(135deg, #15803d 0%, #22c55e 100%); border: none; border-radius: 10px; padding: 14px 20px; font-family: inherit; font-size: 14px; font-weight: 700; color: #fff; cursor: pointer; letter-spacing: .2px; transition: filter .2s, transform .1s; }
        .submit:hover { filter: brightness(1.1); }
        .submit:active { transform: scale(.99); }
        .submit:disabled { opacity: .5; cursor: not-allowed; }
        .form-foot { margin-top: 22px; text-align: center; font-size: 13px; color: rgba(255,255,255,.32); }
        .form-foot a { color: #4ade80; text-decoration: none; }
        .form-foot a:hover { text-decoration: underline; }
        .ver { margin-top: 32px; text-align: center; font-size: 10px; color: rgba(255,255,255,.14); letter-spacing: .4px; }
        @media (max-width: 860px) { .lr-left, .lr-div { display: none; } .lr-right { width: 100%; border-left: none; background: #07100a; } }
      `}</style>

      <div className="lr">
        <div className="lr-left">
          <div className="brand">
            <div className="brand-icon">🛰️</div>
            <div className="brand-name">Geo<b>Agri</b></div>
          </div>
          <div className="hero">
            <div className="badge"><span className="badge-dot"/>Plataforma Geoespacial &amp; ESG Agrícola</div>
            <h1 className="hero-h1">Inteligência<br/>geoespacial para o<br/><em>agronegócio</em></h1>
            <p className="hero-p">Monitore desmatamento, calcule créditos de carbono, gere relatórios ESG e tome decisões baseadas em dados reais do INPE.</p>
            <div className="feats">
              {[
                ['Dados INPE em tempo real','alertas DETER e PRODES atualizados'],
                ['Créditos de carbono','cálculo automático por propriedade'],
                ['Relatórios ESG com IA','gerados pelo Claude em segundos'],
                ['Mapa interativo','OSM + satélite com KML/GeoJSON'],
              ].map(([t,d]) => (
                <div key={t} className="feat">
                  <div className="feat-dot"/>
                  <div className="feat-text"><strong>{t}</strong> — {d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mini-map">
            <div className="mini-map-label">● Live — Amazônia</div>
            <svg width="100%" height="100%" viewBox="0 0 520 118" preserveAspectRatio="xMidYMid slice">
              <rect width="520" height="118" fill="#051208"/>
              {[...Array(13)].map((_,i) => [...Array(4)].map((_,j) => (
                <rect key={`${i}-${j}`} x={i*40+(j%2)*4} y={j*29+1} width={36} height={25} rx={2}
                  fill={`rgba(21,128,61,${.07+((i*3+j*2)%5)*.06})`} stroke="rgba(74,222,128,.05)" strokeWidth={.5}/>
              )))}
              <path d="M0 58 Q100 43 200 63 Q300 79 400 53 Q460 38 520 56" fill="none" stroke="rgba(30,120,220,.32)" strokeWidth={2}/>
              <circle cx={130} cy={61} r={3} fill="#ef4444" opacity={.85}/>
              <circle cx={290} cy={57} r={3} fill="#ef4444" opacity={.85}/>
              <circle cx={400} cy={50} r={3} fill="#f59e0b" opacity={.85}/>
            </svg>
            <div className="pulse-dot" style={{top:'50%',left:'25%'}}/>
          </div>
        </div>

        <div className="lr-div"/>

        <div className="lr-right">
          <div className="form-box">
            <div className="fh-eyebrow">Acesso à plataforma</div>
            <div className="fh-title">Entrar na plataforma</div>
            <div className="fh-sub">Acesse sua conta GeoAgri</div>

            <div className="pfl-label">Selecione seu perfil</div>
            <div className="pfl-grid">
              {PROFILES.map(p => (
                <button key={p.id} type="button" className={`pfl-btn${profile===p.id?' on':''}`} onClick={()=>setProfile(p.id)}>
                  <div className="pfl-icon">{p.icon}</div>
                  <div className="pfl-lbl">{p.label}</div>
                </button>
              ))}
            </div>

            <div className="hint-box">
              🔑 <strong>Demo:</strong> email: <code>admin@geoagri.com</code> · senha: <code>geoagri123</code>
            </div>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="f-label">E-mail</label>
                <div className="f-wrap">
                  <input type="text" className="f-input" placeholder="seu@email.com"
                    value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="email"/>
                </div>
              </div>
              <div className="field">
                <label className="f-label">Senha</label>
                <div className="f-wrap">
                  <input type={showPass?'text':'password'} className="f-input pr" placeholder="••••••••"
                    value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>
                  <button type="button" className="eye-btn" onClick={()=>setShowPass(!showPass)}>
                    {showPass?'🙈':'👁️'}
                  </button>
                </div>
              </div>
              <Link href="/esqueci-senha" className="forgot">Esqueceu a senha?</Link>
              {error && <div className="err-box">⚠️ {error}</div>}
              <button type="submit" className="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar na plataforma →'}
              </button>
            </form>

            <div className="form-foot">Não tem conta? <Link href="/cadastro">Criar conta grátis</Link></div>
            <div className="ver">GeoAgri v4.0 · Plataforma Beta · Dados protegidos</div>
          </div>
        </div>
      </div>
    </>
  )
}