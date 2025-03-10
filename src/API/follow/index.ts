import axios from '@/API/axios'
import { getFollowerCount, followerType, followData, followStatus, fanData, fanType } from './types'


//获取粉丝数和关注数
export const getFollowStats = () =>{
    return axios.get<getFollowerCount>('/follow/get_follow_stats')
}

//关注功能
export const followUser = (userId:number) =>{
    return axios.post('/follow/follow', {followed_id: userId})
}
//取关
export const unfollowUser = (userId:number) =>{
    return axios.post('/follow/unfollow', {followed_id: userId})
}
//检查是否关注
export const checkFollowStatus = (userId:number) =>{
    return axios.get<followStatus>('/follow/check_follow_status', {params: {followed_id: userId}})
}

//获取关注列表
export const getFollowList = (params: {page: number, per_page: number}) =>{
    return axios.get<followData>('/follow/get_my_follows', {params})
}

//获取粉丝列表
export const getFollowerList = (params: {page: number, per_page: number}) =>{
    return axios.get<fanData>('/follow/get_my_fans', {params})
}
