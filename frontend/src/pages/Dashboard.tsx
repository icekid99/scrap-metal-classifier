import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Activity, Target, TrendingUp, Calendar, Zap, Download } from 'lucide-react'
import { dashboardApi, detectionsApi } from '../services/api'
import type { DashboardStats, MonthlyData, DailyData } from '../types'
import { CLASS_COLORS } from '../types'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center`} style={{ backgroundColor: color + '20' }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-white text-2xl font-bold">{value}</div>
      {sub && <div className="text-muted text-xs mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [daily, setDaily] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.stats(), dashboardApi.monthly(), dashboardApi.daily()])
      .then(([s, m, d]) => { setStats(s); setMonthly(m); setDaily(d) })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  const handleExportCsv = async () => {
    try {
      const blob = await detectionsApi.exportCsv()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'detections.csv'; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Export failed') }
  }

  const pieData = stats ? [
    { name: 'Steel', value: stats.steel },
    { name: 'Cast Iron', value: stats.cast_iron },
    { name: 'Aluminium', value: stats.aluminium },
    { name: 'Copper', value: stats.copper },
    { name: 'Brass', value: stats.brass },
    { name: 'Lead', value: stats.lead },
  ].filter(d => d.value > 0) : []

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-muted text-sm mt-0.5">Real-time scrap metal detection overview</p>
        </div>
        <button onClick={handleExportCsv} className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-lg text-sm text-muted hover:text-white transition-colors">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Detections" value={stats?.total_detections ?? 0} sub="All time" color="#2563eb" />
        <StatCard icon={Target} label="Accuracy" value={`${stats?.accuracy ?? 0}%`} sub="High confidence (>80%)" color="#22c55e" />
        <StatCard icon={Zap} label="Today" value={stats?.today_count ?? 0} sub="Detections today" color="#38bdf8" />
        <StatCard icon={Calendar} label="This Week" value={stats?.this_week_count ?? 0} sub="Last 7 days" color="#f59e0b" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {pieData.map(d => (
          <div key={d.name} className="bg-surface border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{d.value}</div>
            <div className="text-xs text-muted mt-1">{d.name}</div>
            <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: CLASS_COLORS[d.name] }} />
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">By Metal Type</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CLASS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} labelStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-[220px] flex items-center justify-center text-muted text-sm">No data yet</div>}
          <div className="mt-3 space-y-1.5">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CLASS_COLORS[d.name] }} />
                  <span className="text-muted">{d.name}</span>
                </div>
                <span className="text-white font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Monthly Detections</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Detections" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2"><TrendingUp size={15} /> Daily Detections (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={daily}>
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} dot={false} name="Detections" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
