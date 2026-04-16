import { defineStore } from 'pinia'
import {
  getPaymentCalendar,
  getPaymentDateDetails,
  getPaymentAnalytics,
} from '@/api/calendar'

const categoryDisplayNameMap = {
  OTT: 'OTT',
  Music: '음악',
  AI: 'AI',
  Cloud: '클라우드',
  Etc: '기타',
}

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (value) => String(value).padStart(2, '0')
const monthKeyFromDate = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`

const formatMonthLabel = (monthKey, locale, options) => {
  const [year, month] = monthKey.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, options).format(new Date(year, month - 1, 1))
}

const buildCalendarDays = (selectedMonthKey, selectedDate, summaryItems = []) => {
  const [year, month] = selectedMonthKey.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDate = new Date(year, month, 0).getDate()
  const startWeekday = firstDay.getDay()
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate()

  const summaryMap = new Map(
    summaryItems.map((item) => [
      `${year}-${pad(month)}-${pad(item.payDay)}`,
      item,
    ]),
  )

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
      payments: [],
      totalAmount: 0,
      totalCount: 0,
      itemNames: '',
    })
  }

  for (let day = 1; day <= lastDate; day += 1) {
    const dateKey = `${selectedMonthKey}-${pad(day)}`
    const summary = summaryMap.get(dateKey)

    days.push({
      dateKey,
      label: day,
      isCurrentMonth: true,
      isSelected: selectedDate === dateKey,
      payments: [],
      totalAmount: summary?.totalAmount ?? 0,
      totalCount: summary?.totalCount ?? 0,
      itemNames: summary?.itemNames ?? '',
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
      payments: [],
      totalAmount: 0,
      totalCount: 0,
      itemNames: '',
    })
  }

  return days
}

export const usePaymentCalendarStore = defineStore('paymentCalendar', {
  state: () => ({
    userId: 1, // 나중에 로그인 사용자 값으로 교체
    selectedMonthKey: '2026-03',
    selectedDate: '2026-03-03',
    trendView: 'MONTHLY',
    weekdayLabels,

    calendarSummary: {
      year: null,
      month: null,
      monthTotalAmount: 0,
      items: [],
    },

    selectedDateDetailList: [],
    categoryAnalysis: [],
  }),

  getters: {
    monthTotalAmount(state) {
      return state.calendarSummary.monthTotalAmount || 0
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

    calendarDays(state) {
      return buildCalendarDays(
        state.selectedMonthKey,
        state.selectedDate,
        state.calendarSummary.items,
      )
    },

    selectedDatePayments(state) {
      return state.selectedDateDetailList
    },

    selectedDateAmount() {
      return this.selectedDatePayments.reduce(
        (total, item) => total + Number(item.price || item.paymentAmount || 0),
        0,
      )
    },

    selectedDateLabel(state) {
      if (!state.selectedDate) return '-'
      const [, month, day] = state.selectedDate.split('-')
      return `${Number(month)}월 ${Number(day)}일`
    },

    dominantCategory(state) {
      return [...state.categoryAnalysis]
        .sort((a, b) => b.totalAmount - a.totalAmount)[0] || null
    },

    currentMonthCategorySummary(state) {
      return state.categoryAnalysis.map((item) => ({
        ...item,
        displayName: categoryDisplayNameMap[item.categoryName] || item.categoryName,
        colorClass: 'bg-category-etc',
      }))
    },

    activeTrendItems() {
      return []
    },

    maxTrendAmount() {
      return 0
    },

    currentMonthPaymentList() {
      return this.selectedDatePayments.map((item) => ({
        ...item,
        displayDateLabel: this.selectedDateLabel,
        categoryDisplayName: item.categoryName || '기타',
      }))
    },
  },

  actions: {
    async fetchCalendarSummary() {
      const [year, month] = this.selectedMonthKey.split('-').map(Number)

      const response = await getPaymentCalendar({
        userId: this.userId,
        year,
        month,
      })

      const data = response.data?.data || {}

      this.calendarSummary = {
        year: data.year ?? year,
        month: data.month ?? month,
        monthTotalAmount: data.monthTotalAmount ?? 0,
        items: data.items ?? [],
      }
    },

    async fetchSelectedDateDetails() {
      const [year, month, date] = this.selectedDate.split('-').map(Number)

      const response = await getPaymentDateDetails({
        userId: this.userId,
        year,
        month,
        date,
      })

      this.selectedDateDetailList = response.data?.data ?? response.data?.items ?? []
    },

    async fetchCategoryAnalysis() {
      const [year, month] = this.selectedMonthKey.split('-').map(Number)

      const response = await getPaymentAnalytics({
        userId: this.userId,
        year,
        month,
        rangeType: 'MONTH',
      })

      const data = response.data?.data || {}
      this.categoryAnalysis = data.categories ?? []
    },

    async fetchMonthPageData() {
      await Promise.all([
        this.fetchCalendarSummary(),
        this.fetchSelectedDateDetails(),
        this.fetchCategoryAnalysis(),
      ])
    },

    async setSelectedDate(dateKey) {
      this.selectedDate = dateKey
      await this.fetchSelectedDateDetails()
    },

    setTrendView(view) {
      this.trendView = view
    },

    async moveMonth(offset) {
      const [year, month] = this.selectedMonthKey.split('-').map(Number)
      const moved = new Date(year, month - 1 + offset, 1)
      const nextKey = monthKeyFromDate(moved)

      this.selectedMonthKey = nextKey
      this.selectedDate = `${nextKey}-01`

      await this.fetchMonthPageData()
    },
  },
})