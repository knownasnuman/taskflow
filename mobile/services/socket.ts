import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://taskflow-production-6afd.up.railway.app'; 

let socket: Socket | null = null;

export const connectSocket = async () => {
  const token = await SecureStore.getItemAsync('accessToken');

  if (!token) return;

  if (socket?.connected || socket?.active) 
    return socket;
  
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
  socket = io(BASE_URL, {
    auth: { token },        
    transports: ['websocket'], 
    reconnection: true,      
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket bağlandı:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket bağlantısı kesildi');
  });

  socket.on('connect_error', (error) => {
    console.log('Socket bağlantı hatası:', error.message);
  });

  return socket;
};


export const joinProject = (projectId: string) => {
  if (socket?.connected) {
    socket.emit('join_project', projectId);
  }
};


export const leaveProject = (projectId: string) => {
  if (socket?.connected) {
    socket.emit('leave_project', projectId);
  }
};


export const onTaskUpdated = (callback: (task: any) => void) => {
  socket?.on('task_updated', callback);
};


export const offTaskUpdated = () => {
  socket?.off('task_updated');
};


export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;