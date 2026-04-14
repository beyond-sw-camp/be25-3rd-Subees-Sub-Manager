<script setup>
import AppAsset from '@/components/ui/AppAsset.vue'

defineProps({
  weekdayLabels: {
    type: Array,
    default: () => [],
  },
  days: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`
const shortName = (value = '') => value.replace(/\s?(Premium|Plus|Family|Advanced|Creative Cloud|Pro)$/i, '').trim()
</script>

<template>
  <div class="rounded-[30px] border border-[rgba(46,34,10,0.1)] bg-[rgba(255,252,244,0.96)] p-4 shadow-soft md:p-5">
    <div class="grid grid-cols-7 gap-2 border-b border-[rgba(46,34,10,0.08)] pb-3">
      <div v-for="label in weekdayLabels" :key="label" class="px-1 text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-400">
        {{ label }}
      </div>
    </div>

    <div class="mt-4 grid grid-cols-7 gap-2.5 md:gap-3">
      <button
        v-for="day in days"
        :key="day.dateKey"
        type="button"
        class="group relative aspect-square overflow-hidden rounded-[24px] border p-2 text-left transition duration-200 active:scale-[0.985]"
        :class="day.isSelected
          ? 'border-[rgba(242,210,33,0.52)] bg-[linear-gradient(180deg,rgba(255,246,207,1),rgba(251,240,190,0.98))] shadow-[0_16px_30px_rgba(242,210,33,0.14)]'
          : day.isCurrentMonth
            ? 'border-[rgba(46,34,10,0.1)] bg-[rgba(255,255,255,0.98)] hover:-translate-y-0.5 hover:border-[rgba(138,106,0,0.22)] hover:shadow-soft'
            : 'border-[rgba(46,34,10,0.06)] bg-[rgba(242,238,228,0.92)] text-neutral-300 hover:border-[rgba(46,34,10,0.08)]'"
        @click="emit('select', day.dateKey)"
      >
        <div class="flex h-full flex-col">
          <div class="flex items-start justify-between gap-2">
            <span class="text-[13px] font-black" :class="day.isCurrentMonth ? 'text-neutral-900' : 'text-neutral-300'">{{ day.label }}</span>
            <span
              v-if="day.payments.length"
              class="inline-flex min-h-[22px] items-center rounded-full px-2 text-[9px] font-extrabold"
              :class="day.isSelected ? 'bg-[rgba(138,106,0,0.14)] text-[#735600]' : 'bg-[rgba(46,34,10,0.08)] text-neutral-700'"
            >
              {{ day.payments.length }}건
            </span>
          </div>

          <div class="mt-1.5 flex-1 overflow-hidden">
            <div v-if="day.payments.length" class="grid gap-1">
              <div
                v-for="item in day.payments.slice(0, 2)"
                :key="item.paymentId"
                class="flex items-center gap-2 rounded-[12px] border border-[rgba(46,34,10,0.08)] bg-[rgba(255,255,255,0.86)] px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"
                :class="day.isSelected ? 'border-[rgba(242,210,33,0.28)] bg-[rgba(255,253,242,0.96)]' : ''"
              >
                <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[rgba(46,34,10,0.08)]">
                  <AppAsset
                    type="service"
                    :value="item.subscriptionName"
                    secondary-type="category"
                    :secondary-value="item.categoryName"
                    fallback="calendar"
                    :size="12"
                    wrapper-class="inline-flex items-center justify-center"
                    image-class="h-[15px] w-[15px] object-contain"
                    icon-class="text-[#8A6A00]"
                  />
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[10px] font-bold leading-3.5 text-neutral-900">{{ shortName(item.subscriptionName) }}</p>
                  <p class="mt-0.5 truncate text-[9px] font-semibold text-neutral-500">{{ formatCurrency(item.paymentAmount) }}</p>
                </div>
              </div>

              <div
                v-if="day.payments.length > 2"
                class="inline-flex items-center justify-center rounded-[12px] border border-dashed border-[rgba(138,106,0,0.16)] bg-[rgba(255,248,221,0.92)] px-2 py-1 text-[9px] font-extrabold text-[#8A6A00]"
              >
                나머지 {{ day.payments.length - 2 }}건 더 보기
              </div>
            </div>

            <div v-else class="flex h-full items-center justify-center">
              <div class="h-8 w-14 rounded-full border border-dashed border-[rgba(46,34,10,0.08)] bg-[rgba(247,241,227,0.56)]"></div>
            </div>
          </div>

          <div class="mt-1.5 flex items-end justify-between gap-2">
            <p v-if="day.totalAmount" class="text-[10px] font-bold text-neutral-700">{{ formatCurrency(day.totalAmount) }}</p>
            <p v-else class="text-[10px] text-neutral-300">예정 없음</p>
            <span v-if="day.isSelected" class="rounded-full bg-[rgba(138,106,0,0.12)] px-2 py-1 text-[9px] font-extrabold text-[#8A6A00]">선택</span>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>
