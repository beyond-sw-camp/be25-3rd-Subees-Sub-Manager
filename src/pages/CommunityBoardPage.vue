<script setup>
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import CommunityToolbar from '@/components/community/CommunityToolbar.vue'
import CommunityPostCard from '@/components/community/CommunityPostCard.vue'
import { useCommunityStore } from '@/stores/community'
import AppStatePanel from '@/components/ui/AppStatePanel.vue'
import AppStatusBanner from '@/components/ui/AppStatusBanner.vue'

const communityStore = useCommunityStore()
const { filteredPosts, successMessage, errorMessage } = storeToRefs(communityStore)
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
          <CommunityPostCard v-for="item in filteredPosts" :key="item.postId" :item="item" />

          <AppStatePanel
            v-if="!filteredPosts.length"
            title="조건에 맞는 게시글이 없습니다"
            description="정렬 기준을 다시 선택해보세요."
            icon="community"
          >
            <template #actions>
              <RouterLink to="/community/new" class="primary-button">첫 게시글 작성</RouterLink>
            </template>
          </AppStatePanel>
        </div>
      </section>
    </div>
  </AppShell>
</template>
