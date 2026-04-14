<script setup>
import AppAsset from '@/components/ui/AppAsset.vue'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'
defineProps({
  dateLabel: {
    type: String,
    default: '-',
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  payments: {
    type: Array,
    default: () => [],
  },
})

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const categoryDisplayName = (categoryName) => {
  const mapping = {
    OTT: 'OTT',
    Music: '음악',
    AI: 'AI',
    Cloud: '클라우드',
    Etc: '기타',
  }
  return mapping[categoryName] || categoryName
}

const categoryTone = (categoryName) => {
  const mapping = {
    OTT: 'bg-[rgba(186,107,82,0.14)] text-[#7B4435] ring-[rgba(186,107,82,0.22)]',
    Music: 'bg-[rgba(93,130,96,0.14)] text-[#476049] ring-[rgba(93,130,96,0.22)]',
    AI: 'bg-[rgba(138,106,0,0.12)] text-[#7B5E00] ring-[rgba(138,106,0,0.18)]',
    Cloud: 'bg-[rgba(199,184,149,0.22)] text-[#6B5B39] ring-[rgba(199,184,149,0.32)]',
    Etc: 'bg-[rgba(153,140,113,0.14)] text-[#6D6148] ring-[rgba(153,140,113,0.22)]',
  }
  return mapping[categoryName] || 'bg-[rgba(46,34,10,0.08)] text-neutral-700 ring-[rgba(46,34,10,0.1)]'
}
</script>

<template>
  <section class="shell-card p-6">
    <div class="border-b border-[rgba(46,34,10,0.08)] pb-5">
      <p class="text-sm font-semibold text-[#8A6A00]">선택 날짜 결제 정보</p>
      <h2 class="mt-2 text-[26px] font-bold tracking-[-0.03em] text-neutral-900">{{ dateLabel }}</h2>
      <p class="mt-2 text-sm text-neutral-500">총 {{ payments.length }}건 · {{ formatCurrency(totalAmount) }}</p>
    </div>

    <div v-if="payments.length" class="mt-5 grid gap-3">
      <article v-for="payment in payments" :key="payment.paymentId" class="rounded-card border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.82)] p-4">
        <div class="flex items-start gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[rgba(46,34,10,0.08)]">
            <AppAsset
              type="service"
              :value="payment.subscriptionName"
              secondary-type="category"
              :secondary-value="payment.categoryName"
              fallback="calendar"
              :size="18"
              wrapper-class="inline-flex items-center justify-center"
              image-class="h-7 w-7 object-contain"
              icon-class="text-[#8A6A00]"
            />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="truncate text-sm font-bold text-neutral-900">{{ payment.subscriptionName }}</p>
              <span class="rounded-full px-2.5 py-1 text-[11px] font-bold ring-1" :class="categoryTone(payment.categoryName)">
                {{ categoryDisplayName(payment.categoryName) }}
              </span>
            </div>
            <div class="mt-1 inline-flex items-center gap-2 text-xs text-neutral-500">
              <AppAsset
                type="card"
                :value="payment.paymentCardName"
                fallback="creditcard"
                :size="12"
                wrapper-class="inline-flex items-center justify-center"
                image-class="h-5 w-5 rounded-md bg-white p-0.5 ring-1 ring-[rgba(46,34,10,0.08)] object-contain"
                icon-class="text-[#8A6A00]"
                badge-class="inline-flex min-w-[36px] items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[-0.02em]"
              />
              {{ payment.paymentCardName || '등록 카드' }}로 결제 예정
            </div>
            <div class="mt-4 flex items-center justify-between text-sm">
              <span class="text-neutral-500">결제 금액</span>
              <span class="font-bold text-neutral-900">{{ formatCurrency(payment.paymentAmount) }}</span>
            </div>
          </div>
        </div>
      </article>
    </div>

    <AppStatePanel
      v-else
      class="mt-5"
      compact
      title="선택한 날짜에 예정된 결제가 없습니다"
      description="다른 날짜를 선택하면 해당 날짜의 결제 항목과 카드 정보를 이 영역에서 바로 확인할 수 있습니다."
      icon="calendar"
    />
  </section>
</template>
