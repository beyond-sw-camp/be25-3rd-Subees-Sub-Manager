import http from './http'

export const getCommunityPosts = (params) => http.get('/api/v1/community/posts', { params })
export const getCommunityPostDetail = (postId) => http.get(`/api/v1/community/posts/${postId}`)
export const createCommunityPost = (payload) => http.post('/api/v1/community/posts', payload)
export const updateCommunityPost = (postId, payload) => http.put(`/api/v1/community/posts/${postId}`, payload)
export const deleteCommunityPost = (postId) => http.delete(`/api/v1/community/posts/${postId}`)
export const toggleCommunityScrap = (postId) => http.post(`/api/v1/community/posts/${postId}/scraps`)
export const getScrappedCommunityPosts = () => http.get('/api/v1/community/scraps')
