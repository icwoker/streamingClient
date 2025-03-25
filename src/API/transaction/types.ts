export interface RechargeResult{
    balance:number;
    message:string;
}


export interface TransactionType{
    amount:number;
    balance_after:number;
    created_at:string;
    description:string;
    id:number;
    reference_id:string;
    transaction_type:string;
    user_id:number;
}

export interface TransactionList{
    transactions:TransactionType[];
    total:number;
    page:number;
    page_size:number;
}

export interface giftRankType{
    username:string;
    avatar:string;
    amount:number;
}
