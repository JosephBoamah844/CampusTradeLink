import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle common errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

// User API functions
export const userApi = {
  getMe: () => api.get('/users/me'),
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: any) => api.put('/users/me', data),
  deleteAccount: () => api.delete('/users/me'),
  followUser: (id: string) => api.post(`/users/${id}/follow`),
  unfollowUser: (id: string) => api.delete(`/users/${id}/follow`),
  getFollowers: (id: string, params?: any) => api.get(`/users/${id}/followers`, { params }),
  getFollowing: (id: string, params?: any) => api.get(`/users/${id}/following`, { params }),
  searchUsers: (params: any) => api.get('/users/search', { params }),
};

// Post API functions
export const postApi = {
  getFeed: (params?: any) => api.get('/posts/feed', { params }),
  getExplorePosts: (params?: any) => api.get('/posts/explore', { params }),
  createPost: (data: any) => api.post('/posts', data),
  getPost: (id: string) => api.get(`/posts/${id}`),
  updatePost: (id: string, data: any) => api.put(`/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/posts/${id}`),
  likePost: (id: string) => api.post(`/posts/${id}/like`),
  getPostLikes: (id: string, params?: any) => api.get(`/posts/${id}/likes`, { params }),
  getPostComments: (id: string, params?: any) => api.get(`/posts/${id}/comments`, { params }),
  createComment: (postId: string, data: any) => api.post(`/posts/${postId}/comments`, data),
  updateComment: (commentId: string, data: any) => api.put(`/posts/comments/${commentId}`, data),
  deleteComment: (commentId: string) => api.delete(`/posts/comments/${commentId}`),
  likeComment: (commentId: string) => api.post(`/posts/comments/${commentId}/like`),
  getUserPosts: (userId: string, params?: any) => api.get(`/posts/user/${userId}`, { params }),
};

// Product API functions
export const productApi = {
  getProducts: (params?: any) => api.get('/products', { params }),
  createProduct: (data: any) => api.post('/products', data),
  getProduct: (id: string) => api.get(`/products/${id}`),
  updateProduct: (id: string, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/products/${id}`),
  getMyProducts: (params?: any) => api.get('/products/me', { params }),
  getUserProducts: (userId: string, params?: any) => api.get(`/products/user/${userId}`, { params }),
  searchProducts: (params: any) => api.get('/products/search', { params }),
  getProductsByCategory: (category: string, params?: any) => api.get(`/products/category/${category}`, { params }),
  markProductSold: (id: string) => api.post(`/products/${id}/sold`),
  markProductAvailable: (id: string) => api.post(`/products/${id}/available`),
  getCategories: () => api.get('/products/categories'),
};

// Message API functions
export const messageApi = {
  getConversations: (params?: any) => api.get('/messages/conversations', { params }),
  getConversationMessages: (id: string, params?: any) => api.get(`/messages/conversations/${id}`, { params }),
  sendMessage: (data: any) => api.post('/messages', data),
  markMessageRead: (id: string) => api.post(`/messages/${id}/read`),
  markConversationRead: (id: string) => api.post(`/messages/conversations/${id}/read`),
  deleteConversation: (id: string) => api.delete(`/messages/conversations/${id}`),
};

// Upload API functions
export const uploadApi = {
  uploadSingle: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/uploads/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.post('/uploads/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUserUploads: (params?: any) => api.get('/uploads/me', { params }),
};