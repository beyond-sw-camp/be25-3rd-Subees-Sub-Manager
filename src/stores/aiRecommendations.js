import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const DRAFT_KEY = 'subees-ai-recommend-draft-v4'
const REPORTS_KEY = 'subees-ai-recommend-reports-v4'
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
    sortOrder: index + 1,
  }))
  .filter((item) => item.serviceName)

const totalPriceOf = (items = []) => items.reduce((sum, item) => sum + toNumber(item.monthlyPrice), 0)

const buildGeneratedContent = (report) => {
  const items = report.subscriptionItems || []
  const totalPrice = totalPriceOf(items)
  const mandatory = normalizeList(JSON.parse(report.mandatoryItemsJson || '[]'))
  const optional = normalizeList(JSON.parse(report.optionalItemsJson || '[]'))
  const sortedItems = [...items].sort((a, b) => toNumber(b.monthlyPrice) - toNumber(a.monthlyPrice))
  const expensive = sortedItems.slice(0, 3)
  const budgetGap = toNumber(report.maxMonthlyBudget) - totalPrice

  const lines = [
    '서비스 추천 요약',
    '',
    `총 예상 비용은 ${totalPrice.toLocaleString('ko-KR')}원입니다.`,
    report.maxMonthlyBudget ? `설정한 예산은 ${toNumber(report.maxMonthlyBudget).toLocaleString('ko-KR')}원입니다.` : '설정한 예산은 없습니다.',
    budgetGap >= 0
      ? `예산 안에서 ${budgetGap.toLocaleString('ko-KR')}원 여유가 있습니다.`
      : `예산을 ${Math.abs(budgetGap).toLocaleString('ko-KR')}원 초과했습니다.`,
    '',
    '현재 입력한 서비스',
    items.length
      ? items.map((item) => `- ${item.serviceName} | ${item.category} | ${toNumber(item.monthlyPrice).toLocaleString('ko-KR')}원`).join('\n')
      : '- 입력한 서비스가 없습니다.',
    '',
    '추천 방향',
    mandatory.length ? `- 필수 유지 항목: ${mandatory.join(', ')}` : '- 필수 유지 항목은 없습니다.',
    optional.length ? `- 추가 희망 항목: ${optional.join(', ')}` : '- 추가 희망 항목은 없습니다.',
    report.requestNote ? `- 요청 메모: ${report.requestNote}` : '- 요청 메모는 없습니다.',
    '',
    '우선 검토 서비스',
    expensive.length
      ? expensive.map((item) => `- ${item.serviceName}: ${toNumber(item.monthlyPrice).toLocaleString('ko-KR')}원 · ${item.description || '기능 설명 없음'}`).join('\n')
      : '- 우선 검토 서비스가 없습니다.',
  ]

  return lines.join('\n')
}

const buildReport = (payload = {}, reportStatus = 'SUBMITTED') => {
  const subscriptionItems = normalizeSubscriptionItems(payload.subscriptionItems || [])
  const createdAt = payload.createdAt || new Date().toISOString()
  const report = {
    reportId: payload.reportId || createId('report'),
    reportTitle: normalizeText(payload.reportTitle) || `AI 추천 결과 ${toDateLabel(createdAt)}`,
    requestNote: normalizeText(payload.requestNote),
    generatedContent: normalizeText(payload.generatedContent),
    totalMonthlyPrice: totalPriceOf(subscriptionItems),
    maxMonthlyBudget: toNumber(payload.maxMonthlyBudget),
    mandatoryItemsJson: JSON.stringify(normalizeList(payload.mandatoryItems || [])),
    optionalItemsJson: JSON.stringify(normalizeList(payload.optionalItems || [])),
    reportStatus,
    createdAt,
    updatedAt: new Date().toISOString(),
    subscriptionItems,
  }

  if (reportStatus !== 'SUBMITTED' && !report.generatedContent) {
    report.generatedContent = buildGeneratedContent(report)
  }

  return report
}

export const useAiRecommendationsStore = defineStore('aiRecommendations', () => {
  const draft = ref({ ...clone(DEFAULT_DRAFT), ...loadJson(DRAFT_KEY, {}) })
  const reports = ref(loadJson(REPORTS_KEY, []))
  const activeReportId = ref(loadJson(ACTIVE_REPORT_KEY, null))
  const statusMessage = ref('')

  const reportList = computed(() => [...reports.value].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)))
  const currentReport = computed(() => reportList.value.find((item) => item.reportId === activeReportId.value) || null)
  const generatedReports = computed(() => reportList.value.filter((item) => item.reportStatus === 'GENERATED'))
  const savedReports = computed(() => reportList.value.filter((item) => item.reportStatus === 'SAVED'))
  const draftTotalPrice = computed(() => totalPriceOf(draft.value.subscriptionItems || []))

  const persistDraft = () => saveJson(DRAFT_KEY, draft.value)
  const persistReports = () => saveJson(REPORTS_KEY, reports.value)
  const persistActive = () => saveJson(ACTIVE_REPORT_KEY, activeReportId.value)

  const setStatusMessage = (message = '') => { statusMessage.value = message }

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

  const submitDraft = () => {
    const report = buildReport(draft.value, 'SUBMITTED')
    reports.value = [report, ...reports.value.filter((item) => item.reportId !== report.reportId)]
    activeReportId.value = report.reportId
    persistReports()
    persistActive()
    setStatusMessage('추천 요청을 저장했습니다.')
    return report
  }

  const generateRecommendations = (reportId = activeReportId.value) => {
    const target = reports.value.find((item) => item.reportId === reportId)
    if (!target) return null

    const next = {
      ...target,
      reportStatus: 'GENERATED',
      generatedContent: buildGeneratedContent(target),
      updatedAt: new Date().toISOString(),
    }

    reports.value = reports.value.map((item) => item.reportId === next.reportId ? next : item)
    activeReportId.value = next.reportId
    persistReports()
    persistActive()
    setStatusMessage('추천 결과를 생성했습니다.')
    return next
  }

  const saveReport = (reportId = activeReportId.value, overrides = {}) => {
    const target = reports.value.find((item) => item.reportId === reportId)
    if (!target) return null

    const next = {
      ...target,
      reportTitle: normalizeText(overrides.reportTitle || target.reportTitle) || target.reportTitle,
      generatedContent: normalizeText(overrides.generatedContent || target.generatedContent) || buildGeneratedContent(target),
      reportStatus: 'SAVED',
      updatedAt: new Date().toISOString(),
    }

    reports.value = reports.value.map((item) => item.reportId === next.reportId ? next : item)
    activeReportId.value = next.reportId
    persistReports()
    persistActive()
    setStatusMessage('추천 결과를 저장했습니다.')
    return next
  }

  const updateReportTitle = (reportId, reportTitle) => {
    reports.value = reports.value.map((item) => (
      item.reportId === reportId
        ? { ...item, reportTitle: normalizeText(reportTitle) || item.reportTitle, updatedAt: new Date().toISOString() }
        : item
    ))
    persistReports()
    setStatusMessage('추천 제목을 수정했습니다.')
  }

  const deleteReport = (reportId) => {
    reports.value = reports.value.filter((item) => item.reportId !== reportId)
    if (activeReportId.value === reportId) {
      activeReportId.value = reports.value[0]?.reportId || null
      persistActive()
    }
    persistReports()
    setStatusMessage('추천 결과를 삭제했습니다.')
  }

  const setActiveReport = (reportId) => {
    activeReportId.value = reportId
    persistActive()
  }

  const getReportById = (reportId) => reports.value.find((item) => item.reportId === reportId) || null
  const parseItemsJson = (value) => {
    try {
      return normalizeList(JSON.parse(value || '[]'))
    } catch {
      return []
    }
  }

  return {
    draft,
    reports,
    activeReportId,
    statusMessage,
    CATEGORY_OPTIONS,
    SERVICE_LIBRARY,
    reportList,
    currentReport,
    generatedReports,
    savedReports,
    draftTotalPrice,
    setStatusMessage,
    updateDraft,
    resetDraft,
    submitDraft,
    generateRecommendations,
    saveReport,
    updateReportTitle,
    deleteReport,
    setActiveReport,
    getReportById,
    parseItemsJson,
    toDateLabel,
  }
})
