import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [role, setRole] = useState('admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:8000/auth/login', { email, password })
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('name', res.data.name)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex font-sans">
      <div className="flex-1 bg-[#030d1a] relative overflow-hidden flex items-center justify-center p-8">
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'40px 40px'}}></div>
        <div className="absolute w-80 h-80 rounded-full top-[-60px] left-[-60px]" style={{background:'radial-gradient(circle,rgba(14,165,233,0.3) 0%,transparent 70%)'}}></div>
        <div className="absolute w-64 h-64 rounded-full bottom-[-40px] right-[-40px]" style={{background:'radial-gradient(circle,rgba(245,158,11,0.25) 0%,transparent 70%)'}}></div>
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl border border-yellow-500/30 bg-sky-500/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📷</span>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">Photo<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">Vault</span></h1>
          <p className="text-white/40 text-sm mb-8">Professional photo sharing for events & clients</p>
          <div className="flex gap-3 justify-center">
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">12K+</div>
              <div className="text-white/35 text-xs mt-1">Photos</div>
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">300+</div>
              <div className="text-white/35 text-xs mt-1">Events</div>
            </div>
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl px-4 py-3 text-center">
              <div className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-yellow-400">99%</div>
              <div className="text-white/35 text-xs mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-96 bg-white flex items-center justify-center p-8 relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-yellow-400"></div>
        <div className="w-full">
          <h2 className="text-2xl font-semibold text-[#030d1a] mb-1">Welcome back 👋</h2>
          <p className="text-gray-400 text-sm mb-6">Sign in to your PhotoVault account</p>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setRole('admin')} className={`flex-1 h-10 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 ${role === 'admin' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-400'}`}>🛡️ Admin</button>
            <button onClick={() => setRole('member')} className={`flex-1 h-10 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 ${role === 'member' ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 text-gray-400'}`}>👥 Team Member</button>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@studio.com" className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-gray-50 outline-none text-[#030d1a]" />
          </div>
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm bg-gray-50 outline-none text-[#030d1a]" />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button onClick={handleLogin} className="w-full h-11 rounded-xl bg-gradient-to-r from-sky-500 to-yellow-400 text-white font-semibold text-sm">Sign in →</button>
          <p className="text-center text-xs text-gray-300 mt-4">Team members use credentials provided by your admin</p>
        </div>
      </div>
    </div>
  )
}