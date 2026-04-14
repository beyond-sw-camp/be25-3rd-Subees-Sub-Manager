<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const footerLinks = [
  { label: '회원가입', to: '/signup' },
  { label: '로그인', to: '/login' },
  { label: '대시보드', to: { path: '/login', query: { redirect: '/dashboard' } } },
  { label: '결제 캘린더', to: { path: '/login', query: { redirect: '/calendar' } } },
]

const helpLinks = [
  { label: '서비스 안내', to: '/' },
  { label: '정책안내', to: '/' },
  { label: '고객지원', to: '/' },
]
</script>

<template>
  <footer class="border-t border-[rgba(46,34,10,0.08)] bg-brand-100">
    <div
      class="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-[clamp(24px,3vw,48px)]"
      :class="compact ? 'py-2.5 lg:flex-row lg:items-center lg:justify-between' : 'py-4 lg:flex-row lg:items-center lg:justify-between'"
    >
      <div class="flex min-w-0 items-center gap-3">
        <img
          src="/image/subees-logo.png"
          alt="Subees"
          class="rounded-full bg-white p-1 shadow-soft"
          :class="compact ? 'h-8 w-8' : 'h-10 w-10'"
        />
        <div class="min-w-0">
          <p class="font-extrabold uppercase tracking-[0.12em] text-neutral-300" :class="compact ? 'text-[10px]' : 'text-[11px]'">
            subscription utility
          </p>
          <div class="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
            <p class="font-black tracking-[-0.04em] text-neutral-900" :class="compact ? 'text-lg' : 'text-xl'">Subees</p>
            <p class="truncate text-neutral-500" :class="compact ? 'text-xs' : 'text-sm'">구독·결제·캘린더를 한 곳에</p>
          </div>
        </div>
      </div>

      <div class="text-neutral-500 lg:text-right" :class="compact ? 'text-xs font-semibold' : 'text-sm font-semibold'">
        <div class="flex flex-wrap gap-x-2 gap-y-0.5 lg:justify-end">
          <template v-for="(item, index) in footerLinks" :key="item.label">
            <RouterLink :to="item.to" class="transition hover:text-neutral-900">{{ item.label }}</RouterLink>
            <span v-if="index < footerLinks.length - 1">/</span>
          </template>
        </div>
        <div class="mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 lg:justify-end">
          <template v-for="(item, index) in helpLinks" :key="item.label">
            <RouterLink :to="item.to" class="transition hover:text-neutral-900">{{ item.label }}</RouterLink>
            <span v-if="index < helpLinks.length - 1">/</span>
          </template>
        </div>
      </div>
    </div>
  </footer>
</template>
