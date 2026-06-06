import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leadist_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('leadist_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const outboundApi = axios.create({
  baseURL: import.meta.env.VITE_OUTBOUND_API_URL || '/outbound',
})

export default api
