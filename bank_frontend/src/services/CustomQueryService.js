const baseUrl = 'http://localhost:8080/api/custom';

export const executeCustomQuery = async (query) => {
    try {
        const response = await fetch(`${baseUrl}/query`, {
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
    } catch (error) {
        console.error(error);
        throw error;
    }
};