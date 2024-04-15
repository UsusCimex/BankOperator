const baseUrl = 'http://localhost:8080/api/credits';

export const getAllCredits = async () => {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }
  return await response.json();
};

export const getCreditById = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch credit with id ${id}`);
  }
  return await response.json();
};

export const createCredit = async (credit) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credit),
  });
  if (!response.ok) {
    throw new Error('Failed to create credit');
  }
  return await response.json();
};

export const updateCredit = async (id, creditDetails) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(creditDetails),
  });
  if (!response.ok) {
    throw new Error(`Failed to update credit with id ${id}`);
  }
  return await response.json();
};

export const deleteCredit = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete credit with id ${id}`);
  }
  return true;
};
