import { defineStore } from 'pinia'
import axios from 'axios'
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    user: null,
    points: 0,
    streak: 0
  }),
  actions: {
    async login(username, password) {
      const res = await axios.post('/api/login', { username, password })
      this.token = res.data.token
      localStorage.setItem('token', this.token)
      this.user = res.data.user
      this.points = res.data.user.points
    },
    async register(username, password) {
      await axios.post('/api/register', { username, password })
    },
    logout() {
      this.token = ''
      this.user = null
      localStorage.removeItem('token')
    },
    async fetchProfile() {
      const res = await axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${this.token}` } })
      this.user = res.data
      this.points = res.data.points
      this.streak = res.data.streak
    },
    async sign() {
      const res = await axios.post('/api/sign', {}, { headers: { Authorization: `Bearer ${this.token}` } })
      this.points = res.data.points
      this.streak = res.data.streak
      return res.data
    }
  }
})