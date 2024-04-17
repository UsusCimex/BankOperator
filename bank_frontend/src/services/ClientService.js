const baseUrl = 'http://localhost:8080/clients';

export const getAllClients = async () => {
  const response = await fetch(baseUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch credits');
  }
  return await response.json();
};

export const getClientById = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch client with id ${id}`);
  }
  return await response.json();
};

export const createClient = async (client) => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(client),
  });
  if (!response.ok) {
    throw new Error('Failed to create client');
  }
  return await response.json();
};

export const updateClient = async (id, clientDetails) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientDetails),
  });
  if (!response.ok) {
    throw new Error(`Failed to update client with id ${id}`);
  }
  return await response.json();
};

export const deleteClient = async (id) => {
  const response = await fetch(`${baseUrl}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete client with id ${id}`);
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

