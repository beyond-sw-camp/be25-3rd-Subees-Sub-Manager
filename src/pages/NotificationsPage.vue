<script setup>
import { computed, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const notificationsStore = useNotificationsStore()
const { unreadOnly, unreadCount, visibleNotifications } = storeToRefs(notificationsStore)

const activeNotificationId = computed(() => {
  const raw = Number(route.query.notificationId)
  return Number.isFinite(raw) ? raw : null
})

const typeLabel = (value) => ({ PAYMENT: '결제 알림', INSIGHT: '지출 인사이트', COMMUNITY: '커뮤니티', SYSTEM: '시스템' }[value] || '알림')

const scrollToActiveNotification = async () => {
  if (!activeNotificationId.value) return
  await nextTick()
  const target = document.getElementById(`notification-card-${activeNotificationId.value}`)
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

watch(activeNotificationId, () => {
  scrollToActiveNotification()
}, { immediate: true })
</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-6">
      <section class="shell-card p-7 md:p-8">
        <div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p class="text-sm font-semibold text-[#8A6A00]">알림 센터</p>
            <h1 class="mt-3 page-title !mt-0 !text-[34px] xl:!text-[42px]">결제, 인사이트, 커뮤니티 알림을 한 곳에서 확인하세요</h1>
            <p class="mt-3 max-w-4xl body-copy">결제 예정, 월간 인사이트, 커뮤니티 반응을 한곳에서 확인하고 읽음 상태와 닫기 처리를 바로 정리할 수 있습니다.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button type="button" class="secondary-button !min-h-11 !px-4" @click="notificationsStore.toggleUnreadOnly">{{ unreadOnly ? '전체 보기' : '안 읽은 알림만' }}</button>
            <button type="button" class="primary-button !min-h-11 !px-4" @click="notificationsStore.markAllRead">모두 읽음 처리</button>
          </div>
        </div>
      </section>
      <section class="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside class="grid gap-4 xl:sticky xl:top-6 xl:self-start">
          <article class="shell-card p-5">
            <p class="text-sm font-semibold text-[#8A6A00]">읽지 않은 알림</p>
            <p class="mt-2 text-[32px] font-black tracking-[-0.04em] text-neutral-900">{{ unreadCount }}개</p>
            <p class="mt-2 text-sm leading-6 text-neutral-500">결제 리마인더, 월간 인사이트, 커뮤니티 반응이 최신 순으로 정리됩니다.</p>
          </article>
          <article class="shell-card p-5">
            <p class="text-sm font-semibold text-[#8A6A00]">환경설정 연결</p>
            <p class="mt-2 text-sm leading-7 text-neutral-600">마이페이지의 이메일 알림, 서비스 메시지, 결제 리마인더, 월간 인사이트 토글과 같은 흐름으로 묶어 확인할 수 있습니다.</p>
            <RouterLink to="/mypage" class="secondary-button mt-4 w-full">환경설정 바로가기</RouterLink>
          </article>
        </aside>
        <section class="section-card">
          <div class="flex items-end justify-between gap-3 border-b border-[rgba(46,34,10,0.08)] pb-5">
            <div>
              <p class="text-sm font-semibold text-[#8A6A00]">알림 목록</p>
              <h2 class="mt-2 section-heading">{{ visibleNotifications.length }}개 항목</h2>
            </div>
            <p class="text-sm text-neutral-500">카드를 누르면 읽음 상태가 즉시 바뀌고, 닫기 버튼으로 목록에서 제거할 수 있습니다.</p>
          </div>
          <div v-if="visibleNotifications.length" class="mt-5 grid gap-4">
            <article
              v-for="item in visibleNotifications"
              :id="`notification-card-${item.notificationId}`"
              :key="item.notificationId"
              class="rounded-[24px] border px-5 py-5 transition"
              :class="[
                item.read ? 'border-[rgba(46,34,10,0.08)] bg-[rgba(255,253,247,0.8)]' : 'border-[rgba(242,210,33,0.24)] bg-[rgba(255,248,224,0.92)] shadow-soft',
                activeNotificationId === item.notificationId ? 'ring-2 ring-[rgba(242,210,33,0.45)] ring-offset-2 ring-offset-transparent' : '',
              ]"
            >
              <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div class="flex min-w-0 gap-4">
                  <div class="grid h-12 w-12 shrink-0 place-items-center rounded-[18px] border border-[rgba(46,34,10,0.08)] bg-white text-[#8A6A00]">
                    <AppIcon :name="item.type === 'COMMUNITY' ? 'community' : item.type === 'INSIGHT' ? 'chart' : 'bell'" :size="18" />
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-neutral-500 ring-1 ring-[rgba(46,34,10,0.08)]">{{ typeLabel(item.type) }}</span>
                      <span v-if="!item.read" class="rounded-full bg-[rgba(242,210,33,0.2)] px-3 py-1 text-[11px] font-extrabold text-[#8A6A00]">새 알림</span>
                    </div>
                    <h3 class="mt-3 text-lg font-bold tracking-[-0.03em] text-neutral-900">{{ item.title }}</h3>
                    <p class="mt-2 text-sm leading-7 text-neutral-600">{{ item.message }}</p>
                  </div>
                </div>
                <div class="flex shrink-0 flex-wrap items-center gap-2">
                  <RouterLink :to="item.ctaTo" class="secondary-button !min-h-11 !px-4" @click="notificationsStore.markAsRead(item.notificationId)">{{ item.ctaLabel }}</RouterLink>
                  <button type="button" class="tertiary-button !min-h-11 !px-3.5" @click="notificationsStore.toggleRead(item.notificationId)">{{ item.read ? '다시 안읽음' : '읽음 처리' }}</button>
                  <button type="button" class="tertiary-button !min-h-11 !px-3.5 text-neutral-500" @click="notificationsStore.closeNotification(item.notificationId)">닫기</button>
                </div>
              </div>
              <p class="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">{{ item.createdAt }}</p>
            </article>
          </div>

          <div v-else class="mt-5 grid min-h-[280px] place-items-center rounded-[24px] border border-dashed border-[rgba(46,34,10,0.12)] bg-[rgba(255,253,247,0.7)] px-6 text-center">
            <div>
              <p class="text-lg font-black tracking-[-0.03em] text-neutral-900">현재 표시할 알림이 없습니다</p>
              <p class="mt-2 text-sm leading-6 text-neutral-500">새로운 결제 일정이나 인사이트가 생기면 이 페이지와 헤더 팝업에 바로 쌓이도록 연결할 수 있습니다.</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  </AppShell>
</template>
