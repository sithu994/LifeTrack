import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface AuthResponse {
    message: string;
    userId: string;
    name?: string;
    error?: string;
}

export interface Task {
    _id?: string;
    userId: string;
    title: string;
    category: 'medicine' | 'meal' | 'hydration' | 'appointment' | 'safety';
    time?: string;
    isCompleted?: boolean;
    notes?: string;
    createdAt?: string;
}

export const auth = {
    register: async (userData: any) => {
        try {
            const response = await api.post<AuthResponse>('/register', userData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.error || 'Registration failed';
        }
    },
    login: async (credentials: any) => {
        try {
            const response = await api.post<AuthResponse>('/login', credentials);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.message || 'Login failed';
        }
    },
};

export const tasks = {
    getAll: async (userId: string) => {
        try {
            const response = await api.get<Task[]>(`/tasks/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    },
    create: async (taskData: Task) => {
        try {
            const response = await api.post<Task>('/tasks', taskData);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.error || 'Failed to create task';
        }
    },
    update: async (taskId: string, updates: Partial<Task>) => {
        try {
            const response = await api.put<Task>(`/tasks/${taskId}`, updates);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.error || 'Failed to update task';
        }
    },
    delete: async (taskId: string) => {
        try {
            const response = await api.delete(`/tasks/${taskId}`);
            return response.data;
        } catch (error: any) {
            throw error.response?.data?.error || 'Failed to delete task';
        }
    },
};

export default api;
