import api from '../authorization/AxiosApi';

export const getAllPaymentTypes = async () => {
    try {
        const response = await api.get(`/api/paymentTypes`);
        return response.data || [];
    } catch (error) {
        throw new Error('Failed to fetch payment types', error);
    }
};

export const getPaymentTypeById = async (id) => {
    try {
      const response = await api.get(`/api/paymentTypes/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch payment type with id ${id}`, error);
    }
};
  