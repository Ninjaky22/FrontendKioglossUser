import api from './api';

const productService = {
    // ── Productos ──────────────────────────────────────────────
    getAllProducts: async (page = 0, pageSize = 12, search = '', tags = [], sort = '') => {
        const params = { page, page_size: pageSize };
        if (search) params.search = search;
        if (tags && tags.length > 0) params.tags = tags.join(',');
        if (sort) params.sort = sort;
        const { data } = await api.get('/products', { params });
        return data;
    },

    getProductBySlug: async (slug) => {
        const { data } = await api.get(`/article/${slug}`);
        return data;
    },

    getProductById: async (id) => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },

    getAllTags: async () => {
        const { data } = await api.get('/tags');
        return data;
    },

    // ── Favoritos ──────────────────────────────────────────────
    // Agregar favorito: { account: accountId, product: productId } — returns { idFa }
    addFavorite: async (accountId, productId) => {
        const { data } = await api.post('/user/favorite', {
            account: Number(accountId),
            product: Number(productId),
        });
        return data; // { idFa: number }
    },

    // Eliminar favorito por su PK (idFa)
    removeFavorite: async (favoritePk) => {
        return api.delete(`/user/delete/${favoritePk}`);
    },

    // ── Órdenes ────────────────────────────────────────────────
    getOrders: async (page = 0) => {
        const { data } = await api.get('/user/orders', { params: { page } });
        return data;
    },

    createOrder: async (payload) => {
        const { data } = await api.post('/user/order', payload);
        return data;
    },
};

export default productService;
