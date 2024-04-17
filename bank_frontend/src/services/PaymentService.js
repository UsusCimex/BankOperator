const baseUrl = 'http://localhost:8080/payments';

export const getPaymentById = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch payment with id ${id}`);
  }
  return await response.json();
};

export const createPayment = async (payment) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payment),
  });
  if (!response.ok) {
    throw new Error('Failed to create payment');
  }
  return await response.json();
};

export const updatePayment = async (id, paymentDetails) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentDetails),
  });
  if (!response.ok) {
    throw new Error(`Failed to update payment with id ${id}`);
  }
  return await response.json();
};

export const deletePayment = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete payment with id ${id}`);
  }
  return true;
};

export const executeCustomQuery = async (query) => {
  const response = await fetch(`${baseUrl}/customQuery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to execute custom query');
  }
  return await response.json();
};

