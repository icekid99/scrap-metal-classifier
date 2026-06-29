import axios from 'axios'
import type {
  TokenResponse, User, DetectionResult, DetectionListResponse,
  DashboardStats, MonthlyData, DailyData,
} from '../types'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export const authApi = {
  login: (username: string, password: string) =>
    api.post<TokenResponse>('/api/auth/login', { username, password }).then((r) => r.data),
  register: (username: string, email: string, password: string, role = 'operator') =>
    api.post<TokenResponse>('/api/auth/register', { username, email, password, role }).then((r) => r.data),
  me: () => api.get<User>('/api/auth/me').then((r) => r.data),
}

export const detectApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<DetectionResult>('/api/detect/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },
  webcam: (frame: string) =>
    api.post<DetectionResult>('/api/detect/webcam', { frame }).then((r) => r.data),
}

export const detectionsApi = {
  list: (params: { page?: number; page_size?: number; search?: string; metal_class?: string }) =>
    api.get<DetectionListResponse>('/api/detections', { params }).then((r) => r.data),
  exportCsv: () =>
    api.get('/api/detections/export/csv', { responseType: 'blob' }).then((r) => r.data),
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/api/dashboard/stats').then((r) => r.data),
  monthly: () => api.get<MonthlyData[]>('/api/dashboard/monthly').then((r) => r.data),
  daily: () => api.get<DailyData[]>('/api/dashboard/daily').then((r) => r.data),
}

export const usersApi = {
  list: () => api.get<User[]>('/api/users').then((r) => r.data),
  create: (body: { username: string; email: string; password: string; role: string }) =>
    api.post<User>('/api/users', body).then((r) => r.data),
  update: (id: number, body: Partial<User>) =>
    api.put<User>(`/api/users/${id}`, body).then((r) => r.data),
  delete: (id: number) => api.delete(`/api/users/${id}`),
  changePassword: (current_password: string, new_password: string) =>
    api.patch('/api/users/me/password', { current_password, new_password }),
}

export const apiErrorMessage = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.detail || err.message
  }
  return String(err)
}

export default api
