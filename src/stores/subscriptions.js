import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  getSubscription as fetchSubscriptionsApi,
  getSubscriptionDetail as fetchSubscriptionDetailApi,
  updateSubscription as updateSubscriptionApi,
  deleteSubscription as deleteSubscriptionApi,
} from '@/api/subscription'

export const useSubscriptionsStore = defineStore('subscriptions', () => {
  const subscriptions = ref([])
  const selectedSubscription = ref(null)

  const filters = ref({
    query: '',
    categoryName: '전체',
    sortBy: 'latest',
  })

  const loading = ref(false)
  const error = ref('')

  const normalizeBillingCycle = (billingCycle) => {
    if (billingCycle === '1Y' || billingCycle === 'YEARLY') return 'YEARLY'
    if (billingCycle === '1M' || billingCycle === 'MONTHLY') return 'MONTHLY'
    return billingCycle || 'MONTHLY'
  }

  const mapSubscription = (item) => ({
    subscriptionId: item?.subscriptionId ?? null,
    categoryName: item?.categoryName ?? '',
    subscriptionName: item?.subscriptionName ?? '',
    paymentAmount: Number(item?.paymentAmount ?? 0),
    billingCycle: normalizeBillingCycle(item?.billingCycle),
    paymentCardName: item?.paymentCardName ?? '',
    paymentStartDate: item?.paymentStartDate ?? '',
    nextPaymentDate: item?.nextPaymentDate ?? '',
    registeredAt: item?.registeredAt ?? item?.createdAt ?? '',
    note: item?.note ?? '',
    status: item?.status ?? 'ACTIVE',
  })

  const loadSubscriptions = async () => {
    loading.value = true
    error.value = ''

    try {
      const response = await fetchSubscriptionsApi()
      const list = response.data?.data ?? []

      subscriptions.value = list.map(mapSubscription)
      selectedSubscription.value = subscriptions.value[0] ?? null
    } catch (e) {
      console.error(e)
      error.value = '구독 목록을 불러오지 못했습니다.'
      subscriptions.value = []
      selectedSubscription.value = null
    } finally {
      loading.value = false
    }
  }

  const selectSubscription = async (item) => {
    try {
      const response = await fetchSubscriptionDetailApi(item.subscriptionId)
      const detail = response.data?.data ?? item
      selectedSubscription.value = mapSubscription(detail)
    } catch (e) {
      console.error(e)
      selectedSubscription.value = mapSubscription(item)
    }
  }

  const setQuery = (query) => {
    filters.value.query = query
  }

  const setCategory = (categoryName) => {
    filters.value.categoryName = categoryName
  }

  const setSort = (sortBy) => {
    filters.value.sortBy = sortBy
  }

  const categories = computed(() => {
    const names = subscriptions.value.map((item) => item.categoryName).filter(Boolean)
    return ['전체', ...new Set(names)]
  })

  const filteredSubscriptions = computed(() => {
    let result = [...subscriptions.value]

    if (filters.value.query.trim()) {
      const keyword = filters.value.query.trim().toLowerCase()
      result = result.filter((item) =>
        String(item.subscriptionName || '').toLowerCase().includes(keyword)
      )
    }

    if (filters.value.categoryName !== '전체') {
      result = result.filter((item) => item.categoryName === filters.value.categoryName)
    }

    if (filters.value.sortBy === 'latest') {
      result.sort((a, b) => (b.subscriptionId || 0) - (a.subscriptionId || 0))
    } else if (filters.value.sortBy === 'price-high') {
      result.sort((a, b) => (b.paymentAmount || 0) - (a.paymentAmount || 0))
    } else if (filters.value.sortBy === 'price-low') {
      result.sort((a, b) => (a.paymentAmount || 0) - (b.paymentAmount || 0))
    }

    return result
  })

  const totalCount = computed(() => subscriptions.value.length)

  const activeCount = computed(() =>
    subscriptions.value.filter((item) => item.status === 'ACTIVE').length
  )

  const pausedCount = computed(() =>
    subscriptions.value.filter((item) => item.status === 'PAUSED').length
  )

  const monthlyExpectedAmount = computed(() => {
    return subscriptions.value
      .filter((item) => item.status !== 'PAUSED')
      .reduce((sum, item) => {
        if (item.billingCycle === 'YEARLY') {
          return sum + Math.floor((item.paymentAmount || 0) / 12)
        }
        return sum + (item.paymentAmount || 0)
      }, 0)
  })

  const buildUpdatePayload = (payload) => {
    return {
      categoryName: payload.categoryName,
      subscriptionName: payload.subscriptionName,
      paymentAmount: Number(payload.paymentAmount || 0),
      billingCycle: payload.billingCycle === 'YEARLY' ? '1Y' : '1M',
      paymentCardName: payload.paymentCardName,
      paymentStartDate: payload.paymentStartDate,
      nextPaymentDate: payload.nextPaymentDate,
      note: payload.note,
      status: payload.status,
    }
  }

  const updateSubscription = async (payload) => {
    if (!payload?.subscriptionId) return

    try {
      const requestBody = buildUpdatePayload(payload)
      const response = await updateSubscriptionApi(payload.subscriptionId, requestBody)

      const updatedItem = mapSubscription({
        ...payload,
        ...requestBody,
        billingCycle: payload.billingCycle,
      })

      const index = subscriptions.value.findIndex(
        (item) => item.subscriptionId === payload.subscriptionId
      )

      if (index !== -1) {
        subscriptions.value[index] = {
          ...subscriptions.value[index],
          ...updatedItem,
        }
      }

      if (selectedSubscription.value?.subscriptionId === payload.subscriptionId) {
        selectedSubscription.value = {
          ...selectedSubscription.value,
          ...updatedItem,
        }
      }

      return response
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const deleteSubscription = async (subscriptionId) => {
    try {
      await deleteSubscriptionApi(subscriptionId)

      subscriptions.value = subscriptions.value.filter(
        (item) => item.subscriptionId !== subscriptionId
      )

      if (selectedSubscription.value?.subscriptionId === subscriptionId) {
        selectedSubscription.value = subscriptions.value[0] ?? null
      }
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  const toggleSubscriptionStatus = async ({ subscriptionId, status }) => {
    const target = subscriptions.value.find((item) => item.subscriptionId === subscriptionId)
    if (!target) return

    await updateSubscription({
      ...target,
      status,
    })
  }

  return {
    subscriptions,
    selectedSubscription,
    filters,
    categories,
    filteredSubscriptions,
    totalCount,
    activeCount,
    pausedCount,
    monthlyExpectedAmount,
    loading,
    error,
    loadSubscriptions,
    selectSubscription,
    setQuery,
    setCategory,
    setSort,
    updateSubscription,
    deleteSubscription,
    toggleSubscriptionStatus,
  }
})