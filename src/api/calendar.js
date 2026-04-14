import http from './http'

export const getPaymentCalendar = (params = {}) => http.get('/calendar/payments', { params })
export const getPaymentAnalytics = (params = {}) => http.get('/calendar/analytics', { params })
