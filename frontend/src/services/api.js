import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

// Transactions
export const getTransactions = () => api.get('/transactions')
export const createTransaction = (data) => api.post('/transactions', data)
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`)

// Analytics
export const getSummary = () => api.get('/analytics/summary')
export const getMonthly = () => api.get('/analytics/monthly')

// Predictions
export const generatePrediction = () => api.post('/predictions/generate')
export const getLatestPrediction = () => api.get('/predictions/latest')
