import api from '../authorization/AxiosApi'

export const getAllTariffs = async () => {
  try {
    const response = await api.get('/tariffs');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch tariffs', error);
    throw new Error(error.response?.data.error || 'Failed to fetch tariffs');
  }
};

export const getTariffById = async (id) => {
  try {
    const response = await api.get(`/tariffs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch tariff with id ${id}`, error);
    throw new Error(error.response?.data.error || `Failed to fetch tariff with id ${id}`);
  }
};

export const createTariff = async (tariff) => {
  try {
    const response = await api.post('/tariffs', tariff);
    return response.data;
  } catch (error) {
    console.error('Failed to create tariff', error);
    throw new Error(error.response?.data.error || 'Failed to create tariff');
  }
};

export const updateTariff = async (id, tariffDetails) => {
  try {
    const response = await api.put(`/tariffs/${id}`, tariffDetails);
    return response.data;
  } catch (error) {
    console.error(`Failed to update tariff with id ${id}`, error);
    throw new Error(error.response?.data.error || `Failed to update tariff with id ${id}`);
  }
};

export const deleteTariff = async (id) => {
  try {
    await api.delete(`/tariffs/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete tariff with id ${id}`, error);
    throw new Error(error.response?.data.error || `Failed to delete tariff with id ${id}`);
  }
};

export const executeCustomQuery = async (query) => {
  try {
    const response = await api.post('/tariffs/customQuery', { query });
    return response.data;
  } catch (error) {
    console.error('Failed to execute custom query', error);
    throw new Error(error.response?.data.error || 'Failed to execute custom query');
  }
};
