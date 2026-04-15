import http from './http'

const RESET_CODES_KEY = 'subees-mock-reset-codes'

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))
const createResponse = (data) => ({ data: { data } })
const normalizeEmail = (email = '') => String(email).trim().toLowerCase()

const readResetCodes = () => {
  try {
    const raw = window.localStorage.getItem(RESET_CODES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (error) {
    return {}
  }
}

const saveResetCodes = (payload) => {
  window.localStorage.setItem(RESET_CODES_KEY, JSON.stringify(payload))
}

export const getMockAuthGuide = () => ({
  demoEmail: 'demo@subees.app',
  demoPassword: 'subees1234',
  resetCode: '123456',
})

export const postLogin = (payload) => http.post('/api/v1/login', payload)

export const postLogout = () => http.post('/api/v1/logout')

export const postSignup = (payload) => http.post('/api/v1/users', payload)

export const getCheckEmail = (email) => http.get('/api/v1/users/check-email', {
  params: { email },
})

export const getCheckNickname = (nickname) => http.get('/api/v1/users/check-nickname', {
  params: { nickname },
})

// 비밀번호 재설정 화면은 아직 실제 백엔드 명세가 없어 기존 로컬 목업 흐름을 유지합니다.
export const postPasswordResetCode = async (email) => {
  await wait(180)

  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) {
    const error = new Error('가입된 이메일을 찾을 수 없습니다.')
    error.response = { data: { message: '가입된 이메일을 찾을 수 없습니다.' } }
    throw error
  }

  const code = '123456'
  const codes = readResetCodes()
  codes[normalizedEmail] = code
  saveResetCodes(codes)

  return createResponse({
    sent: true,
    code,
    message: '임시 인증번호가 준비되었습니다.',
  })
}

export const postVerifyPasswordResetCode = async ({ email, verificationCode }) => {
  await wait(160)

  const normalizedEmail = normalizeEmail(email)
  const codes = readResetCodes()
  const matched = codes[normalizedEmail]

  if (!matched || matched !== String(verificationCode || '').trim()) {
    const error = new Error('인증번호가 올바르지 않습니다.')
    error.response = { data: { message: '인증번호가 올바르지 않습니다.' } }
    throw error
  }

  return createResponse({ verified: true })
}

export const postResetPassword = async ({ email, password }) => {
  await wait(200)

  if (!normalizeEmail(email) || !String(password || '').trim()) {
    const error = new Error('가입된 이메일을 찾을 수 없습니다.')
    error.response = { data: { message: '가입된 이메일을 찾을 수 없습니다.' } }
    throw error
  }

  const codes = readResetCodes()
  delete codes[normalizeEmail(email)]
  saveResetCodes(codes)

  return createResponse({ success: true })
}
