import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAccessToken, clearTokens, getUserIdFromToken } from '../services/api';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
    const [user, setUser] = useState(null);       // datos completos del usuario
    const [accountId, setAccountId] = useState(null); // account.id para favorites/orders
    const [favoriteIds, setFavoriteIds] = useState([]); // IDs de productos favoritos
    const [favoriteMap, setFavoriteMap] = useState({}); // { productId: idFa } para poder eliminar
    const [loading, setLoading] = useState(true);

    // Cargar datos del usuario si hay token — devuelve los datos para uso directo
    const fetchUser = useCallback(async () => {
        const token = getAccessToken();
        if (!token) {
            setUser(null);
            setAccountId(null);
            setFavoriteIds([]);
            setFavoriteMap({});
            setIsAuthenticated(false);
            setLoading(false);
            return null;
        }
        setIsAuthenticated(true);
        try {
            const data = await authService.getUserData();
            setUser(data);
            setAccountId(data?.account?.id ?? null);
            // Extract favorite product IDs — account.favorite may be array, string, or null
            const rawFavs = data?.account?.favorite;
            const favArray = Array.isArray(rawFavs) ? rawFavs : [];
            setFavoriteIds(favArray.map(f => f.id).filter(Boolean));
            // Build map of productId -> idFa for removal
            const map = {};
            favArray.forEach(f => { if (f.id && f.idFa) map[f.id] = f.idFa; });
            setFavoriteMap(map);
            return data;
        } catch (e) {
            console.warn('Could not fetch user data', e);
            // If tokens were cleared by the interceptor (refresh failed), update auth state
            if (!getAccessToken()) {
                setUser(null);
                setAccountId(null);
                setFavoriteIds([]);
                setFavoriteMap({});
                setIsAuthenticated(false);
            }
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
        const handler = () => fetchUser();
        window.addEventListener('auth_changed', handler);
        return () => window.removeEventListener('auth_changed', handler);
    }, [fetchUser]);

    const login = async (email, password) => {
        await authService.login(email, password);
        window.dispatchEvent(new Event('auth_changed'));
    };

    const register = async (payload) => {
        await authService.register(payload);
        window.dispatchEvent(new Event('auth_changed'));
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setAccountId(null);
        setFavoriteIds([]);
        setFavoriteMap({});
        setIsAuthenticated(false);
        window.dispatchEvent(new Event('auth_changed'));
    };

    // Allow components to add/remove a favorite ID locally (optimistic update)
    const addFavoriteId = (productId, idFa) => {
        setFavoriteIds(prev => [...prev, productId]);
        if (idFa) setFavoriteMap(prev => ({ ...prev, [productId]: idFa }));
    };
    const removeFavoriteId = (productId) => {
        setFavoriteIds(prev => prev.filter(id => id !== productId));
        setFavoriteMap(prev => { const copy = { ...prev }; delete copy[productId]; return copy; });
    };

    // Get the favorite record PK for a product
    const getFavoriteIdFa = (productId) => favoriteMap[productId] || null;

    return (
        <AuthContext.Provider value={{
            isAuthenticated, user, accountId, favoriteIds, loading,
            login, register, logout, refreshUser: fetchUser,
            addFavoriteId, removeFavoriteId, getFavoriteIdFa,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
