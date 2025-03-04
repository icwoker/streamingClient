import axios , {AxiosInstance, AxiosRequestConfig,AxiosResponse} from "axios";
import {apiBaseUrl} from "@/env/ApiConfig";
const config:AxiosRequestConfig = {
    baseURL:`${apiBaseUrl}/api`,
    timeout:5000,
    withCredentials:true,
};

const instance:AxiosInstance = axios.create(config);

//请求拦截
instance.interceptors.request.use(
   (config) => {
    return config;
   },
   (error)=>{
    return Promise.reject(error);
   }
)

//响应拦截
instance.interceptors.response.use((response)=>{
    return response;
},(error)=>{
    if(error.response.status === 401){
        window.location.href = "/login";
    }
    return Promise.reject(error);
})

export default instance;




