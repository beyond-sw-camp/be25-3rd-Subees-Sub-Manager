<script setup>
import AppAsset from '@/components/ui/AppAsset.vue'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'
defineProps({
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
})

const emit = defineEmits(['change-view'])

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`
</script>

<template>
  <section class="shell-card p-6">
    <div class="flex flex-wrap items-start justify-between gap-4 border-b border-[rgba(46,34,10,0.08)] pb-5">
      <div>
        <p class="text-sm font-semibold text-[#8A6A00]">소비 분석</p>
        <h2 class="mt-2 text-[24px] font-bold tracking-[-0.03em] text-neutral-900">{{ view === 'YEARLY' ? '연간 소비 분석' : '월별 소비 분석' }}</h2>
        <p class="mt-2 text-sm leading-6 text-neutral-500">월별 또는 연간 기준으로 금액 흐름을 비교해 보세요.</p>
      </div>

      <div class="flex gap-2 rounded-full bg-brand-50 p-1">
        <button type="button" class="chip-button min-h-9 px-4" :class="view === 'MONTHLY' ? 'is-selected' : 'border-transparent bg-transparent'" @click="emit('change-view', 'MONTHLY')">월별</button>
        <button type="button" class="chip-button min-h-9 px-4" :class="view === 'YEARLY' ? 'is-selected' : 'border-transparent bg-transparent'" @click="emit('change-view', 'YEARLY')">연간</button>
      </div>
    </div>

    <div v-if="items.length" class="mt-6 grid gap-4">
      <div v-for="item in items" :key="item.key" class="grid gap-2 md:grid-cols-[72px_minmax(0,1fr)_110px] md:items-center">
        <p class="text-sm font-bold text-neutral-700">{{ item.label }}</p>
        <div class="h-3 rounded-full bg-[rgba(46,34,10,0.08)]">
          <div class="h-3 rounded-full bg-brand-500" :style="{ width: `${Math.max((item.totalAmount / maxAmount) * 100, 6)}%` }"></div>
        </div>
        <p class="text-right text-sm font-bold text-neutral-900">{{ formatCurrency(item.totalAmount) }}</p>
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
          <p class="mt-1 text-sm text-neutral-500">선택한 달에 예정된 결제 항목을 리스트로 다시 확인할 수 있어요.</p>
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
          <p class="text-right text-sm font-bold text-neutral-900">{{ formatCurrency(item.paymentAmount) }}</p>
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
