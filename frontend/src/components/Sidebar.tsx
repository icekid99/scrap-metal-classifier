import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Camera, History, Users, User, LogOut, Zap,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import clsx from 'clsx'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload', icon: Upload, label: 'Upload Image' },
  { to: '/camera', icon: Camera, label: 'Live Camera' },
  { to: '/history', icon: History, label: 'Detection History' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const ADMIN_ITEMS = [
  { to: '/users', icon: Users, label: 'User Management' },
]

export function Sidebar() {
  const { user, logout, isAdmin } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-secondary border-r border-border">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">ScrapVision</div>
          <div className="text-muted text-xs">AI Metal Classifier</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-white hover:bg-surface',
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {isAdmin() && (
          <>
            <div className="px-3 pt-4 pb-1 text-xs font-semibold text-muted uppercase tracking-wider">
              Admin
            </div>
            {ADMIN_ITEMS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-muted hover:text-white hover:bg-surface',
                  )
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary text-sm font-bold">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{user?.username}</div>
            <div className="text-muted text-xs capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-white hover:bg-surface transition-colors"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
