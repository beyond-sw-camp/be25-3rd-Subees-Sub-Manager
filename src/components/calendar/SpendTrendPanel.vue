<script setup>
import { computed } from 'vue'
import AppAsset from '@/components/ui/AppAsset.vue'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  maxAmount: {
    type: Number,
    default: 1,
  },
  view: {
    type: String,
    default: 'MONTHLY',
  },
  paymentPreview: {
    type: Array,
    default: () => [],
  },
  paymentPreviewLabel: {
    type: String,
    default: '',
  },
  totalAmount: {
    type: Number,
    default: null,
  },
  previousTotalAmount: {
    type: Number,
    default: null,
  },
})

const emit = defineEmits(['change-view'])

const formatCurrency = (value) =>
  `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const getBarWidth = (amount, maxAmount) => {
  const safeMax = Number(maxAmount || 0)
  const safeAmount = Number(amount || 0)

  if (safeMax <= 0) return '6%'
  return `${Math.max((safeAmount / safeMax) * 100, 6)}%`
}

const resolvedTotalAmount = computed(() => {
  if (props.totalAmount !== null && props.totalAmount !== undefined) {
    return Number(props.totalAmount || 0)
  }

  return props.items.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0)
})

const topItem = computed(() => {
  if (!props.items.length) return null

  return props.items.reduce((max, current) =>
    Number(current.totalAmount || 0) > Number(max.totalAmount || 0) ? current : max,
  )
})

const averageAmount = computed(() => {
  if (!props.items.length) return 0
  return Math.round(resolvedTotalAmount.value / props.items.length)
})

const changeInfo = computed(() => {
  const previous = Number(props.previousTotalAmount)

  if (
    props.previousTotalAmount === null ||
    props.previousTotalAmount === undefined ||
    Number.isNaN(previous) ||
    previous <= 0
  ) {
    return {
      value: '-',
      description: props.view === 'YEARLY' ? '전년 비교 데이터 없음' : '전월 비교 데이터 없음',
    }
  }

  const current = resolvedTotalAmount.value
  const diff = current - previous
  const rate = ((Math.abs(diff) / previous) * 100).toFixed(1)

  if (diff === 0) {
    return {
      value: '0%',
      description: '직전 구간과 동일',
    }
  }

  return {
    value: `${diff > 0 ? '+' : '-'}${rate}%`,
    description: `${formatCurrency(Math.abs(diff))} ${diff > 0 ? '증가' : '감소'}`,
  }
})

const summaryCards = computed(() => [
  {
    key: 'total',
    title: props.view === 'YEARLY' ? '연간 총 지출' : '선택 구간 총 지출',
    value: formatCurrency(resolvedTotalAmount.value),
    description: props.view === 'YEARLY' ? '연간 흐름 기준 집계' : '현재 막대 합산 기준',
  },
  {
    key: 'peak',
    title: props.view === 'YEARLY' ? '최고 지출 구간' : '최고 지출 구간',
    value: topItem.value
      ? `${topItem.value.label} · ${formatCurrency(topItem.value.totalAmount)}`
      : '-',
    description: topItem.value ? '가장 큰 금액이 발생한 구간' : '표시할 데이터 없음',
  },
  {
    key: 'avg',
    title: '평균 지출',
    value: props.items.length ? formatCurrency(averageAmount.value) : '-',
    description: props.items.length ? `${props.items.length}개 구간 평균` : '표시할 데이터 없음',
  },
  {
    key: 'change',
    title: props.view === 'YEARLY' ? '전년 대비' : '전월 대비',
    value: changeInfo.value.value,
    description: changeInfo.value.description,
  },
])

const sectionTitle = computed(() =>
  props.view === 'YEARLY' ? '연간 소비 분석' : '월별 소비 분석',
)

const sectionDescription = computed(() =>
  props.view === 'YEARLY'
    ? '연간 기준으로 금액 흐름과 피크 구간을 한눈에 확인해 보세요.'
    : '월별 기준으로 금액 흐름과 피크 구간을 한눈에 확인해 보세요.',
)

const itemMetaText = (item) => {
  if (item.count !== undefined && item.count !== null) return `${item.count}건`
  if (item.totalCount !== undefined && item.totalCount !== null) return `${item.totalCount}건`
  if (item.subscriptionCount !== undefined && item.subscriptionCount !== null) {
    return `${item.subscriptionCount}개 서비스`
  }
  return ''
}
</script>

<template>
  <section class="shell-card p-6">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(46,34,10,0.08)] pb-5">
      <div>
        <p class="text-sm font-semibold text-[#8A6A00]">소비 분석</p>
        <h2 class="mt-2 text-[24px] font-bold tracking-[-0.03em] text-neutral-900">
          {{ sectionTitle }}
        </h2>
        <p class="mt-2 text-sm leading-6 text-neutral-500">
          {{ sectionDescription }}
        </p>
      </div>

      <div class="flex gap-2 rounded-full bg-brand-50 p-1">
        <button
          type="button"
          class="chip-button min-h-9 px-4"
          :class="view === 'MONTHLY' ? 'is-selected' : 'border-transparent bg-transparent'"
          @click="emit('change-view', 'MONTHLY')"
        >
          월별
        </button>
        <button
          type="button"
          class="chip-button min-h-9 px-4"
          :class="view === 'YEARLY' ? 'is-selected' : 'border-transparent bg-transparent'"
          @click="emit('change-view', 'YEARLY')"
        >
          연간
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.key"
        class="rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.82)] px-4 py-4"
      >
        <p class="text-xs font-semibold text-neutral-500">{{ card.title }}</p>
        <p class="mt-2 text-lg font-bold tracking-[-0.02em] text-neutral-900">
          {{ card.value }}
        </p>
        <p class="mt-1 text-xs leading-5 text-neutral-500">
          {{ card.description }}
        </p>
      </article>
    </div>

    <div
      v-if="items.length"
      class="mt-6 rounded-[24px] border border-[rgba(46,34,10,0.08)] bg-white/50 p-4"
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-[#8A6A00]">
            {{ view === 'YEARLY' ? '구간별 지출 흐름' : '날짜별 지출 흐름' }}
          </p>
          <p class="mt-1 text-xs text-neutral-500">
            막대 길이는 가장 큰 금액 구간을 기준으로 상대 비교됩니다.
          </p>
        </div>

        <p class="text-xs font-semibold text-neutral-500">
          최고값 {{ formatCurrency(maxAmount) }}
        </p>
      </div>

      <div class="grid gap-4">
        <div
          v-for="item in items"
          :key="item.key || item.label"
          class="grid gap-2 md:grid-cols-[84px_minmax(0,1fr)_120px] md:items-center"
        >
          <div>
            <p class="text-sm font-bold text-neutral-700">{{ item.label }}</p>
            <p v-if="itemMetaText(item)" class="mt-0.5 text-[11px] text-neutral-400">
              {{ itemMetaText(item) }}
            </p>
          </div>

          <div class="h-3 rounded-full bg-[rgba(46,34,10,0.08)]">
            <div
              class="h-3 rounded-full bg-brand-500 transition-all duration-300"
              :style="{ width: getBarWidth(item.totalAmount, maxAmount) }"
            />
          </div>

          <p class="text-right text-sm font-bold text-neutral-900">
            {{ formatCurrency(item.totalAmount) }}
          </p>
        </div>
      </div>
    </div>

    <AppStatePanel
      v-else
      class="mt-6"
      compact
      title="표시할 분석 데이터가 없습니다"
      description="결제 데이터가 쌓이면 이 영역에 금액 흐름이 표시됩니다."
      icon="chart"
    />

    <div v-if="view === 'MONTHLY'" class="mt-8 border-t border-[rgba(46,34,10,0.08)] pt-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-[#8A6A00]">{{ paymentPreviewLabel }} 결제 정보</p>
          <p class="mt-1 text-sm text-neutral-500">
            선택한 달에 예정된 결제 항목을 리스트로 다시 확인할 수 있어요.
          </p>
        </div>
      </div>

      <div v-if="paymentPreview.length" class="mt-4 grid gap-3">
        <article
          v-for="item in paymentPreview"
          :key="item.paymentId"
          class="grid gap-2 rounded-[20px] border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.82)] px-4 py-3 md:grid-cols-[88px_minmax(0,1fr)_110px] md:items-center"
        >
          <p class="text-sm font-semibold text-neutral-500">{{ item.displayDateLabel }}</p>

          <div class="flex items-center gap-3">
            <div class="grid h-10 w-10 place-items-center rounded-xl bg-white ring-1 ring-[rgba(46,34,10,0.08)]">
              <AppAsset
                type="service"
                :value="item.subscriptionName"
                secondary-type="category"
                :secondary-value="item.categoryName"
                fallback="calendar"
                :size="16"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-6 w-6 object-contain"
                icon-class="text-[#8A6A00]"
              />
            </div>

            <div>
              <p class="text-sm font-bold text-neutral-900">{{ item.subscriptionName }}</p>
              <div class="mt-1 inline-flex items-center gap-2 text-xs text-neutral-500">
                <AppAsset
                  type="card"
                  :value="item.paymentCardName"
                  fallback="creditcard"
                  :size="10"
                  wrapper-class="inline-flex items-center justify-center"
                  image-class="h-4 w-4 rounded bg-white p-0.5 ring-1 ring-[rgba(46,34,10,0.08)] object-contain"
                  icon-class="text-[#8A6A00]"
                  badge-class="inline-flex min-w-[32px] items-center justify-center rounded-md px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[-0.02em]"
                />
                {{ item.categoryDisplayName }} · {{ item.paymentCardName || '등록 카드' }}
              </div>
            </div>
          </div>

          <p class="text-right text-sm font-bold text-neutral-900">
            {{ formatCurrency(item.paymentAmount) }}
          </p>
        </article>
      </div>

      <AppStatePanel
        v-else
        class="mt-4"
        compact
        title="이 달에 예정된 결제가 없습니다"
        description="구독을 등록하면 선택한 달의 결제 항목이 이 아래 리스트에 함께 표시됩니다."
        icon="creditcard"
      />
    </div>
  </section>
</template>