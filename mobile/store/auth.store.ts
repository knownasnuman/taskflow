import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { router } from 'expo-router';

interface User { 
    id: string;
    name: string;
    email: string;
}

interface AuthState{
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}
//Baslangic degerler
const useAuthStore = create<AuthState>((set) => ({

    user: null,
    accessToken: null,
    isLoading: false,
    isAuthenticated: false,

    login: async (email, password) => {
        set({ isLoading: true});
        
        try{
            const response = await api.post('/api/auth/login', {email, password});
            const {user, accessToken, refreshToken} = response.data

            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);

            set({
                user,
                accessToken,
                isAuthenticated: true,
                isLoading: false,
            });
        }catch (error: any){
            set({isLoading: false});

            throw error;
        }

    },
    register: async ( name, email, password) => {
        set({isLoading: true});

        try{
            const response  = await api.post('/api/auth/register', {name, email, password});
            const { user, accessToken, refreshToken } = response.data;

            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);

            set({
                user,
                accessToken,
                isAuthenticated: true,
                isLoading: false,
            });
        }catch (error: any){
            set({isLoading: false});

            throw error;
        }
    },

   logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    router.replace('/(auth)/login');
  },

loadToken: async () => {
  const token = await SecureStore.getItemAsync('accessToken');

  if (token) {
    try {
      const response = await api.get('/api/auth/me');
      set({
        accessToken: token,
        user: response.data.user,
        isAuthenticated: true,
      });
    } catch (error: any) {
      // Sadece 401'de token'ı sil — network hatası değil
      if (error.response?.status === 401) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ isAuthenticated: false });
      } else {
        // Network hatası — token'ı koru, yine de giriş yap
        set({
          accessToken: token,
          isAuthenticated: true,
        });
      }
    }
  }
},
}));

export default useAuthStore;
