'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Leaf, AlertCircle, CheckCircle } from 'lucide-react'
import { auth } from '@/lib/supabase'
import toast from 'react-hot-toast'

const ROLES = [
  { id: 'produtor', label: 'Produtor Rural', icon: '👨‍🌾', desc: 'Gestão da minha fazenda' },
  { id: 'agronomo', label: 'Agrônomo', icon: '🌿', desc: 'Consultoria técnica' },
  { id: 'banco', label: 'Banco / Investidor', icon: '🏦', desc: 'Análise de carteira' },
  { id: 'regulador', label: 'Regulador', icon: '⚖️', desc: 'Fiscalização e conformidade' },
]

export default function CadastroPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [role, setRole] = useState('produtor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setError(''); setLoading(true)
    const { data, error } = await auth.signUp(email, password, name, role)
    if (error) {
      setError(error.message === 'User already registered' ? 'Este email já está cadastrado.' : 'Erro ao criar conta. Tente novamente.')
      setLoading(false); return
    }
    setSuccess(true)
    toast.success('Conta criada! Verifique seu email. 🌱')
  }

  if (success) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #071a0d, #1a6e3c 45%, #2d5a1e 75%, #8B6914)' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
        <div className="w-16 h-16 bg-[#e8f5ee] rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[#1a6e3c]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a2420] mb-2">Conta criada!</h2>
        <p className="text-[#5a7065] mb-6">Enviamos um email de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada para ativar sua conta.</p>
        <Link href="/login" className="btn-primary w-full justify-center py-3 block text-center">Ir para o login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #071a0d, #1a6e3c 45%, #2d5a1e 75%, #8B6914)' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1a6e3c] to-[#4cba74] rounded-xl flex items-center justify-center mx-auto mb-3">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a2420]">Criar conta grátis</h2>
          <p className="text-sm text-[#5a7065] mt-1">Comece a usar o GeoAgri hoje</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s ? 'bg-[#1a6e3c] text-white' : 'bg-[#e8f5ee] text-[#5a7065]'}`}>{s}</div>
              <div className={`h-0.5 flex-1 ${s < 2 ? (step > s ? 'bg-[#1a6e3c]' : 'bg-[#d4e8da]') : 'hidden'}`} />
            </div>
          ))}
        </div>

        <form onSubmit={handleCadastro}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5a7065] uppercase tracking-wide mb-1">Seu perfil</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <div key={r.id} onClick={() => setRole(r.id)} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${role === r.id ? 'border-[#1a6e3c] bg-[#e8f5ee]' : 'border-[#d4e8da] hover:border-[#2d9a56]'}`}>
                      <div className="text-xl mb-1">{r.icon}</div>
                      <div className="font-semibold text-xs text-[#1a2420]">{r.label}</div>
                      <div className="text-xs text-[#5a7065]">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => setStep(2)} className="btn-primary w-full justify-center py-3">
                Continuar →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#5a7065] uppercase tracking-wide mb-1">Nome completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="João Silva" required className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5a7065] uppercase tracking-wide mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required className="input" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5a7065] uppercase tracking-wide mb-1">Senha</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required className="input pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5a7065]">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 bg-[#fdecea] border border-[#f5c6cb] rounded-lg p-3 text-sm text-[#c0392b]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">← Voltar</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                  {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Criar conta'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-4 text-center text-sm text-[#5a7065]">
          Já tem conta?{' '}
          <Link href="/login" className="text-[#1a6e3c] font-semibold hover:underline">Entrar</Link>
        </div>
        <p className="mt-3 text-xs text-center text-[#5a7065]">
          Ao criar sua conta, você concorda com nossos <Link href="/termos" className="text-[#1a6e3c] hover:underline">Termos de Uso</Link>
        </p>
      </div>
    </div>
  )
}