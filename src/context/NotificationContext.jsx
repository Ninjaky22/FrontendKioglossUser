import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    // Ref para la página: no causa re-renders y evita closures obsoletos
    const pageRef = useRef(0);
    const eventSourceRef = useRef(null);

    const fetchNotifications = useCallback(async (reset = false) => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const currentPage = reset ? 0 : pageRef.current;
            const data = await notificationService.getNotifications(currentPage, 20);
            const items = data.content ?? [];
            setNotifications(prev => reset ? items : [...prev, ...items]);
            setHasMore(!data.last);
            // Después del reset quedamos en página 1 (la 0 ya fue cargada)
            pageRef.current = reset ? 1 : currentPage + 1;
        } catch (e) {
            console.warn('Error fetching notifications', e);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]); // Ya no depende de `page` state

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch { /* silent */ }
    }, [isAuthenticated]);

    // Carga inicial y conexión SSE
    useEffect(() => {
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            setHasMore(true);
            pageRef.current = 0;
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            return;
        }

        fetchNotifications(true);
        fetchUnreadCount();

        const url = notificationService.getStreamUrl();
        const es = new EventSource(url);
        eventSourceRef.current = es;

        es.addEventListener('notification', (e) => {
            try {
                const notif = JSON.parse(e.data);
                setNotifications(prev => [notif, ...prev]);
                setUnreadCount(prev => prev + 1);
            } catch { /* malformed event */ }
        });

        return () => {
            es.close();
            eventSourceRef.current = null;
        };
    }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

    const markRead = useCallback(async (id) => {
        // Solo decrementar si la notificación estaba sin leer
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.map(n => n.id === id ? { ...n, read: true } : n);
        });
        notificationService.markRead(id).catch(() => {});
    }, []);

    const markAllRead = useCallback(async () => {
        await notificationService.markAllRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    const removeNotification = useCallback(async (id) => {
        setNotifications(prev => {
            const target = prev.find(n => n.id === id);
            if (target && !target.read) {
                setUnreadCount(c => Math.max(0, c - 1));
            }
            return prev.filter(n => n.id !== id);
        });
        notificationService.deleteNotification(id).catch(() => {});
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) fetchNotifications(false);
    }, [loading, hasMore, fetchNotifications]);

    return (
        <NotificationContext.Provider value={{
            notifications, unreadCount, loading, hasMore,
            markRead, markAllRead, removeNotification, loadMore,
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
    return ctx;
}
