import { useRef, useState, useEffect, useCallback } from 'react'
import { Camera, CameraOff, Play, Square } from 'lucide-react'
import { detectApi, apiErrorMessage } from '../services/api'
import type { DetectionResult } from '../types'
import { CLASS_COLORS } from '../types'
import toast from 'react-hot-toast'

export default function LiveCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [streaming, setStreaming] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [fps, setFps] = useState(0)
  const frameCount = useRef(0)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreaming(true)
      }
    } catch {
      toast.error('Could not access webcam. Allow camera permission and try again.')
    }
  }

  const stopCamera = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setStreaming(false)
    setDetecting(false)
    setResult(null)
    setFps(0)
    frameCount.current = 0
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const captureFrame = (): string | null => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.7)
  }

  const startDetection = () => {
    if (!streaming) { toast.error('Start camera first'); return }
    setDetecting(true)
    const start = Date.now()
    intervalRef.current = setInterval(async () => {
      const frame = captureFrame()
      if (!frame) return
      try {
        const res = await detectApi.webcam(frame)
        setResult(res)
        frameCount.current++
        const elapsed = (Date.now() - start) / 1000
        setFps(Math.round(frameCount.current / elapsed))
      } catch (err) {
        toast.error(apiErrorMessage(err))
        stopDetection()
      }
    }, 1500)
  }

  const stopDetection = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDetecting(false)
  }

  const classColor = result ? (CLASS_COLORS[result.detected_class] ?? '#2563eb') : '#2563eb'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Live Camera</h1>
        <p className="text-muted text-sm mt-0.5">Real-time scrap metal detection from your webcam</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          {!streaming && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted">
              <CameraOff size={40} strokeWidth={1.2} />
              <p className="text-sm">Camera not started</p>
            </div>
          )}
          {detecting && result && (
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                <span className="text-white text-xs font-medium">LIVE</span>
                <span className="text-muted text-xs">{fps} req/s</span>
              </div>
              <div
                className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs font-bold"
                style={{ borderLeft: `3px solid ${classColor}` }}
              >
                {result.detected_class} — {(result.confidence * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        <div className="p-4 flex items-center gap-3">
          {!streaming ? (
            <button onClick={startCamera} className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Camera size={16} /> Start Camera
            </button>
          ) : (
            <>
              {!detecting ? (
                <button onClick={startDetection} className="flex items-center gap-2 bg-success/20 hover:bg-success/30 text-success border border-success/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Play size={16} /> Start Detection
                </button>
              ) : (
                <button onClick={stopDetection} className="flex items-center gap-2 bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <Square size={16} /> Pause Detection
                </button>
              )}
              <button onClick={stopCamera} className="flex items-center gap-2 border border-border text-muted hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
                <CameraOff size={16} /> Stop Camera
              </button>
            </>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-surface border border-border rounded-xl p-5">
          <h2 className="text-white font-semibold mb-4 text-sm">Current Detection</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary rounded-xl p-4 text-center">
              <div className="text-muted text-xs mb-1">Class</div>
              <div className="text-white text-xl font-bold">{result.detected_class}</div>
              <div className="mt-2 h-1.5 rounded-full mx-auto w-12" style={{ backgroundColor: classColor }} />
            </div>
            <div className="bg-secondary rounded-xl p-4 text-center">
              <div className="text-muted text-xs mb-1">Confidence</div>
              <div className="text-white text-xl font-bold">{(result.confidence * 100).toFixed(1)}%</div>
              <div className="mt-2 w-full bg-border rounded-full h-1.5">
                <div className="h-1.5 rounded-full" style={{ width: `${result.confidence * 100}%`, backgroundColor: classColor }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
