import api from './api';

const videoService = {
    getAllVideos: async () => {
        const { data } = await api.get('/videos');
        return data;
    },
};

export default videoService;
