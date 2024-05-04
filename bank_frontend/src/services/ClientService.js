import api from '../authorization/AxiosApi';

export const getAllClients = async () => {
  try {
    const response = await api.get('/clients');
    return response.data || [];
  } catch (error) {
    throw new Error('Failed to fetch clients', error);
  }
};

export const getClientById = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch client with id ${id}`, error);
  }
};

export const createClient = async (client) => {
  try {
    const response = await api.post('/clients', client); 
    return response.data;
  } catch (error) {
    throw new Error('Failed to create client', error);
  }
};

export const updateClient = async (id, clientDetails) => {
  try {
    const response = await api.put(`/clients/${id}`, clientDetails); 
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update client with id ${id}`, error);
  }
};

export const deleteClient = async (id) => {
  try {
    await api.delete(`/clients/${id}`); 
    return true;
  } catch (error) {
    throw new Error(`Failed to delete client with id ${id}`, error);
  }
};

export const executeCustomQuery = async (query) => {
  try {
    const response = await api.post('/clients/customQuery', { query }); 
    return response.data || [];
  } catch (error) {
    throw new Error('Failed to execute custom query', error);
  }
};

export const getClientsWithFilters = async (filters) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value || value === false) {
        if (key === 'birthDate' && value) {
          params.append(key, new Date(value).toISOString().split('T')[0]);
        } else if (key !== 'birthDate') {
          params.append(key, value);
        }
      }
    });

    const response = await api.get(`/clients?${params}`);
    return response.data || [];
  } catch (error) {
    throw new Error('Failed to fetch clients with filters', error);
  }
};