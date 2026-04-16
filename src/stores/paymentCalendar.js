import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getPaymentCalendar,
  getPaymentDateDetails,
  getPaymentAnalytics,
} from '@/api/calendar'

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const CATEGORY_META = {
  OTT: { displayName: 'OTT', colorClass: 'bg-[#F2A6A6]' },
  Music: { displayName: '음악', colorClass: 'bg-[#F7C66C]' },
  AI: { displayName: 'AI', colorClass: 'bg-[#8EC5FC]' },
  Cloud: { displayName: '클라우드', colorClass: 'bg-[#A8E6CF]' },
  Etc: { displayName: '기타', colorClass: 'bg-[#CDB4DB]' },
}

const formatMonthLabel = (year, month) => `${year}년 ${month}월`
const formatShortMonthLabel = (year, month) => `${month}월`

const formatDateKey = (year, month, day) => {
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

const formatDateLabel = (dateKey) => {
  if (!dateKey) return '날짜를 선택해주세요'

  const [year, month, day] = dateKey.split('-')
  return `${year}년 ${Number(month)}월 ${Number(day)}일`
}

const normalizeSinglePayload = (response) => {
  const root = response?.data ?? response
  return root?.data ?? root?.items?.[0] ?? null
}

const normalizeArrayPayload = (response) => {
  const root = response?.data ?? response
  return root?.data ?? root?.items ?? []
}

const buildCalendarMatrix = (year, month, items, selectedDateKey) => {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  const firstWeekday = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const prevMonthLastDate = new Date(year, month - 1, 0).getDate()

  const summaryMap = new Map()

  ;(items || []).forEach((item) => {
    summaryMap.set(Number(item.payDay), {
      payDay: Number(item.payDay),
      totalCount: Number(item.totalCount || 0),
      totalAmount: Number(item.totalAmount || 0),
      itemNames: item.itemNames || '',
    })
  })

  const result = []

  for (let i = 0; i < firstWeekday; i += 1) {
    const prevDay = prevMonthLastDate - firstWeekday + i + 1
    const prevDate = new Date(year, month - 2, prevDay)

    result.push({
      dateKey: formatDateKey(
        prevDate.getFullYear(),
        prevDate.getMonth() + 1,
        prevDate.getDate(),
      ),
      label: prevDay,
      isCurrentMonth: false,
      isSelected: false,
      totalCount: 0,
      totalAmount: 0,
      itemNames: '',
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const matched = summaryMap.get(day)
    const dateKey = formatDateKey(year, month, day)

    result.push({
      dateKey,
      label: day,
      isCurrentMonth: true,
      isSelected: selectedDateKey === dateKey,
      totalCount: matched?.totalCount || 0,
      totalAmount: matched?.totalAmount || 0,
      itemNames: matched?.itemNames || '',
    })
  }

  const remain = result.length % 7 === 0 ? 0 : 7 - (result.length % 7)

  for (let day = 1; day <= remain; day += 1) {
    const nextDate = new Date(year, month, day)

    result.push({
      dateKey: formatDateKey(
        nextDate.getFullYear(),
        nextDate.getMonth() + 1,
        nextDate.getDate(),
      ),
      label: day,
      isCurrentMonth: false,
      isSelected: false,
      totalCount: 0,
      totalAmount: 0,
      itemNames: '',
    })
  }

  return result
}

export const usePaymentCalendarStore = defineStore('paymentCalendar', () => {
  const now = new Date()

  const currentYear = ref(now.getFullYear())
  const currentMonth = ref(now.getMonth() + 1)
  const selectedDateKey = ref(formatDateKey(now.getFullYear(), now.getMonth() + 1, 1))

  const calendarSummary = ref({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    monthTotalAmount: 0,
    items: [],
  })

  const categoryAnalytics = ref({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    rangeType: 'MONTH',
    totalAmount: 0,
    categories: [],
  })

  const selectedDateDetailList = ref([])

  const isLoading = ref(false)
  const errorMessage = ref('')
  const trendView = ref('DAY')

  const weekdayLabels = ref(WEEKDAY_LABELS)

  const currentMonthLabel = computed(() =>
    formatMonthLabel(currentYear.value, currentMonth.value),
  )

  const currentMonthTitle = computed(() =>
    formatMonthLabel(currentYear.value, currentMonth.value),
  )

  const currentMonthShortLabel = computed(() =>
    formatShortMonthLabel(currentYear.value, currentMonth.value),
  )

  const monthTotalAmount = computed(() =>
    Number(calendarSummary.value?.monthTotalAmount || 0),
  )

  const calendarItems = computed(() => calendarSummary.value?.items || [])

  const calendarDays = computed(() =>
    buildCalendarMatrix(
      currentYear.value,
      currentMonth.value,
      calendarItems.value,
      selectedDateKey.value,
    ),
  )

  const selectedDateLabel = computed(() => formatDateLabel(selectedDateKey.value))

const selectedDatePayments = computed(() => {
  return (selectedDateDetailList.value || []).map((item, index) => {
    const rawCardName =
      item.customCardCompany ||
      item.cardCompany ||
      item.cardName ||
      ''

    return {
      id:
        item.subscriptionId ||
        item.id ||
        `${selectedDateKey.value}-${index}`,

      name:
        item.itemName ||
        item.subscriptionName ||
        item.serviceName ||
        item.name ||
        '구독 서비스',

      amount: Number(
        item.price ||
        item.amount ||
        item.paymentAmount ||
        0,
      ),

      cardCompany: rawCardName || '카드',

      cardLabel: rawCardName
        ? `${rawCardName}로 결제 예정`
        : '등록 카드로 결제 예정',
    }
  })
})

  const selectedDateAmount = computed(() =>
    selectedDatePayments.value.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    ),
  )

  const currentMonthCategorySummary = computed(() => {
    const categories = categoryAnalytics.value?.categories || []
    const totalAmount = Number(
      categoryAnalytics.value?.totalAmount || monthTotalAmount.value || 0,
    )

    return categories.map((item) => {
      const meta = CATEGORY_META[item.categoryName] || {
        displayName: item.categoryName,
        colorClass: 'bg-[#D9D9D9]',
      }

      const ratio =
        item.ratio != null
          ? Number(item.ratio)
          : totalAmount > 0
            ? Number(((Number(item.totalAmount || 0) / totalAmount) * 100).toFixed(1))
            : 0

      return {
        categoryName: item.categoryName,
        displayName: meta.displayName,
        colorClass: meta.colorClass,
        totalAmount: Number(item.totalAmount || 0),
        subscriptionCount: Number(item.subscriptionCount || 0),
        ratio,
      }
    })
  })

  const dominantCategory = computed(() => {
    if (!currentMonthCategorySummary.value.length) return null

    return [...currentMonthCategorySummary.value].sort(
      (a, b) => b.totalAmount - a.totalAmount,
    )[0]
  })

  const activeTrendItems = computed(() =>
    (calendarItems.value || []).map((item) => ({
      label: `${item.payDay}일`,
      amount: Number(item.totalAmount || 0),
    })),
  )

  const maxTrendAmount = computed(() => {
    if (!activeTrendItems.value.length) return 0
    return Math.max(...activeTrendItems.value.map((item) => item.amount))
  })

  const currentMonthPaymentList = computed(() =>
    selectedDatePayments.value.length
      ? selectedDatePayments.value
      : (calendarItems.value || []).map((item, index) => ({
          id: `summary-${index}`,
          name: item.itemNames || '구독 서비스',
          amount: Number(item.totalAmount || 0),
          payDay: Number(item.payDay || 0),
        })),
  )

  const setTrendView = (view) => {
    trendView.value = view
  }

  const fetchCalendar = async () => {
    const response = await getPaymentCalendar({
      year: currentYear.value,
      month: currentMonth.value,
    })

    console.log('calendar-summary 응답:', response?.data)

    const normalized = normalizeSinglePayload(response)

    calendarSummary.value = normalized || {
      year: currentYear.value,
      month: currentMonth.value,
      monthTotalAmount: 0,
      items: [],
    }
  }

  const fetchAnalytics = async () => {
    const response = await getPaymentAnalytics({
      year: currentYear.value,
      month: currentMonth.value,
      rangeType: 'MONTH',
    })

    console.log('analysis/categories 응답:', response?.data)

    const normalized = normalizeSinglePayload(response)

    categoryAnalytics.value = normalized || {
      year: currentYear.value,
      month: currentMonth.value,
      rangeType: 'MONTH',
      totalAmount: 0,
      categories: [],
    }
  }

  const fetchSelectedDateDetails = async () => {
    if (!selectedDateKey.value) {
      selectedDateDetailList.value = []
      return
    }

    const [, , date] = selectedDateKey.value.split('-')

    const response = await getPaymentDateDetails({
      year: currentYear.value,
      month: currentMonth.value,
      date: Number(date),
    })

    console.log('date-details 응답:', response?.data)

    const normalized = normalizeArrayPayload(response)
    selectedDateDetailList.value = normalized || []
  }

  const fetchAll = async () => {
    try {
      isLoading.value = true
      errorMessage.value = ''

      await Promise.all([fetchCalendar(), fetchAnalytics()])
      await fetchSelectedDateDetails()
    } catch (error) {
      console.error('paymentCalendar fetchAll 실패:', error)
      errorMessage.value = '캘린더 데이터를 불러오지 못했습니다.'
      calendarSummary.value = {
        year: currentYear.value,
        month: currentMonth.value,
        monthTotalAmount: 0,
        items: [],
      }
      categoryAnalytics.value = {
        year: currentYear.value,
        month: currentMonth.value,
        rangeType: 'MONTH',
        totalAmount: 0,
        categories: [],
      }
      selectedDateDetailList.value = []
    } finally {
      isLoading.value = false
    }
  }

  const setSelectedDate = async (dateKey) => {
    const [year, month] = dateKey.split('-').map(Number)

    if (year !== currentYear.value || month !== currentMonth.value) {
      return
    }

    selectedDateKey.value = dateKey

    try {
      isLoading.value = true
      await fetchSelectedDateDetails()
    } catch (error) {
      console.error('선택 날짜 상세 조회 실패:', error)
      selectedDateDetailList.value = []
    } finally {
      isLoading.value = false
    }
  }

  const moveMonth = async (offset) => {
    const next = new Date(currentYear.value, currentMonth.value - 1 + offset, 1)

    currentYear.value = next.getFullYear()
    currentMonth.value = next.getMonth() + 1
    selectedDateKey.value = formatDateKey(currentYear.value, currentMonth.value, 1)

    await fetchAll()
  }

  return {
    currentYear,
    currentMonth,
    selectedDateKey,
    isLoading,
    errorMessage,
    weekdayLabels,
    currentMonthLabel,
    currentMonthTitle,
    currentMonthShortLabel,
    monthTotalAmount,
    dominantCategory,
    currentMonthCategorySummary,
    calendarDays,
    selectedDatePayments,
    selectedDateAmount,
    selectedDateLabel,
    activeTrendItems,
    maxTrendAmount,
    trendView,
    currentMonthPaymentList,
    setTrendView,
    setSelectedDate,
    fetchCalendar,
    fetchAnalytics,
    fetchSelectedDateDetails,
    fetchAll,
    moveMonth,
  }
})