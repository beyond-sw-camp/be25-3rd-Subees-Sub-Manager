const USERS_KEY = 'subees-mock-users'
const RESET_CODES_KEY = 'subees-mock-reset-codes'

const wait = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms))
const clone = (value) => JSON.parse(JSON.stringify(value))
const createResponse = (data) => ({ data: { data } })
const normalizeEmail = (email = '') => String(email).trim().toLowerCase()

const createDemoUser = () => ({
  userId: 1,
  email: 'demo@subees.app',
  nickname: 'SubeesDemo',
  password: 'subees1234',
  createdAt: '2026-03-30T12:00:00.000Z',
})

const ensureUsers = () => {
  const raw = window.localStorage.getItem(USERS_KEY)

  if (!raw) {
    const seeded = [createDemoUser()]
    window.localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
    return seeded
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
  } catch (error) {
    // ignore parse failure and reseed below
  }

  const seeded = [createDemoUser()]
  window.localStorage.setItem(USERS_KEY, JSON.stringify(seeded))
  return seeded
}

const readUsers = () => clone(ensureUsers())
const saveUsers = (users) => window.localStorage.setItem(USERS_KEY, JSON.stringify(users))

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

const issueAccessToken = (user) => `mock-token-${user.userId}-${Date.now()}`

export const getMockAuthGuide = () => ({
  demoEmail: 'demo@subees.app',
  demoPassword: 'subees1234',
  resetCode: '123456',
})

export const postLogin = async (payload) => {
  await wait()

  const email = normalizeEmail(payload?.email)
  const password = String(payload?.password || '')
  const users = readUsers()
  const found = users.find((user) => normalizeEmail(user.email) === email)

  if (!found || found.password !== password) {
    const error = new Error('이메일 또는 비밀번호가 일치하지 않습니다.')
    error.response = { data: { message: '이메일 또는 비밀번호가 일치하지 않습니다.' } }
    throw error
  }

  return createResponse({
    grantType: 'Bearer',
    accessToken: issueAccessToken(found),
    userId: found.userId,
    nickname: found.nickname,
    email: found.email,
  })
}

export const postLogout = async () => {
  await wait(100)
  return createResponse({ success: true })
}

export const postSignup = async (payload) => {
  await wait()

  const email = normalizeEmail(payload?.email)
  const nickname = String(payload?.nickname || '').trim()
  const password = String(payload?.password || '')
  const users = readUsers()

  if (users.some((user) => normalizeEmail(user.email) === email)) {
    const error = new Error('이미 사용 중인 이메일입니다.')
    error.response = { data: { message: '이미 사용 중인 이메일입니다.' } }
    throw error
  }

  if (users.some((user) => String(user.nickname).toLowerCase() === nickname.toLowerCase())) {
    const error = new Error('이미 사용 중인 닉네임입니다.')
    error.response = { data: { message: '이미 사용 중인 닉네임입니다.' } }
    throw error
  }

  const nextUser = {
    userId: users.length ? Math.max(...users.map((user) => Number(user.userId) || 0)) + 1 : 1,
    email,
    nickname,
    password,
    createdAt: new Date().toISOString(),
  }

  users.push(nextUser)
  saveUsers(users)

  return createResponse({
    userId: nextUser.userId,
    email: nextUser.email,
    nickname: nextUser.nickname,
  })
}

export const getCheckEmail = async (email) => {
  await wait(150)
  const users = readUsers()
  const available = !users.some((user) => normalizeEmail(user.email) === normalizeEmail(email))

  return createResponse({
    available,
    message: available ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.',
  })
}

export const getCheckNickname = async (nickname) => {
  await wait(150)
  const target = String(nickname || '').trim().toLowerCase()
  const users = readUsers()
  const available = !users.some((user) => String(user.nickname).toLowerCase() === target)

  return createResponse({
    available,
    message: available ? '사용 가능한 닉네임입니다.' : '이미 사용 중인 닉네임입니다.',
  })
}

export const postPasswordResetCode = async (email) => {
  await wait(180)

  const normalizedEmail = normalizeEmail(email)
  const users = readUsers()
  const found = users.find((user) => normalizeEmail(user.email) === normalizedEmail)

  if (!found) {
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

  const normalizedEmail = normalizeEmail(email)
  const users = readUsers()
  const foundIndex = users.findIndex((user) => normalizeEmail(user.email) === normalizedEmail)

  if (foundIndex === -1) {
    const error = new Error('가입된 이메일을 찾을 수 없습니다.')
    error.response = { data: { message: '가입된 이메일을 찾을 수 없습니다.' } }
    throw error
  }

  users[foundIndex].password = password
  saveUsers(users)

  const codes = readResetCodes()
  delete codes[normalizedEmail]
  saveResetCodes(codes)

  return createResponse({ success: true })
}
