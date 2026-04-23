import api from './api';

export default {
    getCart: async (page = 0, pageSize = 8) =>
        (await api.get('/user/cart', { params: { page, page_size: pageSize } })).data,
    getAllCartItems: async () => {
        const first = await api.get('/user/cart', { params: { page: 0, page_size: 200 } });
        return first.data.content || [];
    },
    addToCart: async (payload) => await api.post('/user/cart', payload),
    updateQuantity: async (id, quantity) => await api.put(`/user/cart/${id}?quantity=${quantity}`),
    removeItem: async (id) => await api.delete(`/user/cart/${id}`),
    clearCart: async () => await api.delete('/user/cart')
};
