import React, { useState, useEffect } from 'react';

function Payments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Предполагаемый запрос к API для получения списка платежей
    const mockPayments = [
      { id: 1, amount: 1000, paymentDate: "2022-01-01" },
      { id: 2, amount: 1500, paymentDate: "2022-02-01" }
    ];
    setPayments(mockPayments);
  }, []);

  return (
    <div>
      <h2>Payments</h2>
      <ul>
        {payments.map(payment => (
          <li key={payment.id}>Amount: ${payment.amount}, Date: {payment.paymentDate}</li>
        ))}
      </ul>
    </div>
  );
}

export default Payments;
