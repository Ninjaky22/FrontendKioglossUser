import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/API/V1.0';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// ── Token helpers ──────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const setTokens = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    if (refresh) localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const { exp } = jwtDecode(token);
        return !exp || exp < Date.now() / 1000;
    } catch { return true; }
};

// Check if token will expire within `thresholdSec` seconds
export const isTokenAboutToExpire = (token, thresholdSec = 60) => {
    if (!token) return true;
    try {
        const { exp } = jwtDecode(token);
        return !exp || exp < (Date.now() / 1000) + thresholdSec;
    } catch { return true; }
};

export const getUserIdFromToken = (token = getAccessToken()) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        return decoded.user_id ?? decoded.userId ?? decoded.sub ?? null;
    } catch { return null; }
};

// ── Request interceptor: attach access token + proactive refresh ──
api.interceptors.request.use(async (config) => {
    let token = getAccessToken();
    // Proactively refresh if token is about to expire (within 60s), like restaurante_fe does
    if (token && isTokenAboutToExpire(token, 60)) {
        const refresh = getRefreshToken();
        if (refresh && !isTokenExpired(refresh)) {
            try {
                const { data } = await axios.post(`${BASE_URL}/refresh`, { refresh });
                setTokens(data.access, data.refresh);
                token = data.access;
            } catch {
                // Silently fail — the response interceptor will handle 401 if needed
            }
        }
    }
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (err) => Promise.reject(err));

// ── Response interceptor: auto-refresh with concurrency queue ──
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
    failedQueue = [];
};

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;
        const status   = error.response?.status;

        // Only retry on 401; 403 means forbidden, not expired
        if (status === 401 && !original._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    original.headers.Authorization = `Bearer ${token}`;
                    return api(original);
                });
            }

            original._retry = true;
            isRefreshing = true;

            const refresh = getRefreshToken();
            if (!refresh || isTokenExpired(refresh)) {
                clearTokens();
                isRefreshing = false;
                processQueue(error, null);
                window.dispatchEvent(new Event('auth_changed'));
                return Promise.reject(error);
            }

            try {
                // Backend: POST /refresh  body { refresh }  → { access, refresh }
                const { data } = await axios.post(`${BASE_URL}/refresh`, { refresh });
                setTokens(data.access, data.refresh);

                original.headers.Authorization = `Bearer ${data.access}`;
                processQueue(null, data.access);
                return api(original);
            } catch (refreshErr) {
                clearTokens();
                processQueue(refreshErr, null);
                // Notify AuthContext that auth has failed
                window.dispatchEvent(new Event('auth_changed'));
                return Promise.reject(refreshErr);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
