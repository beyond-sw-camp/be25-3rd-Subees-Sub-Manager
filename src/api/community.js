import http from './http'

export const getCommunityPosts = (params) => http.get('/api/v1/community/posts', { params }) //게시글 조회
export const getCommunityPostDetail = (postId) => http.get(`/api/v1/community/posts/${postId}`) // 상세 조회
export const createCommunityPost = (payload) => http.post('/api/v1/community/posts', payload) // 글 작성
export const updateCommunityPost = (postId, payload) => http.put(`/api/v1/community/posts/${postId}`, payload) // 글 수정
export const deleteCommunityPost = (postId) => http.delete(`/api/v1/community/posts/${postId}`) // 글 삭제
export const toggleCommunityScrap = (postId) => http.post(`/api/v1/community/posts/${postId}/scraps`) // 스크랩
export const getScrappedCommunityPosts = () => http.get('/api/v1/community/scraps') // 스크랩 조회
