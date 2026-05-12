import api, { getAccessToken } from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/API/V1.0';

const notificationService = {
    getNotifications: async (page = 0, pageSize = 20) => {
        const { data } = await api.get('/user/notifications', {
            params: { page, page_size: pageSize },
        });
        return data; // Page<NotificationDTO>
    },

    getUnreadCount: async () => {
        const { data } = await api.get('/user/notifications/unread-count');
        return data.count;
    },

    markRead: async (id) => {
        await api.patch(`/user/notifications/${id}/read`);
    },

    markAllRead: async () => {
        await api.patch('/user/notifications/read-all');
    },

    deleteNotification: async (id) => {
        await api.delete(`/user/notifications/${id}`);
    },

    /** Devuelve la URL del stream SSE con el token en query param */
    getStreamUrl: () => {
        const token = getAccessToken();
        return `${BASE_URL}/user/notifications/stream?token=${token}`;
    },
};

export default notificationService;
