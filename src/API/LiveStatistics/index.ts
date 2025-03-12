import axios from '@/API/axios';
import { LiveStatistics } from './types';

export const getLiveStatistics = async (live_id: string): Promise<LiveStatistics> => {
    const response = await axios.get('/LiveStatistics/get_live_statistics',{params:{
        live_id: live_id
    }});
    return response.data;
}



