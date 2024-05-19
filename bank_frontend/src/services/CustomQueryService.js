import api from '../authorization/AxiosApi'

export const executeCustomQuery = async (query) => {
    try {
            const response = await api.post('/api/custom/query', {query}); 
        return response.data;
    } catch (error) {
        console.error('Failed to execute custom query:', error);
        if (error.response && error.response.data) {
            throw new Error(error.response.data.error || 'Failed to execute custom query');
        }
        throw error;
    }
};
