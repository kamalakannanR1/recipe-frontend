import axios from 'axios'

export const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function assetUrl(value) {
  if (!value) return value
  return value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `${apiBaseUrl}${value}`
}

const api = axios.create({
  baseURL: apiBaseUrl
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default api
