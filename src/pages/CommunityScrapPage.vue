<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import CommunityPostCard from '@/components/community/CommunityPostCard.vue'
import { useCommunityStore } from '@/stores/community'

const communityStore = useCommunityStore()
const { successMessage, errorMessage, isLoading } = storeToRefs(communityStore)

// scrapPagination은 reactive 직접 참조 (storeToRefs 중첩 ref 문제 방지)
const scrapPagination = communityStore.scrapPagination

onMounted(() => {
  communityStore.fetchScraps(1)
})

// 현재 페이지 기준 ±2 페이지 번호 목록
const pageNumbers = computed(() => {
  const total = scrapPagination.totalPages
  const current = scrapPagination.page
  if (total <= 0) return []

  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const goToPage = (page) => {
  if (page < 1 || page > scrapPagination.totalPages || page === scrapPagination.page) return
  communityStore.fetchScraps(page)
}

// 스크랩 목록에서 해제 버튼 클릭 → 항상 DELETE 호출 후 목록 새로고침
const handleCancelScrap = async (postId) => {
  await communityStore.cancelScrapFromList(postId)
}
</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-6">
      <section class="shell-card p-8">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-100">스크랩 목록</span>
            </div>
            <h1 class="mt-4 text-[32px] font-bold tracking-[-0.03em] text-neutral-900">나중에 다시 볼 게시글을 모아둔 공간</h1>
            <p class="mt-3 max-w-3xl text-sm leading-7 text-neutral-500">저장한 게시글만 모아서 다시 확인할 수 있습니다.</p>
          </div>
          <div class="flex flex-wrap gap-3">
            <RouterLink to="/community" class="secondary-button">커뮤니티 목록</RouterLink>
            <RouterLink to="/community/new" class="primary-button">게시글 작성</RouterLink>
          </div>
        </div>
      </section>

      <!-- 에러/성공 메시지 -->
      <section v-if="successMessage || errorMessage" class="rounded-card border px-5 py-4 text-sm font-medium"
        :class="successMessage ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'">
        {{ successMessage || errorMessage }}
      </section>

      <!-- 스크랩 목록 -->
      <section v-if="communityStore.scrapPosts.length" class="grid gap-4">
        <div v-for="item in communityStore.scrapPosts" :key="item.postId" class="relative">
          <CommunityPostCard :item="item" />
          <!-- 스크랩 해제 버튼: 각 카드 우측 하단에 표시 -->
          <div class="mt-1 flex justify-end">
            <!-- <button
              type="button"
              class="text-xs font-medium text-rose-500 hover:text-rose-700 transition"
              :disabled="isLoading"
              @click="handleCancelScrap(item.postId)"
            >
              스크랩 해제
            </button> -->
          </div>
        </div>

        <!-- 페이징 -->
        <div v-if="scrapPagination.totalPages > 1" class="flex items-center justify-center gap-1.5 py-2">
          <!-- 이전 버튼 -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="scrapPagination.page <= 1 || isLoading"
            @click="goToPage(scrapPagination.page - 1)"
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
            :class="p === scrapPagination.page
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'"
            :disabled="isLoading"
            @click="goToPage(p)"
          >{{ p }}</button>

          <!-- 뒤 줄임표 + 마지막 페이지 -->
          <template v-if="pageNumbers[pageNumbers.length - 1] < scrapPagination.totalPages">
            <span v-if="pageNumbers[pageNumbers.length - 1] < scrapPagination.totalPages - 1" class="px-1 text-neutral-400">...</span>
            <button type="button" class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm transition hover:bg-neutral-50" @click="goToPage(scrapPagination.totalPages)">{{ scrapPagination.totalPages }}</button>
          </template>

          <!-- 다음 버튼 -->
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-sm text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="scrapPagination.page >= scrapPagination.totalPages || isLoading"
            @click="goToPage(scrapPagination.page + 1)"
          >&gt;</button>
        </div>

        <!-- 전체 스크랩 수 -->
        <p v-if="scrapPagination.totalCount > 0" class="text-center text-xs text-neutral-400">
          전체 {{ scrapPagination.totalCount }}개 · {{ scrapPagination.page }} / {{ scrapPagination.totalPages }} 페이지
        </p>
      </section>

      <!-- 스크랩 없음 -->
      <section v-else-if="!isLoading" class="shell-card flex min-h-[320px] items-center justify-center p-8 text-center">
        <div>
          <p class="text-lg font-semibold text-neutral-900">스크랩한 게시글이 없습니다</p>
          <p class="mt-2 text-sm leading-6 text-neutral-500">커뮤니티 상세 화면에서 스크랩하기 버튼을 누르면 이 목록에 저장됩니다.</p>
          <RouterLink to="/community" class="mt-4 inline-flex text-sm font-semibold text-brand-600">게시글 보러 가기</RouterLink>
        </div>
      </section>
    </div>
  </AppShell>
</template>