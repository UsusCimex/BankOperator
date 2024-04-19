const baseUrl = 'http://localhost:8080/credits';

export const getAllCredits = async () => {
  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      console.error(`HTTP error, status = ${response.status}`);
      throw new Error('Failed to fetch credits');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching credits:', error);
    throw error;
  }
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
  if (!creditDetails.status) {
    console.error('Status must be provided');
    throw new Error('Status must be provided');
  }
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