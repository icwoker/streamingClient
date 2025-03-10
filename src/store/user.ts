
import { defineStore } from 'pinia'
import axios from '@/API/axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    userId: null,
    balance: 0,
    followersCount: 0,
    followingCount: 0,
    avatar: '',
    bio: '' 
  }),
  actions: {
    async getUserInfo(){
      const res = await axios.get('/auth/me');
      this.userId = res.data.user_id;
      this.username = res.data.user_name;
      this.bio = res.data.bio;
      this.avatar = res.data.avatar_url;
    },
    updateBalance(amount) {
      this.balance += amount
    },
    setAvatar(avatar) {
      this.avatar = avatar
    },
    async getAvatar() {
      return this.avatar
    },
    setUserId(id) {
      this.userId = id
    },
    getUserId() {
      return this.userId
    },
    setUsername(username) {
      this.username = username
    },
    setBalance(balance) {
      this.balance = balance
    },
    setFollowersCount(followersCount) {
      this.followersCount = followersCount
    },
    setFollowingCount(followingCount) {
      this.followingCount = followingCount
    }
  }
})