import api, { setTokens, clearTokens, getUserIdFromToken } from './api';

const authService = {
    login: async (email, password) => {
        const { data } = await api.post('/login', { email, password });
        // Backend retorna { access, refresh }
        setTokens(data.access, data.refresh);
        return data;
    },

    register: async (payload) => {
        const { data } = await api.post('/user/', payload);
        // Backend retorna { access, refresh } tras registro
        setTokens(data.access, data.refresh);
        return data;
    },

    logout: () => {
        clearTokens();
    },

    // Obtener datos completos del usuario (incluye account con favorites)
    getUserData: async () => {
        const userId = getUserIdFromToken();
        if (!userId) return null;
        const { data } = await api.get(`/user/${userId}`);
        return data;
    },

    updateUser: async (payload) => {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error('No user_id in token');
        const { data } = await api.patch(`/user/update/${userId}`, payload);
        return data;
    },
};

export default authService;
