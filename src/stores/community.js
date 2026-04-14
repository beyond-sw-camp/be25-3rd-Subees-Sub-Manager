import { computed, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'subees-community-posts'
const SCRAP_STORAGE_KEY = 'subees-community-scraps'

const defaultPosts = [
  {
    postId: 101,
    title: 'OTT 구독 너무 많을 때 정리 기준 어떻게 잡으시나요?',
    content:
      '넷플릭스, 티빙, 디즈니+, 쿠팡플레이까지 같이 쓰고 있는데 이번 달 지출이 확 늘었습니다.\n\n저는 우선 최근 4주 기준으로 실제 시청 시간을 보고, 독점작이 끝난 서비스부터 정리하려고 합니다. 다른 분들은 어떤 기준으로 줄이시는지 궁금합니다.',
    authorId: 3,
    authorNickname: '하늘',
    createdAt: '2026-03-27T10:20:00',
    updatedAt: '2026-03-27T10:20:00',
    viewCount: 128,
    scrapCount: 24,
    commentCount: 8,
    tags: ['OTT', '절감', '구독정리'],
  },
  {
    postId: 102,
    title: 'AI 구독은 ChatGPT + Claude 같이 쓰는 분들 많나요?',
    content:
      '작업용으로 ChatGPT Plus를 계속 쓰고 있는데, 클로드까지 같이 쓰면 생산성이 확실히 올라가는지 고민 중입니다.\n\n실제 사용 패턴이 글쓰기 / 요약 / 기획 정리 쪽인 분들 후기 듣고 싶어요.',
    authorId: 4,
    authorNickname: '민호',
    createdAt: '2026-03-26T18:05:00',
    updatedAt: '2026-03-28T09:40:00',
    viewCount: 212,
    scrapCount: 31,
    commentCount: 12,
    tags: ['AI', '생산성', '비교'],
  },
  {
    postId: 103,
    title: '유튜브 프리미엄 가족 요금제 체감상 만족도 어떠세요?',
    content:
      '광고 제거 때문만이 아니라 음악까지 같이 묶여 있어서 계속 유지 중입니다.\n\n다만 다른 음악 서비스와 중복 결제가 생겨서 고민인데, 가족 요금제로 바꾸면 체감이 큰지 궁금합니다.',
    authorId: 7,
    authorNickname: '서윤',
    createdAt: '2026-03-24T14:30:00',
    updatedAt: '2026-03-24T14:30:00',
    viewCount: 96,
    scrapCount: 15,
    commentCount: 5,
    tags: ['Music', '가족요금제'],
  },
  {
    postId: 104,
    title: '클라우드 저장공간 구독, iCloud에서 다른 서비스로 옮긴 분 계신가요?',
    content:
      '사진 백업 때문에 iCloud+를 쓰고 있는데 윈도우/안드로이드 혼용 환경이라 점점 불편해지고 있습니다.\n\n실제로 다른 클라우드로 이전해보신 분 있으면 장단점 공유 부탁드립니다.',
    authorId: 8,
    authorNickname: '다솜',
    createdAt: '2026-03-21T09:12:00',
    updatedAt: '2026-03-22T08:55:00',
    viewCount: 141,
    scrapCount: 18,
    commentCount: 7,
    tags: ['Cloud', '백업'],
  },
]

const loadJson = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    return fallback
  }
}

const saveJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${month}월 ${day}일 ${hour}:${minute}`
}

export const useCommunityStore = defineStore('community', () => {
  const authStore = useAuthStore()
  const posts = ref(loadJson(STORAGE_KEY, defaultPosts))
  const scrappedPostIds = ref(loadJson(SCRAP_STORAGE_KEY, []))
  const filters = reactive({
    query: '',
    sortBy: 'latest',
  })
  const selectedPostId = ref(posts.value[0]?.postId ?? null)
  const successMessage = ref('')
  const errorMessage = ref('')

  watch(
    posts,
    (value) => {
      saveJson(STORAGE_KEY, value)
    },
    { deep: true },
  )

  watch(
    scrappedPostIds,
    (value) => {
      saveJson(SCRAP_STORAGE_KEY, value)
    },
    { deep: true },
  )

  const postMap = computed(() => {
    return new Map(posts.value.map((post) => [post.postId, post]))
  })

  const enrichedPosts = computed(() => {
    return posts.value.map((post) => ({
      ...post,
      isScrapped: scrappedPostIds.value.includes(post.postId),
      isMine: Boolean(authStore.userId && authStore.userId === post.authorId),
      createdAtLabel: formatDateTime(post.createdAt),
      updatedAtLabel: formatDateTime(post.updatedAt),
      preview: post.content.split('\n').filter(Boolean).slice(0, 2).join(' '),
    }))
  })

  const sortedPosts = computed(() => {
    const nextItems = [...enrichedPosts.value]

    if (filters.sortBy === 'views') {
      return nextItems.sort((a, b) => b.viewCount - a.viewCount)
    }

    if (filters.sortBy === 'scraps') {
      return nextItems.sort((a, b) => b.scrapCount - a.scrapCount)
    }

    return nextItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })

  const filteredPosts = computed(() => {
    const keyword = filters.query.trim().toLowerCase()
    if (!keyword) return sortedPosts.value

    return sortedPosts.value.filter((post) => {
      const haystack = `${post.title} ${post.content} ${post.authorNickname} ${post.tags.join(' ')}`.toLowerCase()
      return haystack.includes(keyword)
    })
  })

  const selectedPost = computed(() => {
    if (!selectedPostId.value) return null
    const post = postMap.value.get(Number(selectedPostId.value))
    if (!post) return null

    return {
      ...post,
      isScrapped: scrappedPostIds.value.includes(post.postId),
      isMine: Boolean(authStore.userId && authStore.userId === post.authorId),
      createdAtLabel: formatDateTime(post.createdAt),
      updatedAtLabel: formatDateTime(post.updatedAt),
    }
  })

  const scrappedPosts = computed(() => enrichedPosts.value.filter((post) => post.isScrapped))
  const myPosts = computed(() => enrichedPosts.value.filter((post) => post.isMine))
  const totalPosts = computed(() => posts.value.length)
  const totalScraps = computed(() => scrappedPostIds.value.length)
  const popularPost = computed(() => [...enrichedPosts.value].sort((a, b) => b.viewCount - a.viewCount)[0] ?? null)
  const recentPost = computed(() => [...enrichedPosts.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] ?? null)

  const clearMessages = () => {
    successMessage.value = ''
    errorMessage.value = ''
  }

  const setSuccess = (message) => {
    successMessage.value = message
    errorMessage.value = ''
  }

  const setError = (message) => {
    errorMessage.value = message
    successMessage.value = ''
  }

  const setQuery = (value) => {
    filters.query = value
  }

  const setSort = (value) => {
    filters.sortBy = value
  }

  const selectPost = (postId) => {
    selectedPostId.value = Number(postId)
  }

  const openPost = (postId) => {
    const targetId = Number(postId)
    const index = posts.value.findIndex((post) => post.postId === targetId)
    if (index < 0) return null

    posts.value[index] = {
      ...posts.value[index],
      viewCount: posts.value[index].viewCount + 1,
    }
    selectedPostId.value = targetId
    return posts.value[index]
  }

  const createPost = (payload) => {
    clearMessages()

    if (!authStore.isLoggedIn) {
      setError('게시글 작성은 로그인 후 이용할 수 있습니다.')
      return null
    }

    const now = new Date().toISOString()
    const nextPost = {
      postId: Date.now(),
      title: payload.title.trim(),
      content: payload.content.trim(),
      authorId: authStore.userId,
      authorNickname: authStore.nickname || '사용자',
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      scrapCount: 0,
      commentCount: 0,
      tags: payload.tags ?? [],
    }

    posts.value = [nextPost, ...posts.value]
    selectedPostId.value = nextPost.postId
    setSuccess('게시글이 등록되었습니다.')
    return nextPost
  }

  const updatePost = (postId, payload) => {
    clearMessages()
    const targetId = Number(postId)
    const index = posts.value.findIndex((post) => post.postId === targetId)
    if (index < 0) {
      setError('수정할 게시글을 찾을 수 없습니다.')
      return null
    }

    const target = posts.value[index]
    if (target.authorId !== authStore.userId) {
      setError('본인이 작성한 게시글만 수정할 수 있습니다.')
      return null
    }

    const updatedPost = {
      ...target,
      title: payload.title.trim(),
      content: payload.content.trim(),
      tags: payload.tags ?? target.tags,
      updatedAt: new Date().toISOString(),
    }

    posts.value[index] = updatedPost
    selectedPostId.value = updatedPost.postId
    setSuccess('게시글이 수정되었습니다.')
    return updatedPost
  }

  const deletePost = (postId) => {
    clearMessages()
    const targetId = Number(postId)
    const target = posts.value.find((post) => post.postId === targetId)
    if (!target) {
      setError('삭제할 게시글을 찾을 수 없습니다.')
      return false
    }

    if (target.authorId !== authStore.userId) {
      setError('본인이 작성한 게시글만 삭제할 수 있습니다.')
      return false
    }

    posts.value = posts.value.filter((post) => post.postId !== targetId)
    scrappedPostIds.value = scrappedPostIds.value.filter((id) => id !== targetId)
    selectedPostId.value = posts.value[0]?.postId ?? null
    setSuccess('게시글이 삭제되었습니다.')
    return true
  }

  const toggleScrap = (postId) => {
    clearMessages()
    const targetId = Number(postId)
    const index = posts.value.findIndex((post) => post.postId === targetId)
    if (index < 0) {
      setError('스크랩할 게시글을 찾을 수 없습니다.')
      return false
    }

    const hasScrapped = scrappedPostIds.value.includes(targetId)

    if (hasScrapped) {
      scrappedPostIds.value = scrappedPostIds.value.filter((id) => id !== targetId)
      posts.value[index] = {
        ...posts.value[index],
        scrapCount: Math.max(0, posts.value[index].scrapCount - 1),
      }
      setSuccess('스크랩을 해제했습니다.')
      return true
    }

    scrappedPostIds.value = [...scrappedPostIds.value, targetId]
    posts.value[index] = {
      ...posts.value[index],
      scrapCount: posts.value[index].scrapCount + 1,
    }
    setSuccess('게시글을 스크랩했습니다.')
    return true
  }

  const getPostById = (postId) => {
    const target = postMap.value.get(Number(postId))
    if (!target) return null
    return {
      ...target,
      isScrapped: scrappedPostIds.value.includes(target.postId),
      isMine: Boolean(authStore.userId && authStore.userId === target.authorId),
      createdAtLabel: formatDateTime(target.createdAt),
      updatedAtLabel: formatDateTime(target.updatedAt),
    }
  }

  return {
    filters,
    setSuccess,
    setError,
    successMessage,
    errorMessage,
    selectedPostId,
    filteredPosts,
    selectedPost,
    scrappedPosts,
    myPosts,
    totalPosts,
    totalScraps,
    popularPost,
    recentPost,
    clearMessages,
    setQuery,
    setSort,
    selectPost,
    openPost,
    createPost,
    updatePost,
    deletePost,
    toggleScrap,
    getPostById,
  }
})
