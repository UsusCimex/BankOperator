import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/TariffService';
import { AddTariffModal } from './AddTariffModal'
import '../ListView.css';

function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [baseQuery] = useState("SELECT * FROM tariff");
  const [userTariffQuery, setuserTariffQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userTariffQuery');
    const savedResults = sessionStorage.getItem('queryTariffResults');
    if (savedQuery) setuserTariffQuery(savedQuery);
    if (savedResults) setTariffs(JSON.parse(savedResults));
  }, []);


  const fetchTariffs = async (customQuery) => {
    setLoading(true);
    try {
      const data = await executeCustomQuery(customQuery);
      console.log("Received data:", data);
      setTariffs(data || []);
      sessionStorage.setItem('queryTariffResults', JSON.stringify(data || []));
      setError(null);
    } catch (error) {
      console.error("Failed to fetch tariff details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = (e) => {
    e.preventDefault();
    const fullQuery = `${baseQuery} ${userTariffQuery}`;
    fetchTariffs(fullQuery);
    sessionStorage.setItem('userTariffQuery', userTariffQuery);
  };

  const handleTariffClick = (tariffId) => {
    navigate(`/tariffs/${tariffId}`);
  };

  const handleTariffAdded = () => {
    fetchTariffs(`${baseQuery} ${userTariffQuery}`);
  };

  return (
    <div>
      <h2>Tariffs</h2>
      <form onSubmit={handleSubmitQuery} className="query-form">
        <div className="query-inputs">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input"
          />
          <input 
            type="text" 
            value={userTariffQuery} 
            onChange={(e) => setuserTariffQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like tariff_id, name, loan_term, interest_rate, max_amount in your WHERE clause.</small>
        <button type="submit">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="add-element-btn">Add Tariff</button>
      {modalOpen && <AddTariffModal onClose={() => setModalOpen(false)} onTariffAdded={handleTariffAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <div className="element-list">
        {tariffs && tariffs.map(tariff => (
          <div key={tariff.id} className="element-card" onClick={() => handleTariffClick(tariff.id)}>
            <p>Name: {tariff.name}</p>
            <p>Loan Term: {tariff.loanTerm} months</p>
            <p>Interest Rate: {tariff.interestRate}%</p>
            <p>Maximum Amount: {tariff.maxAmount}</p>
          </div>
        ))}
      </div>
    </div>
  );  
}

export default Tariffs;
