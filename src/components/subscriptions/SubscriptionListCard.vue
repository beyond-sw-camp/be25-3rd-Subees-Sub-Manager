<script setup>
import AppAsset from '@/components/ui/AppAsset.vue'
const props = defineProps({ item: { type: Object, required: true }, isSelected: { type: Boolean, default: false } })
const emit = defineEmits(['select'])
const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`
const formatDate = (dateString) => { const date = new Date(`${dateString}T00:00:00`); return `${date.getMonth() + 1}월 ${date.getDate()}일` }
const dDayLabel = (dateString) => { const today = new Date('2026-03-30T00:00:00'); const target = new Date(`${dateString}T00:00:00`); const diff = Math.round((target - today) / (1000 * 60 * 60 * 24)); return diff >= 0 ? `D-${diff}` : '지난 결제' }
</script>

<template>
  <button type="button" class="w-full rounded-[24px] border px-5 py-5 text-left transition hover:-translate-y-0.5 hover:shadow-card" :class="[isSelected ? 'border-[rgba(242,210,33,0.28)] bg-[rgba(242,210,33,0.12)]' : 'border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.82)]', item.status !== 'ACTIVE' ? 'opacity-70' : '']" @click="emit('select', item.subscriptionId)">
    <div class="flex items-start gap-4">
      <div class="grid h-14 w-14 shrink-0 place-items-center rounded-[20px] border border-[rgba(46,34,10,0.06)] bg-white text-base font-bold text-neutral-900">
        <AppAsset type="service" :value="item.subscriptionName" secondary-type="category" :secondary-value="item.categoryName" fallback="sparkles" :size="18" wrapper-class="inline-flex items-center justify-center" image-class="h-9 w-9 object-contain" icon-class="text-[#8A6A00]" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="truncate text-base font-bold text-neutral-900">{{ item.subscriptionName }}</h3>
          <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-500 ring-1 ring-[rgba(46,34,10,0.08)]">{{ item.categoryName }}</span>
          <span class="rounded-full px-3 py-1 text-xs font-semibold ring-1" :class="item.status === 'ACTIVE' ? 'bg-[rgba(242,210,33,0.16)] text-[#8A6A00] ring-[rgba(242,210,33,0.2)]' : 'bg-[rgba(46,34,10,0.06)] text-neutral-500 ring-[rgba(46,34,10,0.08)]'">{{ item.status === 'ACTIVE' ? '활성' : '일시정지' }}</span>
          <span class="rounded-full bg-[rgba(242,210,33,0.08)] px-3 py-1 text-xs font-semibold text-[#8A6A00] ring-1 ring-[rgba(242,210,33,0.16)]">{{ dDayLabel(item.nextPaymentDate) }}</span>
        </div>
        <div class="mt-3 grid gap-2 text-sm text-neutral-500 md:grid-cols-2">
          <p>다음 결제일 · {{ formatDate(item.nextPaymentDate) }}</p>
          <p class="inline-flex items-center gap-2">결제 카드 ·
            <AppAsset type="card" :value="item.paymentCardName" fallback="creditcard" :size="12" wrapper-class="inline-flex items-center justify-center" image-class="h-5 w-5 rounded-md bg-white p-0.5 ring-1 ring-[rgba(46,34,10,0.08)] object-contain" icon-class="text-[#8A6A00]" badge-class="inline-flex min-w-[36px] items-center justify-center rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[-0.02em]" />
            {{ item.paymentCardName }}
          </p>
          <p>등록일 · {{ formatDate(item.registeredAt) }}</p>
          <p>최근 수정일 · {{ formatDate(item.updatedAt) }}</p>
        </div>
      </div>
      <div class="shrink-0 text-right">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">결제 금액</p>
        <p class="mt-2 text-lg font-bold text-neutral-900">{{ formatCurrency(item.paymentAmount) }}</p>
      </div>
    </div>
  </button>
</template>
