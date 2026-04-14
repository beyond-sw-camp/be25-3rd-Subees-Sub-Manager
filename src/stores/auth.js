import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { postLogin, postLogout } from '@/api/auth'

const STORAGE_KEY = 'subees-auth-session'

const loadSession = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (error) {
    return null
  }
}

const saveSession = (session) => {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export const useAuthStore = defineStore('auth', () => {
  const session = ref(loadSession())
  const isSubmitting = ref(false)

  const isLoggedIn = computed(() => Boolean(session.value?.accessToken))
  const nickname = computed(() => session.value?.nickname ?? '')
  const userId = computed(() => session.value?.userId ?? null)
  const accessToken = computed(() => session.value?.accessToken ?? '')

  const setSession = (payload) => {
    session.value = payload
    saveSession(payload)
  }

  const login = async (payload) => {
    isSubmitting.value = true
    try {
      const response = await postLogin(payload)
      const authData = response?.data?.data ?? {}

      const nextSession = {
        grantType: authData.grantType ?? 'Bearer',
        accessToken: authData.accessToken ?? '',
        userId: authData.userId ?? null,
        nickname: authData.nickname ?? payload.email.split('@')[0],
      }

      setSession(nextSession)
      return nextSession
    } finally {
      isSubmitting.value = false
    }
  }

  const logout = async () => {
    try {
      if (isLoggedIn.value) {
        await postLogout()
      }
    } catch (error) {
      // 로컬 세션 정리는 항상 수행
    } finally {
      setSession(null)
    }
  }

  return {
    session,
    isSubmitting,
    isLoggedIn,
    nickname,
    userId,
    accessToken,
    setSession,
    login,
    logout,
  }
})
