import { defineStore } from 'pinia'

const initialSubscriptions = () => ([
  { subscriptionId: 1, categoryName: 'OTT', subscriptionName: 'Netflix Premium', paymentAmount: 17000, billingCycle: 'MONTHLY', paymentCardName: '현대카드', paymentStartDate: '2026-01-11', nextPaymentDate: '2026-04-11', registeredAt: '2026-01-11', updatedAt: '2026-03-25', note: '가족과 공유 중인 메인 OTT 서비스', status: 'ACTIVE' },
  { subscriptionId: 2, categoryName: 'AI', subscriptionName: 'ChatGPT Plus', paymentAmount: 29000, billingCycle: 'MONTHLY', paymentCardName: '토스카드', paymentStartDate: '2025-12-12', nextPaymentDate: '2026-04-12', registeredAt: '2025-12-12', updatedAt: '2026-03-28', note: '개인 작업과 개발 보조용으로 매일 사용', status: 'ACTIVE' },
  { subscriptionId: 3, categoryName: 'Cloud', subscriptionName: 'Adobe Creative Cloud', paymentAmount: 54000, billingCycle: 'MONTHLY', paymentCardName: '삼성카드', paymentStartDate: '2025-10-16', nextPaymentDate: '2026-04-16', registeredAt: '2025-10-16', updatedAt: '2026-03-10', note: '포스터/썸네일 제작용으로 유지 중', status: 'ACTIVE' },
  { subscriptionId: 4, categoryName: 'Music', subscriptionName: 'Spotify Premium', paymentAmount: 10900, billingCycle: 'MONTHLY', paymentCardName: 'KB국민카드', paymentStartDate: '2025-09-18', nextPaymentDate: '2026-04-18', registeredAt: '2025-09-18', updatedAt: '2026-02-19', note: '운동할 때 주로 사용하는 음악 구독', status: 'ACTIVE' },
  { subscriptionId: 5, categoryName: 'Cloud', subscriptionName: 'Notion Plus', paymentAmount: 120000, billingCycle: 'YEARLY', paymentCardName: '신한카드', paymentStartDate: '2025-07-03', nextPaymentDate: '2026-07-03', registeredAt: '2025-07-03', updatedAt: '2026-01-04', note: '프로젝트 문서/정리용, 연간 결제 상태', status: 'PAUSED' },
  { subscriptionId: 6, categoryName: 'Etc', subscriptionName: 'Coupang Wow', paymentAmount: 7890, billingCycle: 'MONTHLY', paymentCardName: '우리카드', paymentStartDate: '2025-11-02', nextPaymentDate: '2026-04-02', registeredAt: '2025-11-02', updatedAt: '2026-03-30', note: '생활형 멤버십, 자주 사용하는 편', status: 'ACTIVE' },
  { subscriptionId: 7, categoryName: 'AI', subscriptionName: 'Claude Pro', paymentAmount: 29000, billingCycle: 'MONTHLY', paymentCardName: '현대카드', paymentStartDate: '2026-01-20', nextPaymentDate: '2026-04-20', registeredAt: '2026-01-20', updatedAt: '2026-03-27', note: '문서 요약과 아이디어 정리에 병행 사용', status: 'ACTIVE' },
])

const categoryOrder = ['전체', 'OTT', 'Music', 'AI', 'Cloud', 'Etc']
const normalizeMonthlyAmount = (subscription) => subscription.billingCycle === 'YEARLY' ? Math.round(subscription.paymentAmount / 12) : subscription.paymentAmount
const startOfDay = (dateString) => new Date(`${dateString}T00:00:00`)

export const useSubscriptionsStore = defineStore('subscriptions', {
  state: () => ({
    filters: { query: '', categoryName: '전체', sortBy: 'NEXT_PAYMENT_ASC' },
    subscriptions: initialSubscriptions(),
    selectedSubscriptionId: 1,
    recentlySaved: false,
  }),
  getters: {
    categories() {
      return categoryOrder.map((categoryName) => categoryName === '전체'
        ? { categoryName, count: this.subscriptions.length }
        : { categoryName, count: this.subscriptions.filter((subscription) => subscription.categoryName === categoryName).length })
    },
    filteredSubscriptions(state) {
      const query = state.filters.query.trim().toLowerCase()
      let items = [...state.subscriptions]
      if (state.filters.categoryName !== '전체') items = items.filter((subscription) => subscription.categoryName === state.filters.categoryName)
      if (query) {
        items = items.filter((subscription) => [subscription.subscriptionName, subscription.categoryName, subscription.paymentCardName, subscription.note, subscription.status].some((value) => String(value || '').toLowerCase().includes(query)))
      }
      const sortStrategies = {
        NEXT_PAYMENT_ASC: (a, b) => startOfDay(a.nextPaymentDate) - startOfDay(b.nextPaymentDate),
        AMOUNT_DESC: (a, b) => normalizeMonthlyAmount(b) - normalizeMonthlyAmount(a),
        UPDATED_DESC: (a, b) => startOfDay(b.updatedAt) - startOfDay(a.updatedAt),
        NAME_ASC: (a, b) => a.subscriptionName.localeCompare(b.subscriptionName),
      }
      return items.sort(sortStrategies[state.filters.sortBy] || sortStrategies.NEXT_PAYMENT_ASC)
    },
    selectedSubscription() { return this.subscriptions.find((subscription) => subscription.subscriptionId === this.selectedSubscriptionId) ?? this.filteredSubscriptions[0] ?? null },
    totalCount() { return this.subscriptions.length },
    activeCount() { return this.subscriptions.filter((subscription) => subscription.status === 'ACTIVE').length },
    pausedCount() { return this.subscriptions.filter((subscription) => subscription.status !== 'ACTIVE').length },
    monthlyExpectedAmount() { return this.subscriptions.filter((subscription) => subscription.status === 'ACTIVE').reduce((total, subscription) => total + normalizeMonthlyAmount(subscription), 0) },
    nextDueSubscription() { return [...this.subscriptions].filter((subscription) => subscription.status === 'ACTIVE').sort((a, b) => startOfDay(a.nextPaymentDate) - startOfDay(b.nextPaymentDate))[0] ?? null },
    highestCategory() {
      const categoryMap = new Map()
      this.subscriptions.forEach((subscription) => {
        if (subscription.status !== 'ACTIVE') return
        categoryMap.set(subscription.categoryName, (categoryMap.get(subscription.categoryName) || 0) + normalizeMonthlyAmount(subscription))
      })
      const [categoryName, totalAmount] = [...categoryMap.entries()].sort((a, b) => b[1] - a[1])[0] ?? ['-', 0]
      return { categoryName, totalAmount }
    },
  },
  actions: {
    setQuery(query) { this.filters.query = query; this.ensureSelectedSubscription() },
    setCategory(categoryName) { this.filters.categoryName = categoryName; this.ensureSelectedSubscription() },
    setSort(sortBy) { this.filters.sortBy = sortBy; this.ensureSelectedSubscription() },
    selectSubscription(subscriptionId) { this.selectedSubscriptionId = subscriptionId; this.recentlySaved = false },
    ensureSelectedSubscription() {
      if (!this.filteredSubscriptions.some((subscription) => subscription.subscriptionId === this.selectedSubscriptionId)) {
        this.selectedSubscriptionId = this.filteredSubscriptions[0]?.subscriptionId ?? null
      }
    },
    updateSubscription(payload) {
      const index = this.subscriptions.findIndex((subscription) => subscription.subscriptionId === payload.subscriptionId)
      if (index === -1) return
      this.subscriptions[index] = { ...this.subscriptions[index], ...payload, updatedAt: '2026-03-31' }
      this.recentlySaved = true
      this.selectedSubscriptionId = payload.subscriptionId
      this.ensureSelectedSubscription()
    },
    toggleSubscriptionStatus(subscriptionId) {
      const target = this.subscriptions.find((subscription) => subscription.subscriptionId === subscriptionId)
      if (!target) return
      target.status = target.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      target.updatedAt = '2026-03-31'
      this.recentlySaved = true
      this.ensureSelectedSubscription()
    },
    deleteSubscription(subscriptionId) {
      this.subscriptions = this.subscriptions.filter((subscription) => subscription.subscriptionId !== subscriptionId)
      if (this.selectedSubscriptionId === subscriptionId) this.selectedSubscriptionId = this.filteredSubscriptions[0]?.subscriptionId ?? null
      this.ensureSelectedSubscription()
      this.recentlySaved = false
    },
  },
})
