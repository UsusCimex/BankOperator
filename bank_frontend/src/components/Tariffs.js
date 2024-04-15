import React, { useState, useEffect } from 'react';
import { getAllTariffs } from '../services/TariffService';

function Tariffs() {
  const [tariffs, setTariffs] = useState([]);

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        const data = await getAllTariffs();
        setTariffs(data);
      } catch (error) {
        console.error("Failed to fetch tariffs:", error);
      }
    };

    fetchTariffs();
  }, []);

  return (
    <div>
      <h2>Tariffs</h2>
      <ul>
        {tariffs.map(tariff => (
          <li key={tariff.id}>
            {tariff.name}: {tariff.interestRate}% interest, term: {tariff.loanTerm} months, up to ${tariff.maxAmount}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Tariffs;
