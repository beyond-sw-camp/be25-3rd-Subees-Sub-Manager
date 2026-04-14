import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'subees-notifications'

const defaultNotifications = () => ([
  {
    notificationId: 1,
    title: '넷플릭스 결제가 3일 뒤 예정되어 있어요',
    message: '현대카드로 17,000원이 결제될 예정입니다. 결제일 전에 카드와 금액을 다시 확인해보세요.',
    type: 'PAYMENT',
    createdAt: '03.31 09:10',
    read: false,
    ctaLabel: '구독 상세 보기',
    ctaTo: '/subscriptions',
  },
  {
    notificationId: 2,
    title: '이번 달 지출 비중이 AI 카테고리에 집중되어 있어요',
    message: 'ChatGPT Plus, Claude Pro, Gemini Advanced가 같은 달에 몰려 있어 월간 지출 비중이 높게 집계됐습니다.',
    type: 'INSIGHT',
    createdAt: '03.30 18:20',
    read: false,
    ctaLabel: '결제 캘린더 보기',
    ctaTo: '/calendar',
  },
  {
    notificationId: 3,
    title: '커뮤니티 글이 스크랩 목록에 저장되었어요',
    message: '관심 있는 게시글을 다시 보려면 커뮤니티 스크랩 목록에서 바로 열 수 있습니다.',
    type: 'COMMUNITY',
    createdAt: '03.29 22:05',
    read: true,
    ctaLabel: '스크랩 보기',
    ctaTo: '/community/scraps',
  },
])

const loadNotifications = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultNotifications()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : defaultNotifications()
  } catch (error) {
    return defaultNotifications()
  }
}

const saveNotifications = (value) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref(loadNotifications())
  const unreadOnly = ref(false)

  const sortedNotifications = computed(() => [...notifications.value].sort((a, b) => b.notificationId - a.notificationId))
  const unreadCount = computed(() => notifications.value.filter((item) => !item.read).length)
  const visibleNotifications = computed(() => {
    return unreadOnly.value ? sortedNotifications.value.filter((item) => !item.read) : sortedNotifications.value
  })

  const persist = () => saveNotifications(notifications.value)
  const toggleUnreadOnly = () => { unreadOnly.value = !unreadOnly.value }
  const markAsRead = (notificationId) => {
    notifications.value = notifications.value.map((item) => item.notificationId === notificationId ? { ...item, read: true } : item)
    persist()
  }
  const toggleRead = (notificationId) => {
    notifications.value = notifications.value.map((item) => item.notificationId === notificationId ? { ...item, read: !item.read } : item)
    persist()
  }
  const closeNotification = (notificationId) => {
    notifications.value = notifications.value.filter((item) => item.notificationId !== notificationId)
    persist()
  }
  const markAllRead = () => {
    notifications.value = notifications.value.map((item) => ({ ...item, read: true }))
    persist()
  }
  const pushNotification = (payload) => {
    const nextId = Math.max(0, ...notifications.value.map((item) => item.notificationId)) + 1
    notifications.value = [{
      notificationId: nextId,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'SYSTEM',
      createdAt: payload.createdAt || new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date()),
      read: false,
      ctaLabel: payload.ctaLabel || '확인',
      ctaTo: payload.ctaTo || '/dashboard',
    }, ...notifications.value]
    persist()
  }

  return {
    notifications,
    unreadOnly,
    unreadCount,
    sortedNotifications,
    visibleNotifications,
    toggleUnreadOnly,
    markAsRead,
    toggleRead,
    closeNotification,
    markAllRead,
    pushNotification,
  }
})
