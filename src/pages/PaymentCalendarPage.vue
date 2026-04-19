<script setup>
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import PaymentCalendarGrid from '@/components/calendar/PaymentCalendarGrid.vue'
import SelectedDayPanel from '@/components/calendar/SelectedDayPanel.vue'
import SpendTrendPanel from '@/components/calendar/SpendTrendPanel.vue'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'
import { usePaymentCalendarStore } from '@/stores/paymentCalendar'

const activePanelTab = ref('MONTH')

const paymentCalendarStore = usePaymentCalendarStore()

const {
  currentMonthLabel,
  currentMonthTitle,
  currentMonthShortLabel,
  monthTotalAmount,
  topCategoryTotalAmount,
  topCategorySummary,
  dominantCategory,
  currentMonthCategorySummary,
  calendarDays,
  selectedDatePayments,
  selectedDateAmount,
  selectedDateLabel,
  weekdayLabels,
  activeTrendItems,
  maxTrendAmount,
  trendView,
  currentMonthPaymentList,
  trendTotalAmount,
  previousTrendTotalAmount,
} = storeToRefs(paymentCalendarStore)

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const categoryDisplayName = (categoryName) =>
  ({
    OTT: 'OTT',
    Music: '음악',
    AI: 'AI',
    Cloud: '클라우드',
    Etc: '기타',
    Others: '기타',
  }[categoryName] || categoryName)

const extractDayNumber = (day) => {
  if (day?.payDay != null) return Number(day.payDay)
  if (day?.day != null) return Number(day.day)
  if (day?.dateNumber != null) return Number(day.dateNumber)
  if (day?.date) {
    const parsed = new Date(day.date)
    if (!Number.isNaN(parsed.getTime())) return parsed.getDate()

    const match = String(day.date).match(/(\d{1,2})$/)
    if (match) return Number(match[1])
  }
  return null
}

const isCurrentMonthDay = (day) => {
  if (day?.isCurrentMonth !== undefined) return day.isCurrentMonth
  if (day?.isCurrent !== undefined) return day.isCurrent
  if (day?.outside !== undefined) return !day.outside
  if (day?.isOutside !== undefined) return !day.isOutside
  return true
}

const monthlyTrendItems = computed(() => {
  const source = Array.isArray(calendarDays.value) ? calendarDays.value : []

  return source
    .filter((day) => isCurrentMonthDay(day) && Number(day.totalAmount || 0) > 0)
    .map((day, index) => {
      const dayNumber = extractDayNumber(day)
      if (!dayNumber) return null

      return {
        key: `day-${dayNumber}-${index}`,
        label: `${dayNumber}일`,
        totalAmount: Number(day.totalAmount || 0),
        totalCount: Number(day.totalCount || 0),
      }
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.label.replace('일', '')) - Number(b.label.replace('일', '')))
})

const yearlyTrendItems = computed(() => {
  const source = Array.isArray(activeTrendItems.value) ? activeTrendItems.value : []

  return source
    .map((item, index) => {
      const month = Number(item.month ?? item.label?.replace?.('월', '') ?? 0)
      if (!month) return null

      return {
        key: `month-${month}-${index}`,
        label: `${month}월`,
        totalAmount: Number(item.totalAmount || 0),
        subscriptionCount:
          item.subscriptionCount !== undefined && item.subscriptionCount !== null
            ? Number(item.subscriptionCount)
            : null,
        totalCount: Number(item.totalCount || item.count || 0),
      }
    })
    .filter(Boolean)
    .sort((a, b) => Number(a.label.replace('월', '')) - Number(b.label.replace('월', '')))
})

const trendPanelItems = computed(() =>
  trendView.value === 'MONTHLY' ? monthlyTrendItems.value : yearlyTrendItems.value,
)

const resolvedTrendMaxAmount = computed(() => {
  const source = trendPanelItems.value
  if (!source.length) return 0

  return source.reduce((max, item) => Math.max(max, Number(item.totalAmount || 0)), 0)
})

  const resolvedTrendTotalAmount = computed(() => {
  return Number(trendTotalAmount.value || 0)
})

const resolvedPreviousTrendTotalAmount = computed(() => {
  return Number(previousTrendTotalAmount.value || 0)
})

const changePanelTab = async (tab) => {
  activePanelTab.value = tab

  if (tab === 'CATEGORY') {
    await paymentCalendarStore.fetchTopCategorySummary()
  }
}

const handleMoveMonth = async (offset) => {
  await paymentCalendarStore.moveMonth(offset)

  if (activePanelTab.value === 'CATEGORY') {
    await paymentCalendarStore.fetchTopCategorySummary()
  }
}

onMounted(async () => {
  await paymentCalendarStore.fetchAll()
})
</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-5">
      <section class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div class="section-card !bg-[rgba(255,252,245,0.96)]">
          <div
            class="flex flex-col gap-4 border-b border-[rgba(46,34,10,0.08)] pb-5 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p class="text-sm font-semibold text-[#8A6A00]">월별 결제 캘린더</p>
              <h2 class="mt-2 section-heading">{{ currentMonthTitle }}</h2>
              <p class="mt-2 text-sm leading-6 text-neutral-500">
                아이콘으로 전체 일정을 빠르게 훑고, 필요한 날짜만 선택해서 확인하세요.
              </p>
            </div>

            <div class="flex gap-2">
              <button
                type="button"
                class="secondary-button !min-h-11 !px-4"
                @click="handleMoveMonth(-1)"
              >
                이전 월
              </button>
              <button
                type="button"
                class="secondary-button !min-h-11 !px-4"
                @click="handleMoveMonth(1)"
              >
                다음 월
              </button>
            </div>
          </div>

          <div class="mt-5">
            <PaymentCalendarGrid
              :weekday-labels="weekdayLabels"
              :days="calendarDays"
              @select="paymentCalendarStore.setSelectedDate"
            />
          </div>

          <AppStatePanel
            v-if="!calendarDays.length"
            class="mt-6"
            title="캘린더에 표시할 일정이 없습니다"
            description="구독을 등록하면 날짜별 결제 일정이 캘린더에 표시됩니다."
            icon="calendar"
          >
            <template #actions>
              <RouterLink to="/subscriptions/new" class="primary-button">
                첫 구독 등록하기
              </RouterLink>
            </template>
          </AppStatePanel>
        </div>

        <div class="grid gap-5 xl:sticky xl:top-6 xl:self-start">
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-bold"
              :class="
                activePanelTab === 'MONTH'
                  ? 'bg-[#F2A6A6] text-white'
                  : 'bg-[rgba(46,34,10,0.06)] text-neutral-500'
              "
              @click="changePanelTab('MONTH')"
            >
              월별
            </button>

            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-bold"
              :class="
                activePanelTab === 'CATEGORY'
                  ? 'bg-[#F2A6A6] text-white'
                  : 'bg-[rgba(46,34,10,0.06)] text-neutral-500'
              "
              @click="changePanelTab('CATEGORY')"
            >
              카테고리
            </button>
          </div>

          <template v-if="activePanelTab === 'MONTH'">
            <section class="shell-card p-5">
              <p class="text-sm font-semibold text-[#8A6A00]">
                {{ currentMonthShortLabel }} 총 결제
              </p>
              <p class="mt-2 text-[30px] font-black tracking-[-0.04em] text-neutral-900">
                {{ formatCurrency(monthTotalAmount) }}
              </p>

              <div class="mt-4 grid gap-3">
                <div
                  class="rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-4 py-3"
                >
                  <p class="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">
                    비중이 큰 카테고리
                  </p>
                  <p class="mt-2 text-sm font-bold text-neutral-900">
                    {{
                      dominantCategory
                        ? categoryDisplayName(dominantCategory.categoryName)
                        : '-'
                    }}
                  </p>
                  <p class="mt-1 text-xs text-neutral-500">
                    {{
                      dominantCategory
                        ? `${formatCurrency(dominantCategory.totalAmount)} · ${dominantCategory.subscriptionCount}개 서비스`
                        : '표시할 데이터가 없습니다.'
                    }}
                  </p>
                </div>

                <div
                  class="rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-4 py-3"
                >
                  <p class="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">
                    선택한 날짜
                  </p>
                  <p class="mt-2 text-sm font-bold text-neutral-900">
                    {{ selectedDateLabel }}
                  </p>
                  <p class="mt-1 text-xs text-neutral-500">
                    {{ selectedDatePayments.length }}건 ·
                    {{ formatCurrency(selectedDateAmount) }}
                  </p>
                </div>
              </div>
            </section>

            <SelectedDayPanel
              :date-label="selectedDateLabel"
              :total-amount="selectedDateAmount"
              :payments="selectedDatePayments"
            />
          </template>

          <section v-else class="shell-card p-5">
            <p class="text-sm font-semibold text-[#8A6A00]">
              {{ currentMonthShortLabel }} 카테고리별 소비
            </p>
            <p class="mt-2 text-[30px] font-black tracking-[-0.04em] text-neutral-900">
              {{ formatCurrency(topCategoryTotalAmount) }}
            </p>

            <div v-if="topCategorySummary.length" class="mt-4 grid gap-3">
              <article
                v-for="(item, index) in topCategorySummary"
                :key="`${item.categoryName}-${index}`"
                class="rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-brand-50 px-4 py-3"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-neutral-900">
                      {{ categoryDisplayName(item.categoryName) }}
                    </p>
                    <p class="mt-1 break-words text-xs leading-5 text-neutral-500">
                      {{ item.itemNames || '-' }}
                    </p>
                  </div>

                  <p class="shrink-0 text-sm font-bold text-neutral-900">
                    {{ formatCurrency(item.totalAmount) }}
                  </p>
                </div>
              </article>
            </div>

            <AppStatePanel
              v-else
              class="mt-5"
              compact
              title="카테고리 데이터를 보여줄 수 없습니다"
              description="해당 월의 카테고리 전체 조회 데이터가 없습니다."
              icon="grid"
            />
          </section>
        </div>
      </section>

      <section class="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section class="section-card !p-5 lg:!p-6">
          <div class="border-b border-[rgba(46,34,10,0.08)] pb-4">
            <p class="text-sm font-semibold text-[#8A6A00]">카테고리별 소비</p>
            <h2 class="mt-2 text-[22px] font-bold tracking-[-0.03em] text-neutral-900">
              {{ currentMonthLabel }}
            </h2>
          </div>

          <div v-if="currentMonthCategorySummary.length" class="mt-4 grid gap-3">
            <article
              v-for="item in currentMonthCategorySummary"
              :key="item.categoryName"
              class="rounded-card border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.82)] p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span
                    class="inline-flex h-3 w-3 rounded-full"
                    :class="item.colorClass"
                  ></span>
                  <div>
                    <p class="text-sm font-bold text-neutral-900">
                      {{ item.displayName }}
                    </p>
                    <p class="text-xs text-neutral-500">
                      {{ item.subscriptionCount }}개 서비스
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <p class="text-sm font-bold text-neutral-900">
                    {{ formatCurrency(item.totalAmount) }}
                  </p>
                  <p class="text-xs text-neutral-500">{{ item.ratio }}%</p>
                </div>
              </div>

              <div class="mt-3 h-2 rounded-full bg-[rgba(46,34,10,0.08)]">
                <div
                  class="h-2 rounded-full"
                  :class="item.colorClass"
                  :style="{ width: `${item.ratio}%` }"
                ></div>
              </div>
            </article>
          </div>

          <AppStatePanel
            v-else
            class="mt-5"
            compact
            title="카테고리 분석을 보여줄 데이터가 없습니다"
            description="결제 데이터가 쌓이면 월별 카테고리 비중이 표시됩니다."
            icon="grid"
          />
        </section>

        <div class="grid gap-2">
          <SpendTrendPanel
            :items="trendPanelItems"
            :max-amount="resolvedTrendMaxAmount"
            :view="trendView"
            :payment-preview="currentMonthPaymentList"
            :payment-preview-label="currentMonthShortLabel"
            :total-amount="resolvedTrendTotalAmount"
            :previous-total-amount="resolvedPreviousTrendTotalAmount"
            @change-view="paymentCalendarStore.setTrendView"
          />
        </div>
      </section>
    </div>
  </AppShell>
</template>