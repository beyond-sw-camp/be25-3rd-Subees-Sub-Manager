<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import AppAsset from '@/components/ui/AppAsset.vue'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'

const router = useRouter()
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

const monthLabel = computed(() => dashboardStore.userSummary.billingWindowLabel || '이번 달')
const dueSoon = computed(() => dashboardStore.upcomingSubscriptions.slice(0, 4))
const hasSubscriptions = computed(() => dashboardStore.userSummary.activeSubscriptionCount > 0)
const topCategory = computed(() => dashboardStore.highestCategory)

const overviewCards = computed(() => ([
  { label: '이번 달 결제', value: formatCurrency(dashboardStore.userSummary.monthlyExpectedAmount), caption: '예상 총액' },
  { label: '다음 결제', value: dashboardStore.userSummary.nextPaymentDate, caption: dashboardStore.nextPayment.subscriptionName },
  { label: '활성 구독', value: `${dashboardStore.userSummary.activeSubscriptionCount}개`, caption: '정기 결제 기준' },
  { label: '절감 가능', value: formatCurrency(dashboardStore.userSummary.potentialSavingsAmount), caption: '중복·미사용 추정' },
]))

const monthlyTrend = computed(() => {
  const max = Math.max(...dashboardStore.monthlySpendTrend.map((item) => item.totalAmount), 1)
  return dashboardStore.monthlySpendTrend.map((item) => ({
    ...item,
    height: Math.max(18, Math.round((item.totalAmount / max) * 88)),
  }))
})

const go = (path) => router.push(path)
const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`
</script>

<template>
  <AppShell>
    <AppStatePanel
      v-if="!hasSubscriptions"
      title="아직 등록된 구독이 없습니다"
      description="첫 구독을 등록하면 대시보드와 결제 캘린더가 바로 채워집니다."
      icon="plus"
    >
      <template #actions>
        <button class="primary-button" @click="go('/subscriptions/new')">첫 구독 등록</button>
        <button class="secondary-button" @click="go('/calendar')">결제 캘린더</button>
      </template>
    </AppStatePanel>

    <template v-else>
      <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div class="section-card !p-5 lg:!p-6">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="eyebrow-label">{{ monthLabel }}</p>
              <h1 class="mt-2 text-[26px] font-black tracking-[-0.04em] text-neutral-900 lg:text-[32px]">{{ authStore.nickname || dashboardStore.userSummary.nickname || '사용자' }}님 대시보드</h1>
              <p class="mt-2 text-sm leading-6 text-neutral-500">이번 달 결제 총액과 가까운 결제 일정을 먼저 확인하세요.</p>
            </div>
            <div class="flex flex-wrap gap-2.5">
              <button class="primary-button !min-h-[44px] !px-4" @click="go('/subscriptions/new')">구독 추가</button>
              <button class="secondary-button !min-h-[44px] !px-4" @click="go('/calendar')">결제 캘린더</button>
            </div>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <article v-for="card in overviewCards" :key="card.label" class="dense-card !rounded-[22px] !p-4">
              <p class="text-[12px] font-bold text-neutral-500">{{ card.label }}</p>
              <strong class="mt-2 block text-[20px] font-black tracking-[-0.03em] text-neutral-900">{{ card.value }}</strong>
              <p class="mt-1.5 text-[12px] text-neutral-400">{{ card.caption }}</p>
            </article>
          </div>

          <div class="mt-4 grid gap-4 xl:grid-cols-[1fr_0.92fr]">
            <section class="ghost-card p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <h2 class="text-[18px] font-bold tracking-[-0.02em] text-neutral-900">곧 결제되는 구독</h2>
                  <p class="mt-1 text-[13px] text-neutral-500">가까운 날짜 순</p>
                </div>
                <RouterLink to="/subscriptions" class="text-sm font-semibold text-brand-600">전체 보기</RouterLink>
              </div>

              <div class="mt-4 grid gap-3">
                <article v-for="item in dueSoon" :key="item.subscriptionId" class="flex items-center justify-between gap-3 rounded-[18px] border border-[rgba(46,34,10,0.08)] bg-white px-4 py-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 ring-1 ring-[rgba(46,34,10,0.08)]">
                      <AppAsset
                        type="service"
                        :value="item.subscriptionName"
                        secondary-type="category"
                        :secondary-value="item.categoryName"
                        fallback="sparkles"
                        :size="16"
                        wrapper-class="inline-flex items-center justify-center"
                        image-class="h-6 w-6 object-contain"
                        icon-class="text-[#8A6A00]"
                      />
                    </span>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-bold text-neutral-900">{{ item.subscriptionName }}</p>
                      <p class="mt-1 text-[12px] text-neutral-500">{{ item.nextPaymentDate }} · {{ formatCurrency(item.paymentAmount) }}</p>
                    </div>
                  </div>
                  <span class="text-xs font-extrabold text-[#8A6A00]">D-{{ item.dDay }}</span>
                </article>
              </div>
            </section>

            <section class="rounded-[24px] border border-[rgba(46,34,10,0.08)] bg-[linear-gradient(180deg,rgba(255,248,221,0.9),rgba(255,253,247,0.95))] p-4">
              <p class="text-sm font-semibold text-[#8A6A00]">이번 달 핵심</p>
              <p class="mt-3 text-[28px] font-black tracking-[-0.04em] text-neutral-900">{{ formatCurrency(dashboardStore.userSummary.monthlyExpectedAmount) }}</p>
              <p class="mt-2 text-sm leading-6 text-neutral-500">{{ dashboardStore.nextPayment.subscriptionName }} 결제가 가장 가깝고, {{ dashboardStore.userSummary.activeSubscriptionCount }}개의 구독이 활성 상태입니다.</p>
              <div class="mt-4 grid gap-2.5">
                <div class="rounded-[18px] border border-[rgba(46,34,10,0.08)] bg-white/88 px-4 py-3">
                  <p class="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">다음 결제</p>
                  <p class="mt-1.5 text-sm font-bold text-neutral-900">{{ dashboardStore.nextPayment.nextPaymentDate }} · {{ dashboardStore.nextPayment.paymentCardName }}</p>
                </div>
                <div class="rounded-[18px] border border-[rgba(46,34,10,0.08)] bg-white/88 px-4 py-3">
                  <p class="text-xs font-bold uppercase tracking-[0.08em] text-neutral-400">카테고리</p>
                  <p class="mt-1.5 text-sm font-bold text-neutral-900">{{ topCategory?.categoryName || '없음' }} · {{ topCategory ? `${topCategory.ratio}%` : '-' }}</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="section-card !p-5 lg:!p-6">
          <div>
            <p class="eyebrow-label">카테고리별 소비</p>
            <h2 class="mt-2 text-[22px] font-bold tracking-[-0.03em] text-neutral-900">가장 많이 쓰는 분야</h2>
          </div>

          <div class="mt-4 grid gap-3">
            <article v-for="row in dashboardStore.categorySpendSummary" :key="row.categoryName" class="ghost-card p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <AppAsset
                    type="category"
                    :value="row.categoryName"
                    fallback="grid"
                    :size="16"
                    wrapper-class="inline-flex items-center justify-center"
                    image-class="h-8 w-8 rounded-xl object-contain bg-white p-1 ring-1 ring-[rgba(46,34,10,0.08)]"
                    icon-class="text-[#8A6A00]"
                  />
                  <div>
                    <p class="text-sm font-bold text-neutral-900">{{ row.categoryName }}</p>
                    <p class="mt-1 text-xs text-neutral-500">{{ row.subscriptionCount }}개 구독</p>
                  </div>
                </div>
                <div class="text-right">
                  <strong class="text-sm text-neutral-900">{{ formatCurrency(row.totalAmount) }}</strong>
                  <p class="mt-1 text-xs text-neutral-500">{{ row.ratio }}%</p>
                </div>
              </div>
              <div class="mt-3 h-[8px] overflow-hidden rounded-full bg-[rgba(46,34,10,0.08)]">
                <span class="block h-full rounded-full bg-[linear-gradient(90deg,#f5d85d,#b68242)]" :style="{ width: `${row.ratio}%` }"></span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="section-card !p-5 lg:!p-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="eyebrow-label">월별 흐름</p>
            <h2 class="mt-2 text-[22px] font-bold tracking-[-0.03em] text-neutral-900">최근 6개월 지출</h2>
          </div>
          <p class="text-sm text-neutral-500">평균 {{ formatCurrency(dashboardStore.averageMonthlySpend) }}</p>
        </div>

        <div class="mt-5 grid grid-cols-6 items-end gap-3">
          <article v-for="item in monthlyTrend" :key="item.key" class="flex flex-col items-center gap-2 text-center">
            <div class="flex h-36 w-full items-end rounded-[18px] bg-[rgba(240,233,216,0.96)] p-1.5 ring-1 ring-[rgba(46,34,10,0.05)]">
              <div
                class="w-full rounded-[14px]"
                :class="item.isCurrent ? 'bg-[linear-gradient(180deg,#7A5836,#503A22)]' : 'bg-[linear-gradient(180deg,#f2d84f,#d7b448)]'"
                :style="{ height: `${item.height}px` }"
              ></div>
            </div>
            <div>
              <p class="text-[12px] font-bold text-neutral-900">{{ item.monthLabel }}</p>
              <p class="mt-1 text-[11px] text-neutral-500">{{ formatCurrency(item.totalAmount) }}</p>
            </div>
          </article>
        </div>
      </section>
    </template>
  </AppShell>
</template>
