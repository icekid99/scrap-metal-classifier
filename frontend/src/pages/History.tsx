import { useEffect, useState } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { detectionsApi, apiErrorMessage } from '../services/api'
import type { Detection, DetectionListResponse } from '../types'
import { METAL_CLASSES, CLASS_COLORS } from '../types'
import toast from 'react-hot-toast'

export default function History() {
  const [data, setData] = useState<DetectionListResponse | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [metalClass, setMetalClass] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await detectionsApi.list({ page, page_size: 20, search: search || undefined, metal_class: metalClass || undefined })
      setData(res)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, metalClass])

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData() }

  const confBadge = (c: number) =>
    c >= 0.85 ? 'bg-success/15 text-success' : c >= 0.6 ? 'bg-warning/15 text-warning' : 'bg-danger/15 text-danger'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Detection History</h1>
          <p className="text-muted text-sm mt-0.5">{data?.total ?? 0} total detections</p>
        </div>
      </div>

      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by image name or class…"
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-primary"
          />
        </form>
        <div className="relative flex items-center">
          <Filter size={15} className="absolute left-3 text-muted pointer-events-none" />
          <select
            value={metalClass}
            onChange={e => { setMetalClass(e.target.value); setPage(1) }}
            className="bg-surface border border-border rounded-lg pl-9 pr-8 py-2 text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
          >
            <option value="">All Classes</option>
            {METAL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted font-medium px-4 py-3">Image</th>
                <th className="text-left text-muted font-medium px-4 py-3">Class</th>
                <th className="text-left text-muted font-medium px-4 py-3">Confidence</th>
                <th className="text-left text-muted font-medium px-4 py-3">Source</th>
                <th className="text-left text-muted font-medium px-4 py-3">Date</th>
                <th className="text-left text-muted font-medium px-4 py-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">No detections found</td>
                </tr>
              ) : data?.items.map((d: Detection) => (
                <tr key={d.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-4 py-3 text-white max-w-[180px] truncate" title={d.image_name}>{d.image_name}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CLASS_COLORS[d.detected_class] }} />
                      <span className="text-white">{d.detected_class}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${confBadge(d.confidence)}`}>
                      {(d.confidence * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted capitalize">{d.source}</td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {new Date(d.processed_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-muted">{d.operator_name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-muted text-xs">
              Page {data.page} of {data.total_pages} ({data.total} records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="p-1.5 rounded-lg border border-border text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
