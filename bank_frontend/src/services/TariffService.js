import api from '../authorization/AxiosApi'

export const getAllTariffs = async (page) => {
  try {
    const response = await api.get(`/tariffs?page=${page}`);
    return response.data || [];
  } catch (error) {
    console.error('Failed to fetch tariffs', error);
    throw new Error(error.response?.data.error || 'Failed to fetch tariffs');
  }
};

export const getTariffsWithFilters = async (page, filters) => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    Object.entries(filters).forEach(([key, value]) => {
      if (value || value === false) {
        params.append(key, value);
      }
    });

    const response = await api.get(`/tariffs?${params}`);
    return response.data || [];
  } catch (error) {
    throw new Error('Failed to fetch tariffs with filters', error);
  }
}

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
