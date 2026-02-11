import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['x-auth-token'] = token; 
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // DO NOT redirect if the user is on a public profile page
            const isPublicProfile = window.location.pathname.includes('/profile/');
            
            if (!isPublicProfile) {
                localStorage.removeItem('token');
                if (!window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;