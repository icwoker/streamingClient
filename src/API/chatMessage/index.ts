import { ChatMessage } from "./types";
import axios from '@/API/axios'

export const getChatMessage = (live_id:string)=>{
    return axios.get('/ChatMessage/get_chat_message',{params:{live_id}})
}
