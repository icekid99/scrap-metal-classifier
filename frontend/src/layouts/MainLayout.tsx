import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-secondary text-white">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
