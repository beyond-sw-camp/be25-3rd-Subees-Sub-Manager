<script setup>
import AppShell from '@/components/layout/AppShell.vue'
import CommunityPostCard from '@/components/community/CommunityPostCard.vue'
import { useCommunityStore } from '@/stores/community'
import { storeToRefs } from 'pinia'

const communityStore = useCommunityStore()
const { scrappedPosts, successMessage, errorMessage } = storeToRefs(communityStore)
</script>

<template>
  <AppShell title="hidden">
    <div class="grid gap-6">
      <section class="shell-card p-8">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-3">
              <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-100">스크랩 목록</span>
              <!-- <span class="text-sm text-neutral-500">저장한 커뮤니티 게시글</span> -->
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

      <section v-if="successMessage || errorMessage" class="rounded-card border px-5 py-4 text-sm font-medium"
        :class="successMessage ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'">
        {{ successMessage || errorMessage }}
      </section>

      <section v-if="scrappedPosts.length" class="grid gap-4">
        <CommunityPostCard v-for="item in scrappedPosts" :key="item.postId" :item="item" />
      </section>

      <section v-else class="shell-card flex min-h-[320px] items-center justify-center p-8 text-center">
        <div>
          <p class="text-lg font-semibold text-neutral-900">스크랩한 게시글이 없습니다</p>
          <p class="mt-2 text-sm leading-6 text-neutral-500">커뮤니티 상세 화면에서 스크랩하기 버튼을 누르면 이 목록에 저장됩니다.</p>
          <RouterLink to="/community" class="mt-4 inline-flex text-sm font-semibold text-brand-600">게시글 보러 가기</RouterLink>
        </div>
      </section>
    </div>
  </AppShell>
</template>
