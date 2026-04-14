<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import BrandLockup from '@/components/common/BrandLockup.vue'
import AppAsset from '@/components/ui/AppAsset.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import PublicFooter from '@/components/layout/PublicFooter.vue'
import { animateScrollToTop } from '@/utils/smoothScroll'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const isAuthed = computed(() => authStore.isLoggedIn)
const showScrollTop = ref(false)
let scrollAnimationId = null

const handleWindowScroll = () => {
  showScrollTop.value = window.scrollY > 520
}

const summaryStats = computed(() => {
  if (!isAuthed.value) {
    return [
      { label: '이번 달 결제 금액', value: '248,000원', note: '예상 결제 총액' },
      { label: '다음 결제', value: '04/11', note: '가장 가까운 일정' },
      { label: '활성 구독', value: '12개', note: '정기 결제 기준' },
      { label: '절감 가능', value: '12,000원', note: '중복·미사용 추정' },
    ]
  }

  return [
    { label: '이번 달 결제 금액', value: formatCurrency(dashboardStore.userSummary.monthlyExpectedAmount), note: '예상 결제 총액' },
    { label: '다음 결제', value: dashboardStore.userSummary.nextPaymentDate, note: dashboardStore.nextPayment.subscriptionName },
    { label: '활성 구독', value: `${dashboardStore.userSummary.activeSubscriptionCount}개`, note: '정기 결제 기준' },
    { label: '절감 가능', value: formatCurrency(dashboardStore.userSummary.potentialSavingsAmount), note: '중복·미사용 추정' },
  ]
})

const previewItems = computed(() => dashboardStore.upcomingSubscriptions.slice(0, 4).map((item) => ({
  ...item,
  badge: `D-${item.dDay}`,
})))

const introCopy = computed(() => {
  if (!isAuthed.value) {
    return '넷플릭스부터 ChatGPT까지 흩어진 구독을 한 곳에 모아, 이번 달 결제 금액과 가장 가까운 일정을 바로 확인할 수 있습니다.'
  }

  return `${authStore.nickname || '사용자'}님의 이번 달 예상 결제 금액은 ${formatCurrency(dashboardStore.userSummary.monthlyExpectedAmount)}이며, 가장 가까운 결제일은 ${dashboardStore.userSummary.nextPaymentDate}입니다.`
})

const heroHighlights = computed(() => {
  if (!isAuthed.value) {
    return ['이번 달 결제 금액 확인', '가장 가까운 결제일 추적', '카테고리별 지출 흐름 정리']
  }

  return [
    `${authStore.nickname || '사용자'}님 구독 요약`,
    `${dashboardStore.userSummary.activeSubscriptionCount}개 활성 구독`,
    `절감 가능 ${formatCurrency(dashboardStore.userSummary.potentialSavingsAmount)}`,
  ]
})

const featureCards = [
  { title: '구독 등록', desc: '서비스명, 금액, 주기, 결제일을 표준 폼으로 정리합니다.', fallback: 'plus' },
  { title: '결제일 알림', desc: '가까운 결제 일정만 모아 빠르게 확인할 수 있습니다.', fallback: 'bell' },
  { title: '캘린더', desc: '달력과 리스트를 함께 보며 월별 흐름을 파악합니다.', fallback: 'calendar' },
  { title: '지출 분석', desc: '월별 흐름과 카테고리 비중을 같은 캘린더 화면에서 확인합니다.', fallback: 'chart' },
  { title: '카테고리 분류', desc: 'OTT, 음악, AI, 클라우드 비중을 시각적으로 나눕니다.', fallback: 'grid' },
  { title: '절감 포인트', desc: '중복·미사용 후보를 찾아 정리 우선순위를 제안합니다.', fallback: 'sparkles' },
]

const categories = [
  {
    key: 'ott',
    label: 'OTT',
    headline: '자주 쓰는 영상 구독을 먼저 정리하세요',
    description: '넷플릭스, 티빙, 디즈니+, 웨이브처럼 자주 보는 OTT를 한 줄에서 빠르게 스캔할 수 있어요.',
    accent: 'rgba(186,107,82,0.14)',
    services: ['넷플릭스', '티빙', '디즈니+', '웨이브', '직접입력'],
    layout: 'xl:col-span-4',
  },
  {
    key: 'music',
    label: '음악',
    headline: '음악 구독도 같은 방식으로 깔끔하게',
    description: '멜론, Spotify, 지니, Apple Music을 한 번에 모아서 결제 흐름을 확인할 수 있습니다.',
    accent: 'rgba(93,130,96,0.14)',
    services: ['멜론', 'Spotify', '지니', '애플뮤직', '직접입력'],
    layout: 'xl:col-span-4',
  },
  {
    key: 'ai',
    label: 'AI',
    headline: '업무형 AI 구독까지 같은 구조로',
    description: 'ChatGPT, Gemini, Claude처럼 업무에 쓰는 AI 구독도 카테고리별로 바로 묶어볼 수 있어요.',
    accent: 'rgba(138,106,0,0.14)',
    services: ['ChatGPT', 'Gemini', 'Claude', '직접입력'],
    layout: 'xl:col-span-4',
  },
  {
    key: 'cloud',
    label: '클라우드',
    headline: '보관형 서비스도 결제일 기준으로 관리',
    description: 'iCloud+, 카카오 톡서랍처럼 클라우드/보관형 구독도 함께 넣어 월별 흐름을 볼 수 있습니다.',
    accent: 'rgba(199,184,149,0.22)',
    services: ['iCloud+', '카카오 톡서랍', '직접입력'],
    layout: 'xl:col-span-6',
  },
  {
    key: 'other',
    label: '그 외',
    headline: '생활형 멤버십도 빠짐없이 추가',
    description: '배민클럽, 쿠팡와우, 이모티콘 플러스처럼 생활형 구독도 같은 카드 구조로 정리됩니다.',
    accent: 'rgba(153,140,113,0.16)',
    services: ['배민클럽', '쿠팡와우', '이모티콘 플러스', '직접입력'],
    layout: 'xl:col-span-6',
  },
]

const steps = [
  { n: '1', title: '구독 등록', desc: '카테고리와 서비스, 금액, 결제 주기를 한 번에 입력합니다.', detail: '대표 로고 선택 + 직접 입력 지원', type: 'core', value: '구독 추가', fallback: 'plus' },
  { n: '2', title: '카드 연결', desc: '토스·현대·신한 등 실제 카드 이미지로 결제수단을 정리합니다.', detail: '결제 카드와 시작일을 함께 저장', type: 'card', value: '현대카드', fallback: 'creditcard' },
  { n: '3', title: '월간 확인', desc: '달력에서 날짜별 결제 아이콘과 총액을 빠르게 훑습니다.', detail: '선택 날짜 상세 패널 즉시 확인', type: 'core', value: '결제 캘린더', fallback: 'calendar' },
  { n: '4', title: '정리 판단', desc: '대시보드에서 카테고리 비중과 가까운 결제 일정을 확인합니다.', detail: '과한 지출 카테고리부터 점검', type: 'core', value: '대시보드', fallback: 'home' },
]

const quickMenus = [
  { label: '대시보드', desc: '이번 달 결제 금액과 다음 결제일 확인', meta: '핵심 요약', to: '/dashboard', type: 'core', value: '대시보드', fallback: 'home' },
  { label: '구독 추가', desc: '카테고리부터 카드 선택까지 바로 등록', meta: '등록 시작', to: '/subscriptions/new', type: 'core', value: '구독 추가', fallback: 'plus' },
  { label: '결제 캘린더', desc: '날짜별 일정과 월 총액을 한 화면에서 확인', meta: '일정 확인', to: '/calendar', type: 'core', value: '결제 캘린더', fallback: 'calendar' },
  { label: '구독목록', desc: '서비스명 검색 후 전체 항목을 빠르게 정리', meta: '목록 관리', to: '/subscriptions', type: 'core', value: '구독목록', fallback: 'list' },
]

const faqs = [
  { q: '구독은 어디서 등록하나요?', a: '구독 추가 메뉴에서 카테고리, 서비스, 금액, 카드, 결제일을 순서대로 입력하면 됩니다.' },
  { q: '캘린더는 어디서 보나요?', a: '결제 캘린더 페이지에서 월별 일정과 날짜별 결제 항목을 함께 볼 수 있습니다.' },
  { q: '카드 이미지를 고를 수 있나요?', a: '구독 추가와 수정 화면에서 카드 이미지를 선택하거나 직접 입력할 수 있습니다.' },
  { q: '로그인 후 메인 화면이 달라지나요?', a: '로그인 후에는 실제 등록한 구독 데이터가 대시보드와 연동되어 표시됩니다.' },
]

const go = (path, needAuth = false) => {
  if (needAuth && !isAuthed.value) {
    router.push({ path: '/login', query: { redirect: path } })
    return
  }
  router.push(path)
}

const start = () => {
  router.push(isAuthed.value ? '/dashboard' : '/signup')
}

const openSupportAction = () => {
  router.push(isAuthed.value ? '/subscriptions/new' : '/login')
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const scrollToTop = () => {
  if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId)
  scrollAnimationId = animateScrollToTop({ duration: 680 })
}

onMounted(() => {
  handleWindowScroll()
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll)
  if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId)
})
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-40 border-b border-[rgba(46,34,10,0.08)] bg-[rgba(255,249,230,0.82)] backdrop-blur">
      <div class="mx-auto flex w-full max-w-publicShell items-center justify-between gap-4 px-6 py-3 xl:px-8 2xl:px-10">
        <RouterLink to="/" class="min-w-0">
          <BrandLockup eyebrow="Subscription Utility" title="Subees" subtitle="구독·결제·캘린더를 한 곳에 정리해요" :size="44" />
        </RouterLink>

        <nav class="flex flex-wrap items-center justify-end gap-2.5">
          <button v-if="isAuthed" class="secondary-button !min-h-10 !px-4" @click="go('/dashboard')">대시보드</button>
          <button v-if="isAuthed" class="tertiary-button !min-h-10 !px-4 text-neutral-700" @click="handleLogout">로그아웃</button>
          <template v-else>
            <RouterLink to="/login" class="secondary-button !min-h-10 !px-4">로그인</RouterLink>
            <RouterLink to="/signup" class="primary-button !min-h-10 !px-4">회원가입</RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <div class="px-6 pt-6 pb-8 xl:px-8 2xl:px-10">
      <div class="public-shell">
        <section class="section-card overflow-hidden">
          <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div class="min-w-0 flex-1">
              <div class="mt-1 inline-flex rounded-full bg-[rgba(242,210,33,0.16)] px-3 py-1 text-xs font-extrabold text-[#8A6A00]">Subees Preview</div>
              <h1 class="mt-5 text-[34px] font-bold leading-[1.14] tracking-[-0.05em] text-neutral-900 lg:text-[52px]">
                흩어진 구독을 한 곳에 모아,<br class="hidden lg:block" />이번 달 결제와 다음 일정을 바로 확인하세요.
              </h1>
              <p class="mt-4 max-w-[780px] text-[16px] leading-8 text-neutral-500">{{ introCopy }}</p>

              <div class="mt-5 flex flex-wrap gap-2.5">
                <span
                  v-for="tag in heroHighlights"
                  :key="tag"
                  class="inline-flex min-h-[36px] items-center rounded-full border border-[rgba(46,34,10,0.08)] bg-white/70 px-4 text-[13px] font-bold text-neutral-700"
                >
                  {{ tag }}
                </span>
              </div>

              <div class="mt-7 flex flex-wrap items-center gap-3">
                <button class="primary-button" @click="start">{{ isAuthed ? '대시보드 열기' : '무료로 시작하기' }}</button>
                <button class="secondary-button" @click="openSupportAction">{{ isAuthed ? '구독 추가' : '로그인' }}</button>
                <button v-if="isAuthed" class="tertiary-button" @click="go('/calendar', true)">결제 캘린더</button>
              </div>
              <p class="mt-3 cta-helper">{{ isAuthed ? '이번 달 결제 요약을 확인한 뒤, 구독 추가나 결제 캘린더로 바로 이동할 수 있습니다.' : '회원가입 후 바로 로그인해 대시보드와 결제 캘린더를 이용할 수 있습니다.' }}</p>

              <div class="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <article v-for="stat in summaryStats" :key="stat.label" class="ghost-card p-5">
                  <p class="text-[13px] font-bold text-neutral-500">{{ stat.label }}</p>
                  <strong class="mt-3 block text-[26px] font-bold tracking-[-0.03em] text-neutral-900">{{ stat.value }}</strong>
                  <p class="mt-3 meta-copy">{{ stat.note }}</p>
                </article>
              </div>
            </div>

            <aside class="shell-card bg-[linear-gradient(180deg,rgba(242,210,33,0.14),rgba(255,253,247,0.94))] p-6 xl:w-[390px] xl:shrink-0 2xl:w-[430px]">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="eyebrow-label">Preview</p>
                  <h2 class="mt-2 text-[24px] font-bold tracking-[-0.04em] text-neutral-900">이번 달 요약</h2>
                </div>
                <span class="chip-button is-selected !min-h-[30px] !px-3 !text-xs">{{ isAuthed ? '실데이터' : '미리보기' }}</span>
              </div>

              <div class="mt-5 grid gap-3">
                <button
                  v-for="item in previewItems"
                  :key="item.subscriptionId"
                  type="button"
                  class="flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(46,34,10,0.08)] bg-white px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-soft"
                  @click="go('/calendar', true)"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 ring-1 ring-[rgba(46,34,10,0.08)]">
                      <AppAsset
                        type="service"
                        :value="item.subscriptionName"
                        fallback="sparkles"
                        :size="18"
                        wrapper-class="inline-flex items-center justify-center"
                        image-class="h-7 w-7 object-contain"
                        icon-class="text-[#8A6A00]"
                      />
                    </span>
                    <div class="min-w-0">
                      <strong class="block truncate text-sm text-neutral-900">{{ item.subscriptionName }}</strong>
                      <p class="mt-1 text-xs text-neutral-500">{{ item.nextPaymentDate }} / {{ formatCurrency(item.paymentAmount) }}</p>
                    </div>
                  </div>
                  <span class="shrink-0 text-xs font-extrabold text-[#8A6A00]">{{ item.badge }}</span>
                </button>
              </div>

              <div class="mt-5 grid gap-3">
                <button class="primary-button !min-h-[48px] w-full" @click="go('/subscriptions', true)">구독 목록 보기</button>
                <button class="secondary-button !min-h-[48px] w-full" @click="go('/calendar', true)">결제 캘린더 보기</button>
              </div>
            </aside>
          </div>
        </section>

        <section class="guide-card">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p class="eyebrow-label">처음 시작하는 흐름</p>
              <h2 class="mt-2 section-heading">가입 후 바로 써볼 수 있는 실제 사용 흐름입니다</h2>
              <p class="mt-2 body-copy">가입 → 첫 구독 등록 → 결제 캘린더 확인 → 대시보드 정리까지 바로 이어지는 구조로 구성했습니다.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="guide-pill">1. 회원가입</span>
              <span class="guide-pill">2. 첫 구독 등록</span>
              <span class="guide-pill">3. 캘린더 확인</span>
              <span class="guide-pill">4. 대시보드 정리</span>
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4 px-1">
            <p class="eyebrow-label">구독 등록</p>
            <h2 class="mt-2 text-[28px] font-bold tracking-[-0.04em] text-neutral-900">구독 관리에 필요한 기능을 한 눈에 확인해보세요</h2>
            <p class="mt-2 body-copy">구독 등록부터 결제 확인까지 필요한 기능을 빠르게 사용할 수 있습니다.</p>
          </div>
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <article v-for="card in featureCards" :key="card.title" class="shell-card p-5">
              <div class="flex items-center gap-4">
                <div class="grid h-14 w-14 place-items-center rounded-[18px] bg-[linear-gradient(180deg,#f2d221,#e0bc15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-[rgba(138,106,0,0.18)]">
                  <AppAsset
                    type="core"
                    :value="card.title"
                    :fallback="card.fallback"
                    :size="20"
                    wrapper-class="inline-flex items-center justify-center"
                    image-class="h-8 w-8 object-contain"
                    icon-class="text-white"
                  />
                </div>
                <strong class="text-base text-neutral-900">{{ card.title }}</strong>
              </div>
              <p class="mt-4 body-copy">{{ card.desc }}</p>
            </article>
          </div>
        </section>

        <section class="shell-card overflow-hidden p-6 lg:p-8">
          <div class="rounded-[30px] border border-[rgba(242,210,33,0.18)] bg-[linear-gradient(135deg,rgba(255,250,232,0.98),rgba(247,241,227,0.92))] p-6 lg:p-7">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p class="eyebrow-label">카테고리</p>
                <h2 class="mt-2 text-[28px] font-bold tracking-[-0.04em] text-neutral-900">OTT · 음악 · AI · 클라우드까지 한 번에</h2>
                <p class="mt-2 max-w-[780px] body-copy">카테고리 이미지와 실제 서비스 로고를 함께 배치해 원하는 구독을 빠르게 찾을 수 있게 구성했습니다.</p>
              </div>
              <span class="chip-button is-selected !min-h-[34px]">대표 카테고리</span>
            </div>

            <div class="mt-7 grid gap-5 xl:grid-cols-12">
              <article
                v-for="category in categories"
                :key="category.key"
                class="relative overflow-hidden rounded-[30px] border border-[rgba(46,34,10,0.08)] bg-white shadow-soft"
                :class="category.layout"
              >
                <div class="absolute inset-0 opacity-90" :style="{ background: `linear-gradient(160deg, ${category.accent}, rgba(255,255,255,0.92) 62%)` }"></div>
                <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/35 blur-2xl"></div>
                <div class="relative z-10 flex h-full flex-col p-6 lg:p-7">
                  <div class="flex items-start justify-between gap-4">
                    <div class="max-w-[65%]">
                      <p class="text-[11px] font-extrabold uppercase tracking-[0.12em] text-neutral-300">Category</p>
                      <strong class="mt-2 block text-[26px] font-black tracking-[-0.04em] text-neutral-900">{{ category.label }}</strong>
                      <p class="mt-3 text-[16px] font-semibold leading-7 text-neutral-700">{{ category.headline }}</p>
                      <p class="mt-2 text-[14px] leading-6 text-neutral-500">{{ category.description }}</p>
                    </div>
                    <div class="grid h-24 w-24 shrink-0 place-items-center rounded-[26px] bg-white/88 ring-1 ring-[rgba(46,34,10,0.08)] shadow-soft lg:h-28 lg:w-28">
                      <AppAsset
                        type="category"
                        :value="category.label"
                        fallback="grid"
                        :size="28"
                        wrapper-class="inline-flex items-center justify-center"
                        image-class="h-16 w-16 object-contain lg:h-20 lg:w-20"
                        icon-class="text-[#8A6A00]"
                      />
                    </div>
                  </div>

                  <div class="mt-6 rounded-[26px] border border-[rgba(46,34,10,0.06)] bg-white/88 p-4 lg:p-5">
                    <p class="text-[13px] font-bold text-neutral-500">빠르게 등록할 수 있는 대표 서비스</p>
                    <div class="mt-4 flex flex-wrap gap-2.5">
                      <span
                        v-for="service in category.services"
                        :key="service"
                        class="inline-flex min-h-[40px] items-center gap-2.5 rounded-full border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.92)] px-3.5 py-2 text-[13px] font-semibold text-neutral-700"
                      >
                        <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[rgba(46,34,10,0.06)]">
                          <AppAsset
                            type="service"
                            :value="service"
                            fallback="sparkles"
                            :size="12"
                            wrapper-class="inline-flex items-center justify-center"
                            image-class="h-4 w-4 object-contain"
                            icon-class="text-[#8A6A00]"
                          />
                        </span>
                        <span>{{ service === '직접입력' ? '직접 입력' : service }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div class="shell-card p-6 lg:p-8">
            <p class="eyebrow-label">사용 흐름</p>
            <h2 class="mt-2 text-[28px] font-bold tracking-[-0.04em] text-neutral-900">등록부터 확인까지 한 번에 이어지는 구조입니다</h2>
            <p class="mt-2 body-copy">한 화면마다 해야 할 일을 줄이고, 다음 화면으로 자연스럽게 이어지도록 구성했습니다.</p>
            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <article v-for="step in steps" :key="step.n" class="ghost-card flex h-full flex-col p-5">
                <div class="flex items-center gap-3">
                  <span class="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-sm font-bold text-[#231A07]">{{ step.n }}</span>
                  <AppAsset
                    :type="step.type"
                    :value="step.value"
                    :fallback="step.fallback"
                    :size="16"
                    wrapper-class="inline-flex items-center justify-center"
                    image-class="h-8 w-8 object-contain"
                    icon-class="text-[#8A6A00]"
                  />
                </div>
                <strong class="mt-4 block text-base text-neutral-900">{{ step.title }}</strong>
                <p class="mt-2 text-sm leading-6 text-neutral-600">{{ step.desc }}</p>
                <p class="mt-auto pt-3 text-[12px] font-semibold text-[#8A6A00]">{{ step.detail }}</p>
              </article>
            </div>
          </div>

          <div class="shell-card p-6 lg:p-8">
            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="eyebrow-label">빠른 이동</p>
                <h2 class="mt-2 text-[28px] font-bold tracking-[-0.04em] text-neutral-900">지금 바로 필요한 메뉴로 이동하세요</h2>
              </div>
              <span class="guide-pill">핵심 메뉴 4개</span>
            </div>
            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <button v-for="menu in quickMenus" :key="menu.label" type="button" class="ghost-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-soft" @click="go(menu.to, true)">
                <div class="flex items-start justify-between gap-3">
                  <div class="grid h-12 w-12 place-items-center rounded-[18px] bg-white ring-1 ring-[rgba(46,34,10,0.08)]">
                    <AppAsset
                      :type="menu.type"
                      :value="menu.value"
                      :fallback="menu.fallback"
                      :size="16"
                      wrapper-class="inline-flex items-center justify-center"
                      image-class="h-8 w-8 object-contain"
                      icon-class="text-[#8A6A00]"
                    />
                  </div>
                  <span class="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8A6A00]">{{ menu.meta }}</span>
                </div>
                <strong class="mt-4 block text-base text-neutral-900">{{ menu.label }}</strong>
                <p class="mt-2 text-sm leading-6 text-neutral-600">{{ menu.desc }}</p>
              </button>
            </div>
          </div>
        </section>

        <section class="section-card">
          <div class="border-b border-[rgba(46,34,10,0.08)] pb-5">
            <p class="eyebrow-label">FAQ</p>
            <h2 class="mt-2 text-[28px] font-bold tracking-[-0.04em] text-neutral-900">자주 찾는 질문을 먼저 모았습니다</h2>
          </div>
          <div class="mt-5 grid gap-3">
            <article v-for="faq in faqs" :key="faq.q" class="ghost-card p-5">
              <strong class="text-base text-neutral-900">{{ faq.q }}</strong>
              <p class="mt-3 body-copy">{{ faq.a }}</p>
            </article>
          </div>
        </section>
      </div>
    </div>

    <PublicFooter />

    <button
      type="button"
      aria-label="페이지 맨 위로 이동"
      class="fixed bottom-7 right-7 z-50 grid h-14 w-14 place-items-center rounded-full border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.96)] text-[#8A6A00] shadow-soft backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white active:scale-[0.96]"
      :class="showScrollTop ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-4 opacity-0 pointer-events-none'"
      @click="scrollToTop"
    >
      <span class="sr-only">맨 위로 이동</span>
      <AppIcon name="arrowup" :size="22" />
    </button>
  </div>
</template>
