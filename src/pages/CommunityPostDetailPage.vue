<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import { useCommunityStore } from '@/stores/community'

const route = useRoute()
const router = useRouter()
const communityStore = useCommunityStore()
const { successMessage, errorMessage, currentPost: post } = storeToRefs(communityStore)
const showDeleteConfirm = ref(false)

const postId = computed(() => Number(route.params.postId))

const loadPost = async () => {
  if (Number.isNaN(postId.value)) return
  await communityStore.fetchPostDetail(postId.value)
}

onMounted(loadPost)
watch(postId, loadPost)

const handleDelete = async () => {
  const success = await communityStore.deletePost(postId.value)
  if (success) {
    router.push('/community')
  }
}

const handleToggleScrap = () => {
  communityStore.toggleScrap(postId.value)
}

// const copyLink = async () => {
//   const shareUrl = `${window.location.origin}/community/${postId.value}`
//   try {
//     await navigator.clipboard.writeText(shareUrl)
//     communityStore.setSuccess('공유 링크가 복사되었습니다.')
//   } catch (error) {
//     communityStore.setError('링크 복사에 실패했습니다.')
//   }
// }
</script>

<template>
  <AppShell title="hidden">
    <div v-if="post" class="grid gap-6">
      <section class="shell-card p-8">
        <div class="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div class="w-full">
            <div class="flex flex-wrap items-center gap-3">
              <!-- <span class="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-100">게시글 상세</span> -->
              <span v-if="post.isMine" class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">내 게시글</span>
            </div>
            <h1 class="mt-4 text-[32px] font-bold tracking-[-0.03em] text-neutral-900">{{ post.title }}</h1>
            <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <span>{{ post.createdAtLabel }}</span>
              <span>조회수 {{ post.viewCount }}</span>
              <span>스크랩 {{ post.scrapCount }}</span>
              <span> {{ post.authorNickname }}</span>
            </div> 
             <!-- 스크랩 & 공유하기 버튼  -->
             <div class="mt-4 flex justify-end gap-3">
              <button type="button" class="primary-button !p-[15px]" @click="handleToggleScrap">
                {{ post.isScrapped ? '스크랩 해제' : '스크랩하기' }}
              </button>
              <!-- <button type="button" class="secondary-button " @click="copyLink">공유하기</button> -->
              <!-- <RouterLink to="/community/new" class="secondary-button w-full">새 글 작성</RouterLink> -->
            </div>
          </div>
        </div>
      </section>

      <section v-if="successMessage || errorMessage" class="rounded-card border px-5 py-4 text-sm font-medium"
        :class="successMessage ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'">
        {{ successMessage || errorMessage }}
      </section>

      <!-- <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"> -->
      <section class="grid gap-6">
        <article class="shell-card p-8">
          <!-- <div class="flex flex-wrap gap-2">
            <span v-for="tag in post.tags" :key="tag" class="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">#{{ tag }}</span>
          </div> -->

          <div class="mt-8 whitespace-pre-line text-[15px] leading-8 text-neutral-700">{{ post.content }}</div>

          <!-- <div class="mt-8 border-t border-neutral-200 pt-6">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">최근 수정일</p>
            <p class="mt-2 text-sm text-neutral-700">{{ post.updatedAtLabel }}</p>
          </div> -->

          <div class="mt-6 flex justify-end gap-3">
            <RouterLink to="/community" class="secondary-button">목록</RouterLink>
            <RouterLink v-if="post.isMine" :to="`/community/${post.postId}/edit`" class="secondary-button">수정</RouterLink>
            <button v-if="post.isMine" type="button" class="secondary-button border-rose-200 text-rose-600 hover:bg-rose-50" @click="showDeleteConfirm = true">삭제</button>
          </div>
        </article>

        <!-- <aside class="grid gap-6 xl:sticky xl:top-6 xl:self-start">
          <article class="shell-card p-6">
            <p class="text-sm font-semibold text-brand-600">빠른 액션</p>
            <div class="mt-4 grid gap-3">
              <button type="button" class="primary-button w-full" @click="handleToggleScrap">
                {{ post.isScrapped ? '스크랩 해제' : '스크랩하기' }}
              </button>
              <button type="button" class="secondary-button w-full" @click="copyLink">공유하기</button>
              <RouterLink to="/community/new" class="secondary-button w-full">새 글 작성</RouterLink>
            </div>

             <div class="flex flex-wrap gap-3">
              <RouterLink to="/community" class="secondary-button">목록</RouterLink>
              <RouterLink v-if="post.isMine" :to="`/community/${post.postId}/edit`" class="secondary-button">수정</RouterLink>
              <button v-if="post.isMine" type="button" class="secondary-button border-rose-200 text-rose-600 hover:bg-rose-50" @click="showDeleteConfirm = true">삭제</button>
            </div>
          </article>

          
          <article class="shell-card p-6">
            <p class="text-sm font-semibold text-brand-600">게시글 정보</p>
            <div class="mt-4 grid gap-3 text-sm text-neutral-500">
              <div class="rounded-card border border-neutral-200 bg-neutral-25 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">작성자</p>
                <p class="mt-2 text-sm font-semibold text-neutral-900">{{ post.authorNickname }}</p>
              </div>
              <div class="rounded-card border border-neutral-200 bg-neutral-25 px-4 py-3">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">조회/스크랩</p>
                <p class="mt-2 text-sm font-semibold text-neutral-900">{{ post.viewCount }} / {{ post.scrapCount }}</p>
              </div>
            </div>
          </article>
        </aside> -->
      </section>
    </div>

    <section v-else class="shell-card p-10 text-center">
      <p class="text-lg font-semibold text-neutral-900">게시글을 찾을 수 없습니다.</p>
      <RouterLink to="/community" class="mt-4 inline-flex text-sm font-semibold text-brand-600">목록으로 돌아가기</RouterLink>
    </section>

    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 px-4">
      <div class="w-full max-w-md rounded-modal bg-white p-6 shadow-floating">
        <!-- <p class="text-sm font-semibold text-danger">게시글 삭제</p> -->
        <h3 class="mt-2 text-xl font-bold tracking-[-0.02em] text-neutral-900">정말로 이 게시글을 삭제하시겠습니까?</h3>
        <p class="mt-3 text-sm leading-6 text-neutral-500">삭제 후에는 복구할 수 없으며, 스크랩 목록에서도 함께 제거됩니다.</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="secondary-button" @click="showDeleteConfirm = false">취소</button>
          <button type="button" class="primary-button bg-danger hover:bg-red-600 active:bg-red-700" @click="handleDelete">삭제</button>
        </div>
      </div>
    </div>
  </AppShell>
</template>
