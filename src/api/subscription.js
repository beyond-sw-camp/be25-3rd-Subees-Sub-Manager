import http from './http'

export const createSubscription = (payload) => http.post('/api/subscriptions', payload)
export const getSubscriptionCatalog = () => http.get('/api/subscriptions/catalog')
export const getPaymentCardCatalog = () => http.get('/api/payment-cards')
export const getSubscriptions = (params) => http.get('/api/subscriptions', { params })
export const getSubscriptionDetail = (subscriptionId) => http.get(`/api/subscriptions/${subscriptionId}`)
export const updateSubscription = (subscriptionId, payload) => http.put(`/api/subscriptions/${subscriptionId}`, payload)
export const deleteSubscription = (subscriptionId) => http.delete(`/api/subscriptions/${subscriptionId}`)
