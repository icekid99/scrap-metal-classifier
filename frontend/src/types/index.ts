export type UserRole = 'admin' | 'operator'

export interface User {
  id: number
  username: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  confidence: number
}

export interface DetectionResult {
  detected_class: string
  confidence: number
  bounding_boxes: BoundingBox[]
  processed_image_url?: string
  detection_id?: number
}

export interface Detection {
  id: number
  image_name: string
  detected_class: string
  confidence: number
  bounding_box?: BoundingBox[] | null
  image_path?: string
  processed_image_path?: string
  processed_at: string
  operator_id?: number
  operator_name?: string
  source: string
}

export interface DetectionListResponse {
  items: Detection[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface DashboardStats {
  total_detections: number
  steel: number
  cast_iron: number
  aluminium: number
  copper: number
  brass: number
  lead: number
  accuracy: number
  today_count: number
  this_week_count: number
}

export interface MonthlyData {
  month: string
  count: number
}

export interface DailyData {
  date: string
  count: number
}

export const METAL_CLASSES = ['Steel', 'Cast Iron', 'Aluminium', 'Copper', 'Brass', 'Lead'] as const
export type MetalClass = typeof METAL_CLASSES[number]

export const CLASS_COLORS: Record<string, string> = {
  Steel: '#6366f1',
  'Cast Iron': '#94a3b8',
  Aluminium: '#e2e8f0',
  Copper: '#b87333',
  Brass: '#b5a642',
  Lead: '#7c7b8e',
}
