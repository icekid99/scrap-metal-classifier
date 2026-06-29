import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { usersApi, apiErrorMessage } from '../services/api'
import { User, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuthStore()
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.next !== pw.confirm) { toast.error('New passwords do not match'); return }
    if (pw.next.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setSaving(true)
    try {
      await usersApi.changePassword(pw.current, pw.next)
      toast.success('Password changed successfully')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Profile</h1>
        <p className="text-muted text-sm mt-0.5">Your account information</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-xl font-bold">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="text-white text-lg font-semibold">{user?.username}</div>
            <div className="text-muted text-sm">{user?.email}</div>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-xs font-medium capitalize ${user?.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-border text-muted'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted mb-1 flex items-center gap-1.5"><User size={13} /> Username</div>
            <div className="text-white">{user?.username}</div>
          </div>
          <div>
            <div className="text-muted mb-1">Email</div>
            <div className="text-white">{user?.email}</div>
          </div>
          <div>
            <div className="text-muted mb-1">Role</div>
            <div className="text-white capitalize">{user?.role}</div>
          </div>
          <div>
            <div className="text-muted mb-1">Status</div>
            <div className="text-success">Active</div>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
          <Lock size={15} /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs text-muted mb-1.5">Current Password</label>
            <input type="password" value={pw.current} onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">New Password</label>
            <input type="password" value={pw.next} onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1.5">Confirm New Password</label>
            <input type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
              placeholder="Repeat new password" />
          </div>
          <button type="submit" disabled={saving || !pw.current || !pw.next || !pw.confirm}
            className="w-full bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
            {saving ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
