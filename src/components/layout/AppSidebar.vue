<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BrandLockup from '@/components/common/BrandLockup.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()

const sections = computed(() => [
  {
    title: 'Subscription Manager Core',
    items: [
      { label: '대시보드', to: '/dashboard', desc: '이번 달 결제와 핵심 요약 확인', icon: 'home' },
      { label: '구독목록', to: '/subscriptions', desc: '등록 항목과 상세 정보 확인', icon: 'list' },
      { label: '구독추가', to: '/subscriptions/new', desc: '카테고리부터 결제 정보까지 등록', icon: 'plus' },
      { label: '결제 캘린더', to: '/calendar', desc: '날짜별 일정과 월별 소비 흐름 확인', icon: 'calendar' },
      { label: '커뮤니티', to: '/community', desc: '사용 경험과 팁 공유', icon: 'community' },
      { label: 'AI 추천', to: '/ai-recommendations', desc: 'AI 구독 조합 추천과 저장 기록 관리', icon: 'bot' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: '알림 센터', to: '/notifications', desc: '결제와 인사이트 알림 확인', icon: 'bell' },
      { label: '결제 카드', to: '/payment-cards', desc: '카드 등록·수정·삭제 관리', icon: 'creditcard' },
      { label: 'FAQ', to: '/faq', desc: '자주 묻는 질문 빠르게 확인', icon: 'faq' },
      { label: '마이페이지', to: '/mypage', desc: '프로필과 환경설정 관리', icon: 'user' },
    ],
  },
])

const isActive = (to) => route.path === to || route.path.startsWith(`${to}/`)
</script>

<template>
  <aside class="side hidden xl:flex">
    <RouterLink to="/" class="side__brand utility-panel">
      <BrandLockup eyebrow="Subscription Utility" title="Subees" subtitle="구독·결제·캘린더를 한 곳에 정리해요" :size="58" />
    </RouterLink>

    <nav class="side__nav utility-panel">
      <template v-for="section in sections" :key="section.title">
        <div class="side__group-label">{{ section.title }}</div>
        <RouterLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          class="side__item"
          :class="{ 'side__item--active': isActive(item.to) }"
        >
          <span class="side__icon" :class="{ 'side__icon--active': isActive(item.to) }">
            <AppIcon :name="item.icon" :size="18" />
          </span>
          <span class="side__item-copy">
            <span class="side__item-label">{{ item.label }}</span>
            <span class="side__item-description">{{ item.desc }}</span>
          </span>
        </RouterLink>
      </template>
    </nav>
  </aside>
</template>

<style scoped>
.side {
  position: sticky;
  top: 0;
  height: calc(100vh - 64px);
  width: 320px;
  padding: 22px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.side__brand {
  width: 100%;
  padding: 18px;
  text-decoration: none;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.side__brand:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 30px rgba(33, 24, 8, 0.07);
  border-color: rgba(242, 210, 33, 0.18);
}
.side__nav {
  padding: 14px;
  display: grid;
  gap: 6px;
  overflow-y: auto;
}
.side__group-label {
  padding: 6px 8px 8px;
  font-size: 11px;
  font-weight: 800;
  color: #c7b895;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.side__item {
  min-height: 60px;
  border: 1px solid transparent;
  border-radius: 22px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  color: #61563d;
  font-weight: 700;
  text-decoration: none;
  transition: transform .18s ease, background-color .18s ease, border-color .18s ease, color .18s ease;
}
.side__item:hover {
  background: rgba(247, 241, 227, 0.84);
  border-color: rgba(46, 34, 10, 0.08);
}
.side__item--active {
  background: rgba(242, 210, 33, 0.16);
  border-color: rgba(242, 210, 33, 0.28);
  color: #8a6a00;
}
.side__icon {
  width: 42px;
  height: 42px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(247, 241, 227, 0.96);
  border: 1px solid rgba(46, 34, 10, 0.08);
  color: #61563d;
  flex-shrink: 0;
}
.side__icon--active {
  color: #8a6a00;
  background: rgba(255, 249, 226, 0.96);
  border-color: rgba(242, 210, 33, 0.3);
}
.side__item-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}
.side__item-label {
  font-size: 14px;
  font-weight: 800;
  color: #302516;
}
.side__item-description {
  font-size: 12px;
  color: #61563d;
  line-height: 1.4;
}
@media (min-width: 1536px) {
  .side {
    width: 336px;
  }
}
</style>
