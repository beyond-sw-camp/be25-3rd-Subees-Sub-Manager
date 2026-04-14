<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import SubscriptionFilters from '@/components/subscriptions/SubscriptionFilters.vue'
import SubscriptionListCard from '@/components/subscriptions/SubscriptionListCard.vue'
import SubscriptionDetailPanel from '@/components/subscriptions/SubscriptionDetailPanel.vue'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'
import { useSubscriptionsStore } from '@/stores/subscriptions'

const subscriptionsStore = useSubscriptionsStore()
const {
  filters,
  categories,
  filteredSubscriptions,
  selectedSubscription,
  totalCount,
  monthlyExpectedAmount,
  activeCount,
  pausedCount,
} = storeToRefs(subscriptionsStore)

const showDeleteConfirm = ref(false)
const pendingDeleteId = ref(null)

const formatCurrency = (value) => `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`

const requestDelete = (subscriptionId) => {
  pendingDeleteId.value = subscriptionId
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (!pendingDeleteId.value) return
  subscriptionsStore.deleteSubscription(pendingDeleteId.value)
  pendingDeleteId.value = null
  showDeleteConfirm.value = false
}

const cancelDelete = () => {
  pendingDeleteId.value = null
  showDeleteConfirm.value = false
}
</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-6">
      <section class="shell-card px-6 py-6 md:px-7 md:py-7 xl:px-8 xl:py-8">
        <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,388px)] xl:items-start 2xl:gap-6">
          <div class="subscription-hero-copy flex min-h-full flex-col justify-between">
            <p class="text-sm font-semibold text-[#8A6A00]">사용자님, 구독·결제·캘린더를 한 곳에 정리했어요!</p>
            <div class="mt-4 inline-flex min-h-[34px] items-center rounded-full border border-[rgba(242,210,33,0.2)] bg-[rgba(242,210,33,0.12)] px-3.5 text-[12px] font-extrabold text-[#8A6A00]">구독 현황 요약</div>
            <h1 class="mt-4 page-title !max-w-[16ch] !text-[34px] xl:!text-[40px]">구독 목록을 한눈에 살펴보세요.</h1>
            <p class="mt-4 max-w-[72ch] body-copy">
              서비스 이름으로 검색하고 카테고리별로 모아보면서, 선택한 항목의 상세 정보와 수정 내용을 바로 확인할 수 있어요.
            </p>
            <p class="mt-3 cta-helper">목록은 전체를 먼저 훑은 뒤, 필요한 카테고리로 좁혀가며 보는 흐름이 가장 빠릅니다.</p>
            <div class="mt-5 flex flex-wrap gap-2.5">
              <span class="guide-pill">검색 → 카테고리 → 상세 확인</span>
              <span class="guide-pill">오른쪽 패널에서 즉시 수정</span>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2 xl:content-start xl:self-start">
            <article class="ghost-card h-full p-4 md:p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">전체 구독</p>
              <p class="mt-3 text-[30px] font-bold tracking-[-0.04em] text-neutral-900">총 {{ totalCount }}개</p>
              <p class="mt-2 text-sm leading-6 text-neutral-500">현재 등록된 구독 항목 기준</p>
            </article>
            <article class="ghost-card h-full p-4 md:p-5">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">활성 / 일시정지</p>
              <p class="mt-3 text-[30px] font-bold tracking-[-0.04em] text-neutral-900">{{ activeCount }} / {{ pausedCount }}</p>
              <p class="mt-2 text-sm leading-6 text-neutral-500">상태 전환으로 일정 노출 조정</p>
            </article>
            <article class="ghost-card h-full p-4 md:p-5 sm:col-span-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">월 환산 금액</p>
              <p class="mt-3 text-[30px] font-bold tracking-[-0.04em] text-neutral-900">{{ formatCurrency(monthlyExpectedAmount) }}</p>
              <p class="mt-2 text-sm leading-6 text-neutral-500">연간 결제는 월 단위로 환산하고, 활성 구독만 합산합니다.</p>
            </article>
          </div>
        </div>
      </section>

      <SubscriptionFilters
        :model-value="filters.query"
        :categories="categories"
        :selected-category="filters.categoryName"
        :selected-sort="filters.sortBy"
        @update:model-value="subscriptionsStore.setQuery"
        @select-category="subscriptionsStore.setCategory"
        @select-sort="subscriptionsStore.setSort"
      />

      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div class="section-card">
          <div class="flex flex-col gap-4 border-b border-[rgba(46,34,10,0.08)] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-sm font-semibold text-[#8A6A00]">구독 서비스 목록</p>
              <h2 class="mt-2 section-heading">검색 결과 {{ filteredSubscriptions.length }}개</h2>
            </div>
            <p class="body-copy">항목을 누르면 오른쪽에서 상세 내용을 확인할 수 있어요.</p>
          </div>

          <div v-if="filteredSubscriptions.length" class="mt-5 grid gap-4">
            <SubscriptionListCard
              v-for="item in filteredSubscriptions"
              :key="item.subscriptionId"
              :item="item"
              :is-selected="selectedSubscription?.subscriptionId === item.subscriptionId"
              @select="subscriptionsStore.selectSubscription"
            />
          </div>

          <AppStatePanel
            v-else
            class="mt-6"
            title="조건에 맞는 구독이 없습니다"
            description="검색어를 지우거나 카테고리를 전체로 바꾸면 다시 목록을 확인할 수 있습니다. 아직 구독을 등록하지 않았다면 첫 항목부터 추가해보세요."
            icon="list"
          >
            <template #actions>
              <RouterLink to="/subscriptions/new" class="primary-button">첫 구독 등록하기</RouterLink>
              <button type="button" class="secondary-button" @click="subscriptionsStore.setQuery(''); subscriptionsStore.setCategory('전체')">필터 초기화</button>
            </template>
          </AppStatePanel>
        </div>

        <div class="xl:sticky xl:top-7 xl:self-start">
          <SubscriptionDetailPanel
            :item="selectedSubscription"
            @save="subscriptionsStore.updateSubscription"
            @delete="requestDelete"
            @toggle-status="subscriptionsStore.toggleSubscriptionStatus"
          />
        </div>
      </section>
    </div>

    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 px-4">
      <div class="w-full max-w-md rounded-modal bg-brand-50 p-6 shadow-floating">
        <p class="text-sm font-semibold text-danger">구독 삭제</p>
        <h3 class="mt-2 text-xl font-bold tracking-[-0.02em] text-neutral-900">정말로 해당 구독 서비스를 삭제하시겠습니까?</h3>
        <p class="mt-3 text-sm leading-6 text-neutral-500">삭제하면 목록에서 즉시 제거되며 복구할 수 없습니다.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="secondary-button" @click="cancelDelete">취소</button>
          <button
            type="button"
            class="inline-flex min-h-[54px] items-center justify-center rounded-[22px] border border-transparent bg-danger px-5 text-sm font-extrabold text-white transition hover:brightness-95 active:scale-[0.985]"
            @click="confirmDelete"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  </AppShell>
</template>


<style scoped>
.subscription-hero-copy {
  gap: 14px;
}
</style>
