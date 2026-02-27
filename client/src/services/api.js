import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// API Functions
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
};

export const uploadAPI = {
    upload: (formData) => api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    uploadCategorized: (formData) => api.post('/upload/categorized', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getDocuments: () => api.get('/upload/documents'),
};

export const questionAPI = {
    getAll: (params) => api.get('/questions', { params }),
    getById: (id) => api.get(`/questions/${id}`),
    create: (data) => api.post('/questions', data),
    update: (id, data) => api.put(`/questions/${id}`, data),
    delete: (id) => api.delete(`/questions/${id}`),
};

export const paperAPI = {
    getAll: () => api.get('/papers'),
    getById: (id) => api.get(`/papers/${id}`),
    create: (data) => api.post('/papers', data),
    update: (id, data) => api.put(`/papers/${id}`, data),
    delete: (id) => api.delete(`/papers/${id}`),
    adminGetAll: () => api.get('/papers/admin/all'),
    submit: (id) => api.put(`/papers/${id}/submit`),
    verify: (id) => api.put(`/papers/${id}/verify`),
};

export default api;
