<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia' // 상태 관리
import AppShell from '@/components/layout/AppShell.vue'
import CommunityToolbar from '@/components/community/CommunityToolbar.vue'
import CommunityPostCard from '@/components/community/CommunityPostCard.vue'
import { useCommunityStore } from '@/stores/community'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'
import AppStatusBanner from '@/components/ui/AppStatusBanner.vue'

const route = useRoute()
const router = useRouter()
const communityStore = useCommunityStore()
const { filteredPosts, successMessage, errorMessage, isLoading } = storeToRefs(communityStore)

// pagination은 storeToRefs 없이 store 직접 접근 (reactive 중첩 ref 문제 방지)
const pagination = communityStore.pagination

onMounted(() => {
  // URL ?page=n 쿼리 파라미터 읽기. 없으면 기본 1페이지
  const page = Number(route.query.page) || 1
  communityStore.fetchPosts(page)
})

// 현재 페이지 기준으로 표시할 페이지 번호 목록 (최대 5개)
const pageNumbers = computed(() => {
  const total = pagination.totalPages
  const current = pagination.page
  if (total <= 0) return []

  const start = Math.max(1, current - 1)
  const end = Math.min(total, current + 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const goToPage = (page) => {
  if (page < 1 || page > pagination.totalPages || page === pagination.page) return
  // URL 쿼리도 같이 업데이트 → 뒤로가기 시 해당 페이지로 복귀 가능
  router.push({ query: { page } })
  communityStore.fetchPosts(page)
}
</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-4">
      <section class="shell-card p-4 lg:p-5">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-100">커뮤니티</span>
              <span class="text-sm text-neutral-500">구독 관리 경험과 절감 팁을 공유하세요</span>
            </div>
            <h1 class="mt-3 text-[22px] font-black tracking-[-0.04em] text-neutral-900 lg:text-[28px]">구독 관리 커뮤니티</h1>
          </div>

          <div class="flex flex-wrap gap-2.5">
            <RouterLink to="/community/scraps" class="secondary-button !min-h-[42px] !px-4">스크랩</RouterLink>
            <RouterLink to="/community/new" class="primary-button !min-h-[42px] !px-4">게시글 작성</RouterLink>
          </div>
        </div>
      </section>

      <AppStatusBanner
        v-if="successMessage || errorMessage"
        :tone="successMessage ? 'success' : 'error'"
        :title="successMessage ? '커뮤니티 상태가 업데이트되었습니다' : '커뮤니티 데이터를 불러오지 못했습니다'"
        :message="successMessage || errorMessage"
      />

      <CommunityToolbar :selected-sort="communityStore.filters.sortBy" @select-sort="communityStore.setSort" />

      <section class="grid gap-4">
        <div class="grid gap-3.5">
          <!-- 글 목록 반환 -->
          <CommunityPostCard v-for="item in filteredPosts" :key="item.postId" :item="item" /> 

          <AppStatePanel
            v-if="!filteredPosts.length && !isLoading"
            title="조건에 맞는 게시글이 없습니다"
            description="정렬 기준을 다시 선택해보세요."
            icon="community"
          >
            <template #actions>
              <RouterLink to="/community/new" class="primary-button">첫 게시글 작성</RouterLink>
            </template>
          </AppStatePanel>
        </div>

        <!-- 페이징 -->
        <div v-if="pagination.totalPages > 1" class="flex items-center justify-center gap-1.5 py-2">
          <!-- 이전 버튼 -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.page <= 1 || isLoading"
            @click="goToPage(pagination.page - 1)"
          >&lt;</button>

          <!-- 첫 페이지 + 앞 줄임표 -->
          <template v-if="pageNumbers[0] > 1">
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm transition hover:bg-neutral-50" @click="goToPage(1)">1</button>
            <span v-if="pageNumbers[0] > 2" class="px-1 text-neutral-400">...</span>
          </template>

          <!-- 페이지 번호들 -->
          <button
            v-for="p in pageNumbers"
            :key="p"
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition"
            :class="p === pagination.page
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'"
            :disabled="isLoading"
            @click="goToPage(p)"
          >{{ p }}</button>

          <!-- 뒤 줄임표 + 마지막 페이지 -->
          <template v-if="pageNumbers[pageNumbers.length - 1] < pagination.totalPages">
            <span v-if="pageNumbers[pageNumbers.length - 1] < pagination.totalPages - 1" class="px-1 text-neutral-400">...</span>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm transition hover:bg-neutral-50" @click="goToPage(pagination.totalPages)">{{ pagination.totalPages }}</button>
          </template>

          <!-- 다음 버튼 -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="pagination.page >= pagination.totalPages || isLoading"
            @click="goToPage(pagination.page + 1)"
          >&gt;</button>
        </div>

        <!-- 전체 글 수 표시 -->
        <!-- <p v-if="pagination.totalCount > 0" class="text-center text-xs text-neutral-400">
          전체 {{ pagination.totalCount }}개 · {{ pagination.page }} / {{ pagination.totalPages }} 페이지
        </p> -->
      </section>
    </div>
  </AppShell>
</template>
