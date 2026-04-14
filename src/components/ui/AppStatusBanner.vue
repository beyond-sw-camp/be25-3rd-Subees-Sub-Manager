<script setup>
import { computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps({
  tone: { type: String, default: 'info' },
  title: { type: String, default: '안내' },
  message: { type: String, default: '' },
})

const toneClass = computed(() => ({
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-amber-200 bg-amber-50 text-[#8A6A00]',
}[props.tone] || 'border-amber-200 bg-amber-50 text-[#8A6A00]'))

const iconName = computed(() => ({
  error: 'help',
  success: 'sparkles',
  info: 'bell',
}[props.tone] || 'bell'))
</script>

<template>
  <section class="rounded-card border px-5 py-4" :class="toneClass">
    <div class="flex items-start gap-3">
      <div class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/80 ring-1 ring-[rgba(46,34,10,0.08)]">
        <AppIcon :name="iconName" :size="18" />
      </div>
      <div>
        <p class="text-sm font-bold">{{ title }}</p>
        <p class="mt-1 text-sm leading-6">{{ message }}</p>
      </div>
    </div>
  </section>
</template>
