import { computed, reactive, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
//api 함수를 import해서 사용
import { getCommunityPosts, getCommunityPostDetail, createCommunityPost, updateCommunityPost, deleteCommunityPost } from '@/api/community'

const SCRAP_STORAGE_KEY = 'subees-community-scraps'

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
  const posts = ref([])
  const currentPost = ref(null)
  const isLoading = ref(false)
  const pagination = reactive({
    page: 1,
    totalPages: 0, // 0 > 0 = false → 스킵 → API 호출해서 페이지 불러옴. 1로 설정시 페이지 예외 뜸
    totalCount: 0,
  })
  const scrappedPostIds = ref(loadJson(SCRAP_STORAGE_KEY, []))
  const filters = reactive({
    query: '',
    sortBy: 'latest',
  })
  const selectedPostId = ref(null)
  const successMessage = ref('')
  const errorMessage = ref('')

  const PAGE_SIZE = 10 // 한 페이지당 10개의 글

  const fetchPosts = async (page = 1) => {
    // 페이지 범위 사전 검증 (pagination.totalPages가 이미 설정된 경우)
    if (pagination.totalPages > 0 && (page < 1 || page > pagination.totalPages)) {
      // setError(`유효하지 않은 페이지입니다. (1 ~ ${pagination.totalPages}페이지)`)
      setError(`유효하지 않은 페이지입니다.`)

      return
    }

    isLoading.value = true
    errorMessage.value = ''
    try {
      const response = await getCommunityPosts({ page, size: PAGE_SIZE })
      const data = response.data.data
      posts.value = data.posts.map((post) => ({
        postId: post.postId,
        title: post.title,
        authorNickname: post.nickname,
        authorId: null,
        createdAt: post.createdAt,
        updatedAt: post.createdAt,
        viewCount: post.viewCount,
        scrapCount: 0,
        commentCount: 0,
        content: '',
        tags: [],
      }))
      // 백 응답에서 size/page 필드 가져옴
      // data.size 실제 현재 페이지 번호, data.page  실제 페이지 크기
      pagination.page = data.size
      pagination.totalPages = data.totalPages
      pagination.totalCount = data.totalCount
      selectedPostId.value = posts.value[0]?.postId ?? null
    } catch (error) {
      // 백엔드 에러 응답 형식 { code, status, message }
      const serverMessage = error.response?.data?.message
      const statusCode = error.response?.status
      if (serverMessage) {
        // 400 INVALID_PAGE / 500 INTERNAL_SERVER_ERROR 등 서버 메시지 그대로 표시
        setError(serverMessage)
      } else if (!error.response) {
        setError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.')
      } else if (statusCode === 500) {
        setError('서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError('게시글 목록을 불러오지 못했습니다.')
      }
    } finally {
      isLoading.value = false
    }
  }

  const fetchPostDetail = async (postId) => {
    isLoading.value = true // 로딩 시작
    try {
      const response = await getCommunityPostDetail(postId) // api 호출
      const data = response.data.data // 백 응답 
      currentPost.value = { // 상태에 저장
        postId: data.postId,
        title: data.title,
        content: data.content,
        authorNickname: data.nickname,
        authorId: null,
        viewCount: data.viewCount,
        scrapCount: data.scrapCount,
        createdAt: data.createdAt,
        updatedAt: data.createdAt,
        // tags: [],
        isScrapped: scrappedPostIds.value.includes(data.postId),
        isMine: Boolean(authStore.nickname && authStore.nickname === data.nickname), //nickname이 localStorage에 저장됨(auth.js)
        createdAtLabel: formatDateTime(data.createdAt),
        updatedAtLabel: formatDateTime(data.createdAt),
      }
    } catch (error) {
      setError('게시글을 불러오지 못했습니다.')
      currentPost.value = null
    } finally {
      isLoading.value = false
    }
  }

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

  const createPost = async (payload) => {
    clearMessages()

    if (!authStore.isLoggedIn) {
      setError('게시글 작성은 로그인 후 이용할 수 있습니다.')
      return null
    }

    isLoading.value = true
    try {
      const response = await createCommunityPost({
        title: payload.title.trim(),
        content: payload.content.trim(),
      })
      const data = response.data.data
      setSuccess('게시글이 등록되었습니다.')
      await fetchPosts(1)
      return { postId: data.postId }
    } catch (error) {
      setError('게시글 등록에 실패했습니다.')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updatePost = async (postId, payload) => {
    clearMessages()
    isLoading.value = true
    try {
      await updateCommunityPost(postId, {
        title: payload.title.trim(),
        content: payload.content.trim(),
      })
      setSuccess('게시글이 수정되었습니다.')
      await fetchPostDetail(postId)
      return { postId: Number(postId) }
    } catch (error) {
      setError('게시글 수정에 실패했습니다.')
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deletePost = async (postId) => {
    clearMessages()
    isLoading.value = true
    try {
      await deleteCommunityPost(postId)
      setSuccess('게시글이 삭제되었습니다.')
      currentPost.value = null
      await fetchPosts(1)
      return true
    } catch (error) {
      setError('게시글 삭제에 실패했습니다.')
      return false
    } finally {
      isLoading.value = false
    }
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
    isLoading,
    pagination,
    currentPost,
    fetchPostDetail,
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
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    toggleScrap,
    getPostById,
  }
})
