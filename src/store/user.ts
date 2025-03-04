
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    userId: null,
    balance: 0,
    followersCount: 0,
    followingCount: 0,
    avatar: ''
  }),
  actions: {
    updateBalance(amount) {
      this.balance += amount
    },
    setAvatar(avatar) {
      this.avatar = avatar
    },
    getAvatar() {
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