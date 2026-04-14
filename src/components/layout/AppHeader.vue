<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const { unreadCount } = storeToRefs(notificationsStore)

const pageMeta = computed(() => {
  const byName = {
    dashboard: {
      eyebrow: '대시보드',
      title: '사용자님, 구독·결제·캘린더를 한 곳에 정리했어요!',
      description: '이번 달 결제 요약과 가까운 결제 일정을 확인하세요.',
    },
    subscriptions: {
      eyebrow: '구독목록',
      title: '등록된 구독을 한눈에 확인하세요',
      description: '등록된 구독과 다음 결제일을 한눈에 확인할 수 있습니다.',
    },
    'subscription-create': {
      eyebrow: '구독추가',
      title: '카테고리 선택부터 결제 정보까지 순서대로 등록하세요',
      description: '카테고리 선택부터 결제 정보 입력까지 순서대로 등록합니다.',
    },
    calendar: {
      eyebrow: '결제 캘린더',
      title: '날짜별 결제 일정과 월별 소비를 함께 보세요',
      description: '달력에서 일정 확인 후 날짜별 상세를 바로 확인할 수 있습니다.',
    },
    community: {
      eyebrow: '커뮤니티',
      title: '구독 관리 경험을 서로 공유하는 게시판',
      description: '게시글 목록과 상세, 작성, 스크랩을 빠르게 이용할 수 있습니다.',
    },
    faq: {
      eyebrow: 'FAQ',
      title: '자주 묻는 질문',
      description: '가입, 구독 등록, 결제 캘린더, 커뮤니티, 마이페이지 흐름 중심으로 질문을 묶었습니다.',
    },
    mypage: {
      eyebrow: '마이페이지',
      title: '프로필과 환경설정을 한곳에서 관리하세요',
      description: '프로필과 알림 설정을 한곳에서 관리할 수 있습니다.',
    },
    notifications: {
      eyebrow: '알림 센터',
      title: '결제·지출·커뮤니티 알림을 한곳에서 확인하세요',
      description: '결제 예정, 인사이트, 커뮤니티 반응을 읽음 상태와 함께 관리합니다.',
    },
    'payment-cards': {
      eyebrow: '결제 카드',
      title: '구독에 연결할 카드를 등록하고 관리하세요',
      description: '카드 등록, 수정, 삭제, 기본 카드 지정까지 같은 화면에서 처리합니다.',
    },
  }

  return byName[route.name] || {
    eyebrow: route.meta.pageTitle || 'Subees',
    title: route.meta.pageTitle || 'Subees Workspace',
    description: '필요한 정보를 빠르게 확인할 수 있습니다.',
  }
})

const headerActions = computed(() => {
  const actionsByName = {
    dashboard: {
      primary: { label: '구독 추가', to: '/subscriptions/new' },
      secondary: { label: '구독 목록', to: '/subscriptions' },
    },
    subscriptions: {
      primary: { label: '구독 추가', to: '/subscriptions/new' },
      secondary: { label: '결제 캘린더', to: '/calendar' },
    },
    'subscription-create': {
      primary: { label: '결제 캘린더', to: '/calendar' },
      secondary: { label: '구독 목록', to: '/subscriptions' },
    },
    calendar: {
      primary: { label: '구독 추가', to: '/subscriptions/new' },
      secondary: { label: '구독 목록', to: '/subscriptions' },
    },
    community: {
      primary: { label: '게시글 작성', to: '/community/new' },
      secondary: { label: '스크랩 목록', to: '/community/scraps' },
    },
    faq: {
      primary: { label: '구독 추가', to: '/subscriptions/new' },
      secondary: { label: '결제 캘린더', to: '/calendar' },
    },
    mypage: {
      primary: { label: '구독 목록', to: '/subscriptions' },
      secondary: { label: '대시보드', to: '/dashboard' },
    },
    notifications: {
      primary: { label: '마이페이지', to: '/mypage' },
      secondary: { label: '대시보드', to: '/dashboard' },
    },
    'payment-cards': {
      primary: { label: '구독 추가', to: '/subscriptions/new' },
      secondary: { label: '구독 목록', to: '/subscriptions' },
    },
  }

  return actionsByName[route.name] || {
    primary: { label: '구독 추가', to: '/subscriptions/new' },
    secondary: { label: '대시보드', to: '/dashboard' },
  }
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-3 z-30 mb-4 overflow-hidden rounded-[26px] border border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,249,0.84)] shadow-soft backdrop-blur">
    <div class="flex flex-col gap-4 bg-[linear-gradient(180deg,rgba(240,228,186,0.3),rgba(255,253,249,0.82))] px-5 py-4 lg:flex-row lg:items-center lg:justify-between xl:px-6">
      <div class="min-w-0 flex-1">
        <p class="page-eyebrow">{{ pageMeta.eyebrow }}</p>
        <h1 class="mt-1 text-[24px] font-extrabold leading-[1.22] tracking-[-0.04em] text-neutral-900 xl:text-[28px]">{{ pageMeta.title }}</h1>
        <p class="mt-2 max-w-4xl text-sm leading-6 text-neutral-500">{{ pageMeta.description }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 lg:justify-end">
        <RouterLink to="/notifications" class="relative tertiary-button !min-h-10 !px-3.5">
          <span class="inline-flex items-center gap-2"><AppIcon name="bell" :size="16" />알림</span>
          <span v-if="unreadCount" class="absolute -right-1 -top-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-[10px] font-black text-[#231A07]">{{ unreadCount }}</span>
        </RouterLink>
        <RouterLink to="/" class="tertiary-button !min-h-10 !px-3.5">메인</RouterLink>
        <RouterLink :to="headerActions.secondary.to" class="secondary-button !min-h-10 !px-4">{{ headerActions.secondary.label }}</RouterLink>
        <RouterLink :to="headerActions.primary.to" class="primary-button !min-h-10 !px-4">{{ headerActions.primary.label }}</RouterLink>
        <button class="tertiary-button !min-h-10 !px-3.5 text-neutral-700" @click="handleLogout">로그아웃</button>
      </div>
    </div>
  </header>
</template>
