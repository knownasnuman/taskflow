import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const BASE_URL = 'http://192.168.1.46:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) =>{
    const token = await SecureStore.getItemAsync('accessToken');

    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

export default api;

