import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { apiErrorMessage } from '../services/api'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { toast.error('Enter username and password'); return }
    setLoading(true)
    try {
      await login(username, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <div>
            <div className="text-white text-xl font-bold">ScrapVision</div>
            <div className="text-muted text-xs">AI Metal Classifier</div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
          <h1 className="text-white text-lg font-semibold mb-1">Sign in</h1>
          <p className="text-muted text-sm mb-6">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder-muted focus:outline-none focus:border-primary transition-colors"
                placeholder="your username"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 pr-10 text-white text-sm placeholder-muted focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-5">
          Ages Industrial Solutions © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
