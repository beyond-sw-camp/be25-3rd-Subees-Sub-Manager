<script setup>
// communityBoardPage.vue에서 받아오는 글 목록 정보
defineProps({
  item: { //컴포넌트가 받을 이름
    type: Object,
    required: true, //부모가 반드시 전달해야 함
  },
})
</script>

<!-- 글 목록 반환 -->
<template>
  <article class="rounded-card border border-neutral-200 bg-white px-5 py-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <!-- <span class="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 ring-1 ring-brand-100">커뮤니티</span> -->
        <span v-if="item.isMine" class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">내 게시글</span>
      </div>
      <p class="text-[12px] text-neutral-500">{{ item.createdAtLabel }}</p>
    </div>

    <RouterLink :to="`/community/${item.postId}`" class="mt-3 block">
      <h3 class="text-[20px] font-bold tracking-[-0.03em] text-neutral-900">{{ item.title }}</h3>
      <!-- <p class="mt-2 line-clamp-2 text-sm leading-6 text-neutral-500">{{ item.preview }}</p> -->
    </RouterLink>

    <!-- <div class="mt-3 flex flex-wrap gap-2">
      <span v-for="tag in item.tags" :key="tag" class="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
        #{{ tag }}
      </span>
    </div> -->

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-3 text-[13px] text-neutral-500">
      <div class="flex flex-wrap items-center gap-3.5">
        <span>{{ item.authorNickname }}</span>
        <span>조회 {{ item.viewCount }}</span>
        <!-- <span>스크랩 {{ item.scrapCount }}</span> -->
      </div>
      <RouterLink :to="`/community/${item.postId}`" class="font-semibold text-brand-600">상세 보기</RouterLink>
    </div>
  </article>
</template>
