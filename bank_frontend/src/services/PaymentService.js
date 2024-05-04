import api from '../authorization/AxiosApi'

export const getPaymentById = async (id) => {
  try {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch payment with id ${id}`, error);
    throw new Error(error.response?.data.error || `Failed to fetch payment with id ${id}`);
  }
};

export const getCreditPayments = async (creditId) => {
  try {
    const response = await api.get(`/payments/credit/${creditId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching credits for client ${creditId}:`, error);
    throw error;
  }
};

export const createPayment = async (payment) => {
  try {
    const response = await api.post('/payments', payment);
    return response.data;
  } catch (error) {
    console.error('Failed to create payment', error);
    throw new Error(error.response?.data.error || 'Failed to create payment');
  }
};

export const updatePayment = async (id, paymentDetails) => {
  try {
    const response = await api.put(`/payments/${id}`, paymentDetails);
    return response.data;
  } catch (error) {
    console.error(`Failed to update payment with id ${id}`, error);
    throw new Error(error.response?.data.error || `Failed to update payment with id ${id}`);
  }
};

export const deletePayment = async (id) => {
  try {
    await api.delete(`/payments/${id}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete payment with id ${id}`, error);
    throw new Error(error.response?.data.error || `Failed to delete payment with id ${id}`);
  }
};

export const executeCustomQuery = async (query) => {
  try {
    const response = await api.post('/payments/customQuery', { query });
    return response.data || [];
  } catch (error) {
    console.error('Failed to execute custom query', error);
    throw new Error(error.response?.data.error || 'Failed to execute custom query');
  }
};
