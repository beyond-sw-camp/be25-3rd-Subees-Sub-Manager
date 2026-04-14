import { defineStore } from 'pinia'

const mockDashboard = {
  userSummary: {
    nickname: '민수',
    monthlyExpectedAmount: 248000,
    previousMonthChangeRate: 12.4,
    previousMonthAmount: 220700,
    activeSubscriptionCount: 12,
    potentialSavingsAmount: 12000,
    nextPaymentDate: '04/11',
    billingWindowLabel: '2026년 4월',
  },
  nextPayment: {
    subscriptionId: 1,
    subscriptionName: '넷플릭스',
    categoryName: 'OTT',
    categoryColor: '#BA6B52',
    serviceInitial: 'N',
    nextPaymentDate: '2026-04-11',
    paymentAmount: 17000,
    paymentCardName: '현대카드',
    dDay: 3,
    billingCycleLabel: '매월 결제',
  },
  upcomingSubscriptions: [
    {
      subscriptionId: 1,
      subscriptionName: '넷플릭스',
      categoryName: 'OTT',
      categoryColor: '#BA6B52',
      serviceInitial: 'N',
      nextPaymentDate: '04/11',
      paymentAmount: 17000,
      dDay: 3,
      paymentCardName: '현대카드',
    },
    {
      subscriptionId: 2,
      subscriptionName: 'ChatGPT',
      categoryName: 'AI',
      categoryColor: '#8A6A00',
      serviceInitial: 'C',
      nextPaymentDate: '04/12',
      paymentAmount: 29000,
      dDay: 4,
      paymentCardName: 'KB국민카드',
    },
    {
      subscriptionId: 3,
      subscriptionName: 'iCloud+',
      categoryName: 'Cloud',
      categoryColor: '#C7B895',
      serviceInitial: 'I',
      nextPaymentDate: '04/16',
      paymentAmount: 11000,
      dDay: 8,
      paymentCardName: '신한카드',
    },
    {
      subscriptionId: 4,
      subscriptionName: 'Spotify',
      categoryName: 'Music',
      categoryColor: '#5D8260',
      serviceInitial: 'S',
      nextPaymentDate: '04/18',
      paymentAmount: 10900,
      dDay: 10,
      paymentCardName: '삼성카드',
    },
  ],
  categorySpendSummary: [
    {
      categoryName: 'AI',
      totalAmount: 87000,
      ratio: 35,
      subscriptionCount: 4,
      colorHex: '#8A6A00',
      description: 'AI 도구 지출 비중',
    },
    {
      categoryName: 'Cloud',
      totalAmount: 62000,
      ratio: 25,
      subscriptionCount: 2,
      colorHex: '#C7B895',
      description: '클라우드/협업 도구 지출',
    },
    {
      categoryName: 'OTT',
      totalAmount: 52000,
      ratio: 21,
      subscriptionCount: 3,
      colorHex: '#BA6B52',
      description: 'OTT 구독 지출 비중',
    },
    {
      categoryName: 'Music',
      totalAmount: 30900,
      ratio: 12,
      subscriptionCount: 2,
      colorHex: '#5D8260',
      description: '음악 구독 지출 비중',
    },
    {
      categoryName: 'Etc',
      totalAmount: 16100,
      ratio: 7,
      subscriptionCount: 1,
      colorHex: '#998C71',
      description: '기타 생활형 구독 지출',
    },
  ],
  monthlySpendTrend: [
    { key: '2025-11', monthLabel: '11월', totalAmount: 182000 },
    { key: '2025-12', monthLabel: '12월', totalAmount: 196000 },
    { key: '2026-01', monthLabel: '1월', totalAmount: 207000 },
    { key: '2026-02', monthLabel: '2월', totalAmount: 221000 },
    { key: '2026-03', monthLabel: '3월', totalAmount: 238000 },
    { key: '2026-04', monthLabel: '4월', totalAmount: 248000, isCurrent: true },
  ],
  quickActions: [
    { title: '결제 캘린더', description: '날짜별 결제 예정 내역 확인', to: '/calendar', badge: '일정', iconText: '달력' },
    { title: '구독 추가', description: '새로운 구독 정보를 등록', to: '/subscriptions/new', badge: '핵심', iconText: '추가' },
    { title: '구독 목록', description: '전체 구독 항목과 카드 확인', to: '/subscriptions', badge: '관리', iconText: '목록' },
    { title: '커뮤니티', description: '다른 사용자의 구독 팁과 후기를 확인합니다.', to: '/community', badge: '탐색', iconText: '커뮤' },
    { title: 'FAQ', description: '자주 묻는 질문을 빠르게 찾습니다.', to: '/faq', badge: '지원', iconText: 'FAQ' },
  ],
  insights: [
    {
      key: 'top-category',
      tone: 'brand',
      title: 'AI 카테고리 비중이 가장 높습니다',
      description: '이번 달 전체 예상 지출의 35%가 AI 도구에 집중되어 있습니다. 업무용과 개인용 사용 목적을 분리해보면 절감 포인트를 찾기 쉽습니다.',
      to: '/calendar',
      actionLabel: '결제 캘린더 보기',
    },
    {
      key: 'upcoming-alert',
      tone: 'amber',
      title: '7일 이내 결제 예정 항목이 2건 있습니다',
      description: '이번 주 안에 넷플릭스와 ChatGPT 결제가 예정되어 있습니다. 카드 한도와 자동이체 상태를 미리 점검해두는 편이 안전합니다.',
      to: '/calendar',
      actionLabel: '결제 캘린더 보기',
    },
    {
      key: 'saving-chance',
      tone: 'emerald',
      title: '절감 가능 금액이 12,000원으로 추정됩니다',
      description: '중복 사용 가능성이 있는 항목 1건이 감지되었습니다. 사용 빈도를 점검하고 한 달만 정리해도 즉시 절감 효과를 볼 수 있습니다.',
      to: '/subscriptions',
      actionLabel: '구독 목록 보기',
    },
  ],
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    isLoading: false,
    ...mockDashboard,
  }),
  getters: {
    highestCategory(state) {
      return [...state.categorySpendSummary].sort((a, b) => b.totalAmount - a.totalAmount)[0]
    },
    totalCategoryAmount(state) {
      return state.categorySpendSummary.reduce((total, item) => total + item.totalAmount, 0)
    },
    averageMonthlySpend(state) {
      if (!state.monthlySpendTrend.length) return 0
      const total = state.monthlySpendTrend.reduce((sum, item) => sum + item.totalAmount, 0)
      return Math.round(total / state.monthlySpendTrend.length)
    },
  },
})
