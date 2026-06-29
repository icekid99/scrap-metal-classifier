import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload as UploadIcon, CheckCircle, AlertCircle, Image } from 'lucide-react'
import { detectApi, apiErrorMessage } from '../services/api'
import type { DetectionResult } from '../types'
import { CLASS_COLORS } from '../types'
import toast from 'react-hot-toast'

export default function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp'] }, maxFiles: 1,
  })

  const handleDetect = async () => {
    if (!file) { toast.error('Select an image first'); return }
    setLoading(true); setProgress(0)
    const tick = setInterval(() => setProgress(p => Math.min(p + 8, 90)), 300)
    try {
      const res = await detectApi.upload(file)
      setResult(res)
      setProgress(100)
      toast.success(`Detected: ${res.detected_class} (${(res.confidence * 100).toFixed(1)}%)`)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      clearInterval(tick)
      setLoading(false)
    }
  }

  const reset = () => { setFile(null); setPreview(null); setResult(null); setProgress(0) }

  const confColor = result
    ? result.confidence >= 0.85 ? 'text-success' : result.confidence >= 0.6 ? 'text-warning' : 'text-danger'
    : ''

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Upload Image</h1>
        <p className="text-muted text-sm mt-0.5">Upload a scrap metal image for AI classification</p>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        {preview ? (
          <img src={preview} alt="preview" className="max-h-64 mx-auto rounded-lg object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted">
            <Image size={40} strokeWidth={1.2} />
            <div>
              <p className="text-white font-medium">Drop image here or click to browse</p>
              <p className="text-sm mt-1">JPEG, PNG, WEBP, BMP — max 20MB</p>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UploadIcon size={16} className="text-muted" />
            <span className="text-white text-sm">{file.name}</span>
            <span className="text-muted text-xs">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
          <button onClick={reset} className="text-muted hover:text-danger text-xs transition-colors">Remove</button>
        </div>
      )}

      {loading && (
        <div>
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Analysing…</span><span>{progress}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleDetect}
          disabled={!file || loading}
          className="flex-1 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
        >
          {loading ? 'Detecting…' : 'Detect Metal Type'}
        </button>
        {result && (
          <button onClick={reset} className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted hover:text-white transition-colors">
            Clear
          </button>
        )}
      </div>

      {result && (
        <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={18} />
            <span className="font-semibold text-white">Detection Complete</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-xl p-4 text-center">
              <div className="text-muted text-xs mb-1">Detected Class</div>
              <div className="text-white text-xl font-bold">{result.detected_class}</div>
              <div
                className="mt-2 h-1.5 rounded-full mx-auto w-16"
                style={{ backgroundColor: CLASS_COLORS[result.detected_class] ?? '#2563eb' }}
              />
            </div>
            <div className="bg-secondary rounded-xl p-4 text-center">
              <div className="text-muted text-xs mb-1">Confidence</div>
              <div className={`text-xl font-bold ${confColor}`}>
                {(result.confidence * 100).toFixed(1)}%
              </div>
              <div className="mt-2 w-full bg-border rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: `${result.confidence * 100}%`,
                    backgroundColor: CLASS_COLORS[result.detected_class] ?? '#2563eb',
                  }}
                />
              </div>
            </div>
          </div>

          {result.processed_image_url && (
            <div>
              <p className="text-muted text-xs mb-2 flex items-center gap-1.5">
                <AlertCircle size={13} /> Annotated Result
              </p>
              <img
                src={result.processed_image_url}
                alt="annotated"
                className="rounded-xl max-h-72 w-full object-contain border border-border"
              />
            </div>
          )}

          {result.bounding_boxes.length > 0 && (
            <div>
              <p className="text-muted text-xs mb-2">Bounding Boxes ({result.bounding_boxes.length})</p>
              <div className="space-y-1.5">
                {result.bounding_boxes.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2 text-xs">
                    <span className="text-white font-medium">{b.label}</span>
                    <span className="text-muted">{(b.confidence * 100).toFixed(1)}% confidence</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
