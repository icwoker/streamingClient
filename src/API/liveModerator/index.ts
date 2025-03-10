import axios from '@/API/axios';
import { LiveModeratorListType, LiveModeratorType } from './types';

export const createLiveModerator = async (user_id: number) => {
    return await axios.post('/liveModerator/create', {
        'moderator_id': user_id
    })
}

export const deleteLiveModerator = async (user_id: number) => {
    return await axios.post('/liveModerator/remove', {
        'moderator_id': user_id
    })
}

export const getLiveModeratorList = async (page: number, page_size: number) => {
    return await axios.get('/liveModerator/list',{
        params:{
            'page':page,
            'per_page':page_size
        }
    })
}

export const checkLiveModerator = async (user_id: number) => {
    return await axios.get('/liveModerator/check',{
        params:{
            'moderator_id':user_id
        }
    })
}
