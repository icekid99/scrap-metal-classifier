import { useEffect, useState } from 'react'
import { UserPlus, Trash2, Edit2, CheckCircle, XCircle } from 'lucide-react'
import { usersApi, apiErrorMessage } from '../services/api'
import type { User } from '../types'
import toast from 'react-hot-toast'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'operator' })
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    try {
      setUsers(await usersApi.list())
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.email || !form.password) { toast.error('All fields are required'); return }
    setSaving(true)
    try {
      await usersApi.create(form)
      toast.success('User created')
      setShowForm(false)
      setForm({ username: '', email: '', password: '', role: 'operator' })
      fetchUsers()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (user: User) => {
    try {
      await usersApi.update(user.id, { is_active: !user.is_active })
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`)
      fetchUsers()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.username}"? This cannot be undone.`)) return
    try {
      await usersApi.delete(user.id)
      toast.success('User deleted')
      fetchUsers()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">User Management</h1>
          <p className="text-muted text-sm mt-0.5">{users.length} users</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">New User</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1.5">Username</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                placeholder="username" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                placeholder="user@example.com" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-border rounded-lg text-sm text-muted hover:text-white transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-muted font-medium px-4 py-3">User</th>
              <th className="text-left text-muted font-medium px-4 py-3">Role</th>
              <th className="text-left text-muted font-medium px-4 py-3">Status</th>
              <th className="text-left text-muted font-medium px-4 py-3">Created</th>
              <th className="text-right text-muted font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-muted">Loading…</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-secondary/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold">
                      {u.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium">{u.username}</div>
                      <div className="text-muted text-xs">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${u.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-border text-muted'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`flex items-center gap-1.5 text-xs ${u.is_active ? 'text-success' : 'text-muted'}`}>
                    {u.is_active ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleToggle(u)}
                      className="p-1.5 rounded-lg border border-border text-muted hover:text-white transition-colors" title={u.is_active ? 'Deactivate' : 'Activate'}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(u)}
                      className="p-1.5 rounded-lg border border-border text-muted hover:text-danger hover:border-danger/30 transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
