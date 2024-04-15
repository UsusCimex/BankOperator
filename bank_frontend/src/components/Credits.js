import React, { useState, useEffect } from 'react';
import { getAllCredits } from '../services/CreditService'; // Предполагается, что файл находится в папке services

function Credits() {
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const data = await getAllCredits();
        setCredits(data);
      } catch (error) {
        console.error("Failed to fetch credits:", error);
        // Тут можете добавить обработку ошибок, например, показать сообщение пользователю
      }
    };

    fetchCredits();
  }, []);

  return (
    <div>
      <h2>Credits</h2>
      <ul>
        {credits.map(credit => (
          <li key={credit.id}>
            Amount: ${credit.amount}, Status: {credit.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Credits;
