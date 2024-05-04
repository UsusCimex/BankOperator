import api from '../authorization/AxiosApi'

export const getAllCredits = async () => {
  try {
    const response = await api.get('/credits');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching credits:', error);
    throw error;
  }
};

export const getCreditsWithFilters = async (filters) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value || value === false) {
        if ((key === 'startDate' || key === 'endDate') && value) {
          params.append(key, new Date(value).toISOString().split('T')[0]);
        } else {
          params.append(key, value);
        }
      }
    });

    const response = await api.get(`/credits?${params}`);
    return response.data || [];
  } catch (error) {
    throw new Error('Failed to fetch credits with filters', error);
  }
};

export const getClientCredits = async (clientId) => {
  try {
    const response = await api.get(`/credits/client/${clientId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching credits for client ${clientId}:`, error);
    throw error;
  }
};

export const getCreditById = async (id) => {
  try {
    const response = await api.get(`/credits/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch credit with id ${id}`, error);
    throw error;
  }
};

export const createCredit = async (credit) => {
  try {
    const response = await api.post('/credits', credit);
    return response.data;
  } catch (error) {
    console.error('Failed to create credit', error);
    throw error;
  }
};

export const updateCredit = async (id, creditDetails) => {
  if (!creditDetails.status) {
    console.error('Status must be provided');
    throw new Error('Status must be provided');
  }
  try {
    const response = await api.put(`/credits/${id}`, creditDetails);
    return response.data;
  } catch (error) {
    console.error(`Failed to update credit with id ${id}`, error);
    throw error;
  }
};

export const deleteCredit = async (id) => {
  try {
    await api.delete(`/credits/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete credit with id ${id}`, error);
    throw error;
  }
};

export const executeCustomQuery = async (query) => {
  try {
    const response = await api.post('/credits/customQuery', { query });
    return response.data || [];
  } catch (error) {
    console.error('Failed to execute custom query', error);
    throw error;
  }
};
