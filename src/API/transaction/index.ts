import axios from "@/API/axios";
import type { RechargeResult } from "./types";

//查询余额
export const getBalance = async():Promise<number>=>{
    try{
        const response = await axios.get('/transaction/balance')
        return response.data.balance;
    }catch(error){
        console.error('查询余额失败',error);
        throw error;
    }
}

//充值
export const recharge = async(amount:number):Promise<RechargeResult> =>{
    try{
        const response = await axios.post('/transaction/recharge',{
            amount:amount
        })
        if(response.status === 200){
            return response.data;
        }else{
            throw new Error('充值失败');
        }
    }catch(error){
        console.error('充值失败',error);
        throw error;
    }
}

//送礼物
export const sendGift = async(amount:number,description:string,liverId:string)=>{
    try{
        const response = await axios.post('/transaction/give_gift',{
            amount:amount,
            description:description,
            liver_id:liverId
        })
        return response;
    }catch(error){
        console.error('送礼物失败',error);
        throw error;
    }
}


//查询交易记录
export const getTransactionList = async(page:number,page_size:number)=>{
    try{
        const response = await axios.get('/transaction/list',{
            params:{
                page:page,
                page_size:page_size
            }
        })
        return response.data;
    }catch(error){
        console.error('查询交易记录失败',error);
        throw error;
    }
}
