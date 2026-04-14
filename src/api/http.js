import axios from 'axios'

const STORAGE_KEY = 'subees-auth-session'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const session = raw ? JSON.parse(raw) : null
    const accessToken = session?.accessToken
    const grantType = session?.grantType ?? 'Bearer'

    if (accessToken) {
      config.headers.Authorization = `${grantType} ${accessToken}`
    }
  } catch (error) {
    // 세션 파싱 실패 시 기본 요청 진행
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
)

export default http
