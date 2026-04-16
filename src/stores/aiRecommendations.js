import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  deleteRecommend,
  getRecommendDetail,
  getRecommendList,
  postRecommendGenerate,
  postRecommendSave,
  postRecommendSubmit,
} from '@/api/recommend'

const DRAFT_KEY = 'subees-ai-recommend-draft-v4'
const ACTIVE_REPORT_KEY = 'subees-ai-recommend-active-v4'

const CATEGORY_OPTIONS = ['AI', '생산성', '디자인', '클라우드', '기타']
const SERVICE_LIBRARY = [
  { name: 'ChatGPT Plus', category: 'AI', monthlyPrice: 29000, description: '문서 작성, 정리, 자동화에 넓게 쓰기 좋습니다.' },
  { name: 'Claude Pro', category: 'AI', monthlyPrice: 29000, description: '긴 문서 요약과 비교 검토에 강점이 있습니다.' },
  { name: 'Gemini Advanced', category: 'AI', monthlyPrice: 29000, description: '리서치와 검색 기반 정리에 적합합니다.' },
  { name: 'Notion AI', category: '생산성', monthlyPrice: 16000, description: '문서 협업과 회의 요약에 활용할 수 있습니다.' },
  { name: 'Perplexity Pro', category: 'AI', monthlyPrice: 29000, description: '검색과 출처 확인이 필요한 업무에 적합합니다.' },
]

const DEFAULT_DRAFT = {
  reportTitle: '',
  requestNote: '',
  maxMonthlyBudget: 0,
  mandatoryItems: [],
  optionalItems: [],
  subscriptionItems: [],
}

const clone = (value) => JSON.parse(JSON.stringify(value))
const pad = (value) => String(value).padStart(2, '0')
const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
const toNumber = (value) => Number(value || 0) || 0
const normalizeText = (value) => String(value || '').trim()
const normalizeList = (list) => [...new Set((Array.isArray(list) ? list : []).map(normalizeText).filter(Boolean))]

const loadJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

const toDateLabel = (value) => {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

const normalizeSubscriptionItems = (items = []) => items
  .map((item, index) => ({
    itemId: item.itemId || createId('item'),
    serviceName: normalizeText(item.serviceName),
    category: normalizeText(item.category) || '기타',
    monthlyPrice: toNumber(item.monthlyPrice),
    description: normalizeText(item.description),
    sortOrder: toNumber(item.sortOrder) || index + 1,
  }))
  .filter((item) => item.serviceName)

const totalPriceOf = (items = []) => items.reduce((sum, item) => sum + toNumber(item.monthlyPrice), 0)

const parseItemsJson = (value) => {
  try {
    return normalizeList(JSON.parse(value || '[]'))
  } catch {
    return []
  }
}

const normalizeReport = (payload = {}) => ({
  reportId: payload.reportId ?? null,
  reportTitle: normalizeText(payload.reportTitle),
  requestNote: normalizeText(payload.requestNote),
  generatedContent: normalizeText(payload.generatedContent),
  totalMonthlyPrice: toNumber(payload.totalMonthlyPrice),
  maxMonthlyBudget: toNumber(payload.maxMonthlyBudget),
  mandatoryItemsJson: typeof payload.mandatoryItemsJson === 'string' ? payload.mandatoryItemsJson : JSON.stringify(normalizeList(payload.mandatoryItems || [])),
  optionalItemsJson: typeof payload.optionalItemsJson === 'string' ? payload.optionalItemsJson : JSON.stringify(normalizeList(payload.optionalItems || [])),
  reportStatus: normalizeText(payload.reportStatus) || 'SUBMITTED',
  createdAt: payload.createdAt || new Date().toISOString(),
  updatedAt: payload.updatedAt || payload.createdAt || new Date().toISOString(),
  subscriptionItems: normalizeSubscriptionItems(payload.subscriptionItems || []),
})

const toSubmitPayload = (draft = {}) => ({
  reportTitle: normalizeText(draft.reportTitle),
  requestNote: normalizeText(draft.requestNote),
  maxMonthlyBudget: toNumber(draft.maxMonthlyBudget),
  mandatoryItems: normalizeList(draft.mandatoryItems),
  optionalItems: normalizeList(draft.optionalItems),
  subscriptionItems: normalizeSubscriptionItems(draft.subscriptionItems).map((item) => ({
    serviceName: item.serviceName,
    category: item.category,
    monthlyPrice: item.monthlyPrice,
    description: item.description,
  })),
})

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback

export const useAiRecommendationsStore = defineStore('aiRecommendations', () => {
  const draft = ref({ ...clone(DEFAULT_DRAFT), ...loadJson(DRAFT_KEY, {}) })
  const reports = ref([])
  const activeReportId = ref(loadJson(ACTIVE_REPORT_KEY, null))
  const statusMessage = ref('')
  const errorMessage = ref('')
  const isFetchingList = ref(false)
  const isFetchingDetail = ref(false)
  const isSubmitting = ref(false)

  const reportList = computed(() => [...reports.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
  const currentReport = computed(() => reportList.value.find((item) => String(item.reportId) === String(activeReportId.value)) || null)
  const generatedReports = computed(() => reportList.value.filter((item) => item.reportStatus === 'GENERATED'))
  const savedReports = computed(() => reportList.value.filter((item) => item.reportStatus === 'SAVED'))
  const draftTotalPrice = computed(() => totalPriceOf(draft.value.subscriptionItems || []))

  const persistDraft = () => saveJson(DRAFT_KEY, draft.value)
  const persistActive = () => saveJson(ACTIVE_REPORT_KEY, activeReportId.value)

  const clearMessages = () => {
    statusMessage.value = ''
    errorMessage.value = ''
  }

  const setStatusMessage = (message = '') => {
    statusMessage.value = message
    errorMessage.value = ''
  }

  const setErrorMessage = (message = '') => {
    errorMessage.value = message
    statusMessage.value = ''
  }

  const updateDraft = (payload = {}) => {
    draft.value = {
      ...draft.value,
      ...payload,
      reportTitle: normalizeText(payload.reportTitle ?? draft.value.reportTitle),
      requestNote: normalizeText(payload.requestNote ?? draft.value.requestNote),
      maxMonthlyBudget: toNumber(payload.maxMonthlyBudget ?? draft.value.maxMonthlyBudget),
      mandatoryItems: payload.mandatoryItems ? normalizeList(payload.mandatoryItems) : normalizeList(draft.value.mandatoryItems),
      optionalItems: payload.optionalItems ? normalizeList(payload.optionalItems) : normalizeList(draft.value.optionalItems),
      subscriptionItems: Array.isArray(payload.subscriptionItems)
        ? normalizeSubscriptionItems(payload.subscriptionItems)
        : normalizeSubscriptionItems(draft.value.subscriptionItems),
    }
    persistDraft()
  }

  const resetDraft = () => {
    draft.value = clone(DEFAULT_DRAFT)
    persistDraft()
    setStatusMessage('입력 중인 추천 조건을 초기화했습니다.')
  }

  const upsertReport = (payload = {}) => {
    const normalized = normalizeReport(payload)
    reports.value = [
      normalized,
      ...reports.value.filter((item) => String(item.reportId) !== String(normalized.reportId)),
    ]
    return normalized
  }

  const setActiveReport = (reportId) => {
    activeReportId.value = reportId
    persistActive()
  }

  const getReportById = (reportId) => reports.value.find((item) => String(item.reportId) === String(reportId)) || null

  const fetchReportDetail = async (reportId) => {
    if (!reportId) return null

    isFetchingDetail.value = true
    try {
      const response = await getRecommendDetail(reportId)
      const data = response?.data?.data ?? {}
      const report = upsertReport(data)
      setActiveReport(report.reportId)
      return report
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '추천 상세 정보를 불러오지 못했습니다.'))
      throw error
    } finally {
      isFetchingDetail.value = false
    }
  }

  const ensureReportDetail = async (reportId) => {
    const cached = getReportById(reportId)
    if (cached?.subscriptionItems?.length || cached?.generatedContent) {
      setActiveReport(reportId)
      return cached
    }
    return fetchReportDetail(reportId)
  }

  const fetchSavedReports = async () => {
    isFetchingList.value = true
    clearMessages()

    try {
      const response = await getRecommendList()
      const items = response?.data?.data?.reports ?? []

      if (!items.length) {
        reports.value = reports.value.filter((item) => item.reportStatus !== 'SAVED')
        return []
      }

      const details = await Promise.all(items.map(async (item) => {
        try {
          const detailResponse = await getRecommendDetail(item.reportId)
          return normalizeReport(detailResponse?.data?.data ?? item)
        } catch {
          return normalizeReport(item)
        }
      }))

      const nonSaved = reports.value.filter((item) => item.reportStatus !== 'SAVED')
      reports.value = [...details, ...nonSaved.filter((item) => !details.some((detail) => String(detail.reportId) === String(item.reportId)))]
      return details
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '추천 기록 목록을 불러오지 못했습니다.'))
      throw error
    } finally {
      isFetchingList.value = false
    }
  }

  const submitDraft = async () => {
    isSubmitting.value = true
    clearMessages()

    try {
      const payload = toSubmitPayload(draft.value)
      const response = await postRecommendSubmit(payload)
      const reportId = response?.data?.data?.reportId
      const report = await fetchReportDetail(reportId)
      setStatusMessage('추천 요청을 저장했습니다.')
      return report
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '추천 요청 저장에 실패했습니다.'))
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const generateRecommendations = async (reportId = activeReportId.value) => {
    if (!reportId) return null

    isSubmitting.value = true
    clearMessages()

    try {
      await postRecommendGenerate({ reportId: toNumber(reportId) })
      const report = await fetchReportDetail(reportId)
      setStatusMessage('추천 결과를 생성했습니다.')
      return report
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '추천 결과 생성에 실패했습니다.'))
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const saveReport = async (reportId = activeReportId.value, overrides = {}) => {
    if (!reportId) return null

    isSubmitting.value = true
    clearMessages()

    try {
      const target = await ensureReportDetail(reportId)
      await postRecommendSave({
        reportId: toNumber(reportId),
        reportTitle: normalizeText(overrides.reportTitle || target?.reportTitle),
        generatedContent: normalizeText(overrides.generatedContent || target?.generatedContent),
      })
      const report = await fetchReportDetail(reportId)
      setStatusMessage('추천 결과를 저장했습니다.')
      return report
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '추천 결과 저장에 실패했습니다.'))
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const updateReportTitle = async (reportId, reportTitle) => {
    const target = await ensureReportDetail(reportId)
    return saveReport(reportId, {
      reportTitle,
      generatedContent: target?.generatedContent,
    })
  }

  const deleteReportById = async (reportId) => {
    if (!reportId) return false

    isSubmitting.value = true
    clearMessages()

    try {
      await deleteRecommend(reportId)
      reports.value = reports.value.filter((item) => String(item.reportId) !== String(reportId))
      if (String(activeReportId.value) === String(reportId)) {
        activeReportId.value = reports.value[0]?.reportId || null
        persistActive()
      }
      setStatusMessage('추천 결과를 삭제했습니다.')
      return true
    } catch (error) {
      setErrorMessage(getErrorMessage(error, '추천 결과 삭제에 실패했습니다.'))
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    draft,
    reports,
    activeReportId,
    statusMessage,
    errorMessage,
    isFetchingList,
    isFetchingDetail,
    isSubmitting,
    CATEGORY_OPTIONS,
    SERVICE_LIBRARY,
    reportList,
    currentReport,
    generatedReports,
    savedReports,
    draftTotalPrice,
    clearMessages,
    setStatusMessage,
    setErrorMessage,
    updateDraft,
    resetDraft,
    submitDraft,
    generateRecommendations,
    saveReport,
    updateReportTitle,
    deleteReport: deleteReportById,
    fetchSavedReports,
    fetchReportDetail,
    ensureReportDetail,
    setActiveReport,
    getReportById,
    parseItemsJson,
    toDateLabel,
  }
})
