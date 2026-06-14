import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  register: (data) => client.post('/auth/register/', data),
  login: (data) => client.post('/auth/login/', data),
  profile: () => client.get('/auth/profile/'),
  searchUsers: (q) => client.get('/auth/search/', { params: { q } }),
}

export const groupsApi = {
  list: () => client.get('/groups/'),
  get: (id) => client.get(`/groups/${id}/`),
  create: (data) => client.post('/groups/', data),
  addMember: (id, userId) => client.post(`/groups/${id}/members/`, { user_id: userId }),
}

export const expensesApi = {
  list: (groupId) => client.get(`/expenses/group/${groupId}/`),
  create: (groupId, data) => client.post(`/expenses/group/${groupId}/`, data),
}

export const settlementsApi = {
  dashboard: () => client.get('/settlements/dashboard/'),
  balances: (groupId) => client.get(`/settlements/group/${groupId}/balances/`),
  list: (groupId) => client.get(`/settlements/group/${groupId}/`),
  create: (groupId, data) => client.post(`/settlements/group/${groupId}/`, data),
}

export default client
