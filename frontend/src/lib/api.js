import axios from 'axios'
import { useAuth } from '@/state/auth.js'


export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 300000 })

api.interceptors.request.use((cfg)=>{
    const t = useAuth.getState().token;
    console.log('Token enviado en request:', t);

    if(t) {cfg.headers.Authorization = `Bearer ${t}`;}
    return cfg;
});





