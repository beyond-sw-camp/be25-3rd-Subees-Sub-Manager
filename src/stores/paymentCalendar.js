import { defineStore } from 'pinia'

const categoryDisplayNameMap = {
  OTT: 'OTT',
  Music: '음악',
  AI: 'AI',
  Cloud: '클라우드',
  Etc: '기타',
}

const monthDataset = {
  '2026-01': {
    totalAmount: 257200,
    categorySummary: [
      { categoryName: 'Music', totalAmount: 87000, subscriptionCount: 2, ratio: 34, colorClass: 'bg-category-music' },
      { categoryName: 'AI', totalAmount: 58000, subscriptionCount: 2, ratio: 23, colorClass: 'bg-category-ai' },
      { categoryName: 'Cloud', totalAmount: 54000, subscriptionCount: 2, ratio: 21, colorClass: 'bg-category-cloud' },
      { categoryName: 'OTT', totalAmount: 40200, subscriptionCount: 3, ratio: 16, colorClass: 'bg-category-ott' },
      { categoryName: 'Etc', totalAmount: 18000, subscriptionCount: 2, ratio: 6, colorClass: 'bg-category-etc' },
    ],
    payments: [
      { paymentId: 101, date: '2026-01-03', subscriptionName: 'Notion Plus', categoryName: 'Cloud', paymentAmount: 15000, paymentCardName: '국민카드' },
      { paymentId: 102, date: '2026-01-08', subscriptionName: 'Netflix Premium', categoryName: 'OTT', paymentAmount: 17000, paymentCardName: '현대카드' },
      { paymentId: 103, date: '2026-01-12', subscriptionName: 'ChatGPT Plus', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '신한카드' },
      { paymentId: 104, date: '2026-01-16', subscriptionName: 'Adobe Creative Cloud', categoryName: 'Cloud', paymentAmount: 54000, paymentCardName: '삼성카드' },
      { paymentId: 105, date: '2026-01-20', subscriptionName: 'Spotify Premium', categoryName: 'Music', paymentAmount: 10900, paymentCardName: '토스뱅크 카드' },
      { paymentId: 106, date: '2026-01-20', subscriptionName: 'Melon', categoryName: 'Music', paymentAmount: 9700, paymentCardName: '토스뱅크 카드' },
      { paymentId: 107, date: '2026-01-23', subscriptionName: 'Claude Pro', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '우리카드' },
      { paymentId: 108, date: '2026-01-27', subscriptionName: 'Disney+', categoryName: 'OTT', paymentAmount: 9900, paymentCardName: '현대카드' },
      { paymentId: 109, date: '2026-01-29', subscriptionName: 'Coupang Wow', categoryName: 'Etc', paymentAmount: 7890, paymentCardName: '카카오뱅크 카드' },
      { paymentId: 110, date: '2026-01-31', subscriptionName: '배민클럽', categoryName: 'Etc', paymentAmount: 10110, paymentCardName: '카카오뱅크 카드' },
    ],
  },
  '2026-02': {
    totalAmount: 241800,
    categorySummary: [
      { categoryName: 'Cloud', totalAmount: 59000, subscriptionCount: 2, ratio: 24, colorClass: 'bg-category-cloud' },
      { categoryName: 'AI', totalAmount: 58000, subscriptionCount: 2, ratio: 24, colorClass: 'bg-category-ai' },
      { categoryName: 'Etc', totalAmount: 48000, subscriptionCount: 3, ratio: 20, colorClass: 'bg-category-etc' },
      { categoryName: 'OTT', totalAmount: 45800, subscriptionCount: 3, ratio: 19, colorClass: 'bg-category-ott' },
      { categoryName: 'Music', totalAmount: 31000, subscriptionCount: 2, ratio: 13, colorClass: 'bg-category-music' },
    ],
    payments: [
      { paymentId: 201, date: '2026-02-02', subscriptionName: 'Coupang Wow', categoryName: 'Etc', paymentAmount: 7890, paymentCardName: '카카오뱅크 카드' },
      { paymentId: 202, date: '2026-02-06', subscriptionName: 'Wavve', categoryName: 'OTT', paymentAmount: 10900, paymentCardName: '현대카드' },
      { paymentId: 203, date: '2026-02-10', subscriptionName: 'Netflix Premium', categoryName: 'OTT', paymentAmount: 17000, paymentCardName: '현대카드' },
      { paymentId: 204, date: '2026-02-11', subscriptionName: 'ChatGPT Plus', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '신한카드' },
      { paymentId: 205, date: '2026-02-14', subscriptionName: 'Gemini Advanced', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '우리카드' },
      { paymentId: 206, date: '2026-02-16', subscriptionName: 'Adobe Creative Cloud', categoryName: 'Cloud', paymentAmount: 54000, paymentCardName: '삼성카드' },
      { paymentId: 207, date: '2026-02-18', subscriptionName: 'Spotify Premium', categoryName: 'Music', paymentAmount: 10900, paymentCardName: '토스뱅크 카드' },
      { paymentId: 208, date: '2026-02-20', subscriptionName: 'Melon', categoryName: 'Music', paymentAmount: 9700, paymentCardName: '토스뱅크 카드' },
      { paymentId: 209, date: '2026-02-23', subscriptionName: 'Disney+', categoryName: 'OTT', paymentAmount: 17900, paymentCardName: '현대카드' },
      { paymentId: 210, date: '2026-02-26', subscriptionName: 'Notion Plus', categoryName: 'Cloud', paymentAmount: 5000, paymentCardName: '국민카드' },
      { paymentId: 211, date: '2026-02-28', subscriptionName: '배민클럽', categoryName: 'Etc', paymentAmount: 4010, paymentCardName: '카카오뱅크 카드' },
    ],
  },
  '2026-03': {
    totalAmount: 259800,
    categorySummary: [
      { categoryName: 'Music', totalAmount: 190000, subscriptionCount: 2, ratio: 73, colorClass: 'bg-category-music' },
      { categoryName: 'AI', totalAmount: 24000, subscriptionCount: 1, ratio: 9, colorClass: 'bg-category-ai' },
      { categoryName: 'OTT', totalAmount: 24000, subscriptionCount: 2, ratio: 9, colorClass: 'bg-category-ott' },
      { categoryName: 'Cloud', totalAmount: 24000, subscriptionCount: 1, ratio: 9, colorClass: 'bg-category-cloud' },
    ],
    payments: [
      { paymentId: 301, date: '2026-03-03', subscriptionName: 'Coupang Wow', categoryName: 'Etc', paymentAmount: 7890, paymentCardName: '카카오뱅크 카드' },
      { paymentId: 302, date: '2026-03-08', subscriptionName: 'Netflix Premium', categoryName: 'OTT', paymentAmount: 17000, paymentCardName: '현대카드' },
      { paymentId: 303, date: '2026-03-11', subscriptionName: 'ChatGPT Plus', categoryName: 'AI', paymentAmount: 24000, paymentCardName: '신한카드' },
      { paymentId: 304, date: '2026-03-14', subscriptionName: 'Spotify Premium', categoryName: 'Music', paymentAmount: 110000, paymentCardName: '토스뱅크 카드' },
      { paymentId: 305, date: '2026-03-14', subscriptionName: 'Melon Family', categoryName: 'Music', paymentAmount: 80000, paymentCardName: '토스뱅크 카드' },
      { paymentId: 306, date: '2026-03-16', subscriptionName: 'Adobe Creative Cloud', categoryName: 'Cloud', paymentAmount: 24000, paymentCardName: '삼성카드' },
      { paymentId: 307, date: '2026-03-19', subscriptionName: 'Disney+', categoryName: 'OTT', paymentAmount: 7000, paymentCardName: '현대카드' },
      { paymentId: 308, date: '2026-03-27', subscriptionName: 'Notion Plus', categoryName: 'Cloud', paymentAmount: 0, paymentCardName: '국민카드' },
      { paymentId: 309, date: '2026-03-29', subscriptionName: '배민클럽', categoryName: 'Etc', paymentAmount: 14910, paymentCardName: '카카오뱅크 카드' },
    ],
  },
  '2026-04': {
    totalAmount: 248000,
    categorySummary: [
      { categoryName: 'AI', totalAmount: 87000, subscriptionCount: 3, ratio: 35, colorClass: 'bg-category-ai' },
      { categoryName: 'Cloud', totalAmount: 62000, subscriptionCount: 2, ratio: 25, colorClass: 'bg-category-cloud' },
      { categoryName: 'OTT', totalAmount: 52000, subscriptionCount: 3, ratio: 21, colorClass: 'bg-category-ott' },
      { categoryName: 'Music', totalAmount: 30900, subscriptionCount: 2, ratio: 12, colorClass: 'bg-category-music' },
      { categoryName: 'Etc', totalAmount: 16100, subscriptionCount: 1, ratio: 7, colorClass: 'bg-category-etc' },
    ],
    payments: [
      { paymentId: 401, date: '2026-04-02', subscriptionName: 'Coupang Wow', categoryName: 'Etc', paymentAmount: 7890, paymentCardName: '카카오뱅크 카드' },
      { paymentId: 402, date: '2026-04-11', subscriptionName: 'Netflix Premium', categoryName: 'OTT', paymentAmount: 17000, paymentCardName: '현대카드' },
      { paymentId: 403, date: '2026-04-12', subscriptionName: 'ChatGPT Plus', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '신한카드' },
      { paymentId: 404, date: '2026-04-16', subscriptionName: 'Adobe Creative Cloud', categoryName: 'Cloud', paymentAmount: 54000, paymentCardName: '삼성카드' },
      { paymentId: 405, date: '2026-04-18', subscriptionName: 'Spotify Premium', categoryName: 'Music', paymentAmount: 10900, paymentCardName: '토스뱅크 카드' },
      { paymentId: 406, date: '2026-04-20', subscriptionName: 'Claude Pro', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '우리카드' },
      { paymentId: 407, date: '2026-04-22', subscriptionName: 'Melon', categoryName: 'Music', paymentAmount: 9700, paymentCardName: '토스뱅크 카드' },
      { paymentId: 408, date: '2026-04-23', subscriptionName: 'Disney+', categoryName: 'OTT', paymentAmount: 17900, paymentCardName: '현대카드' },
      { paymentId: 409, date: '2026-04-26', subscriptionName: 'Notion Plus', categoryName: 'Cloud', paymentAmount: 8000, paymentCardName: '국민카드' },
      { paymentId: 410, date: '2026-04-29', subscriptionName: 'Gemini Advanced', categoryName: 'AI', paymentAmount: 29000, paymentCardName: '우리카드' },
      { paymentId: 411, date: '2026-04-30', subscriptionName: 'Tving', categoryName: 'OTT', paymentAmount: 17100, paymentCardName: '현대카드' },
    ],
  },
}

const monthlyTrend = [
  { key: '2026-01', label: '1월', totalAmount: 257200 },
  { key: '2026-02', label: '2월', totalAmount: 241800 },
  { key: '2026-03', label: '3월', totalAmount: 259800 },
  { key: '2026-04', label: '4월', totalAmount: 248000 },
  { key: '2026-05', label: '5월', totalAmount: 231500 },
  { key: '2026-06', label: '6월', totalAmount: 245200 },
]

const yearlyTrend = [
  { key: '2022', label: '2022', totalAmount: 730000 },
  { key: '2023', label: '2023', totalAmount: 910000 },
  { key: '2024', label: '2024', totalAmount: 1080000 },
  { key: '2025', label: '2025', totalAmount: 1265000 },
  { key: '2026', label: '2026', totalAmount: 1483000 },
  { key: '2027', label: '2027', totalAmount: 1520000 },
]

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const pad = (value) => String(value).padStart(2, '0')
const monthKeyFromDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

const formatMonthLabel = (monthKey, locale, options) => {
  const [year, month] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, options).format(new Date(year, month - 1, 1))
}

const buildCalendarDays = (selectedMonthKey, selectedDate, payments) => {
  const [year, month] = selectedMonthKey.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDate = new Date(year, month, 0).getDate()
  const startWeekday = firstDay.getDay()
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate()
  const paymentMap = payments.reduce((map, payment) => {
    const bucket = map.get(payment.date) || []
    bucket.push(payment)
    map.set(payment.date, bucket)
    return map
  }, new Map())

  const days = []

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const day = prevMonthLastDate - i
    const date = new Date(year, month - 2, day)
    const dateKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    days.push({
      dateKey,
      label: day,
      isCurrentMonth: false,
      isSelected: selectedDate === dateKey,
      payments: paymentMap.get(dateKey) || [],
      totalAmount: (paymentMap.get(dateKey) || []).reduce((total, item) => total + item.paymentAmount, 0),
    })
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const dateKey = `${selectedMonthKey}-${pad(day)}`
    days.push({
      dateKey,
      label: day,
      isCurrentMonth: true,
      isSelected: selectedDate === dateKey,
      payments: paymentMap.get(dateKey) || [],
      totalAmount: (paymentMap.get(dateKey) || []).reduce((total, item) => total + item.paymentAmount, 0),
    })
  }

  const nextDaysCount = 42 - days.length
  for (let day = 1; day <= nextDaysCount; day += 1) {
    const date = new Date(year, month, day)
    const dateKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    days.push({
      dateKey,
      label: day,
      isCurrentMonth: false,
      isSelected: selectedDate === dateKey,
      payments: paymentMap.get(dateKey) || [],
      totalAmount: (paymentMap.get(dateKey) || []).reduce((total, item) => total + item.paymentAmount, 0),
    })
  }

  return days
}

export const usePaymentCalendarStore = defineStore('paymentCalendar', {
  state: () => ({
    selectedMonthKey: '2026-03',
    selectedDate: '2026-03-14',
    trendView: 'MONTHLY',
    monthDataset,
    monthlyTrend,
    yearlyTrend,
    weekdayLabels,
  }),
  getters: {
    currentMonth(state) {
      return state.monthDataset[state.selectedMonthKey]
    },
    monthTotalAmount() {
      return this.currentMonth?.totalAmount || 0
    },
    currentMonthLabel() {
      return `${formatMonthLabel(this.selectedMonthKey, 'ko-KR', { month: 'long' })} 소비 현황`
    },
    currentMonthTitle() {
      return formatMonthLabel(this.selectedMonthKey, 'en-US', { month: 'long', year: 'numeric' })
    },
    currentMonthShortLabel() {
      return formatMonthLabel(this.selectedMonthKey, 'ko-KR', { month: 'long' })
    },
    selectedMonthPayments() {
      return this.currentMonth?.payments || []
    },
    calendarDays() {
      return buildCalendarDays(this.selectedMonthKey, this.selectedDate, this.selectedMonthPayments)
    },
    selectedDatePayments() {
      return this.selectedMonthPayments.filter((payment) => payment.date === this.selectedDate)
    },
    selectedDateAmount() {
      return this.selectedDatePayments.reduce((total, payment) => total + payment.paymentAmount, 0)
    },
    selectedDateLabel() {
      if (!this.selectedDate) return '-'
      const [, month, day] = this.selectedDate.split('-')
      return `${Number(month)}월 ${Number(day)}일`
    },
    dominantCategory() {
      return [...(this.currentMonth?.categorySummary || [])].sort((a, b) => b.totalAmount - a.totalAmount)[0] || null
    },
    currentMonthCategorySummary() {
      return (this.currentMonth?.categorySummary || []).map((item) => ({
        ...item,
        displayName: categoryDisplayNameMap[item.categoryName] || item.categoryName,
      }))
    },
    currentMonthPaymentList() {
      return [...this.selectedMonthPayments].sort((a, b) => a.date.localeCompare(b.date)).map((item) => ({
        ...item,
        displayDateLabel: (() => {
          const [, month, day] = item.date.split('-')
          return `${Number(month)}월 ${Number(day)}일`
        })(),
        categoryDisplayName: categoryDisplayNameMap[item.categoryName] || item.categoryName,
      }))
    },
    activeTrendItems(state) {
      return state.trendView === 'YEARLY' ? state.yearlyTrend : state.monthlyTrend
    },
    maxTrendAmount() {
      return Math.max(...this.activeTrendItems.map((item) => item.totalAmount), 1)
    },
  },
  actions: {
    setSelectedDate(dateKey) {
      this.selectedDate = dateKey
    },
    setTrendView(view) {
      this.trendView = view
    },
    moveMonth(offset) {
      const [year, month] = this.selectedMonthKey.split('-').map(Number)
      const moved = new Date(year, month - 1 + offset, 1)
      const nextKey = monthKeyFromDate(moved)
      if (!this.monthDataset[nextKey]) return
      this.selectedMonthKey = nextKey
      const firstPayment = this.monthDataset[nextKey].payments[0]
      this.selectedDate = firstPayment?.date || `${nextKey}-01`
    },
  },
})
