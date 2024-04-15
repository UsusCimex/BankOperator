const baseUrl = 'http://localhost:8080/api/tariffs';

export const getAllTariffs = async () => {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch tariffs');
  }
  return await response.json();
};

export const getTariffById = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tariff with id ${id}`);
  }
  return await response.json();
};

export const createTariff = async (tariff) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tariff),
  });
  if (!response.ok) {
    throw new Error('Failed to create tariff');
  }
  return await response.json();
};

export const updateTariff = async (id, tariffDetails) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tariffDetails),
  });
  if (!response.ok) {
    throw new Error(`Failed to update tariff with id ${id}`);
  }
  return await response.json();
};

export const deleteTariff = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete tariff with id ${id}`);
  }
  return true;
};
