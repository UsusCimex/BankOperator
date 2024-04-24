import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/TariffService';
import AddTariffModal from './AddTariffModal';
import '../ListView.css';

function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const baseQuery = "SELECT * FROM tariff";
  const [userTariffQuery, setUserTariffQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const role = localStorage.getItem('role')

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userTariffQuery');
    const savedResults = sessionStorage.getItem('queryTariffResults');
    if (savedQuery) setUserTariffQuery(savedQuery);
    if (savedResults) setTariffs(JSON.parse(savedResults));
  }, []);

  const fetchTariffs = async () => {
    setLoading(true);
    const fullQuery = `${baseQuery} ${userTariffQuery}`;
    try {
      const data = await executeCustomQuery(fullQuery);
      setTariffs(data || []);
      sessionStorage.setItem('queryTariffResults', JSON.stringify(data || []));
      sessionStorage.setItem('userTariffQuery', userTariffQuery);
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
    fetchTariffs();
  };

  const handleTariffClick = (tariffId) => {
    if (role === "ROLE_TARIFF_MANAGER" || role === "ROLE_ADMIN")
      navigate(`/tariffs/${tariffId}`);
  };

  const handleTariffAdded = () => {
    fetchTariffs();
  };

  return (
    <div>
      <h2>Tariffs</h2>
      <form onSubmit={handleSubmitQuery} className="form-standard">
        <div className="form-input-group">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input form-input"
          />
          <input 
            type="text" 
            value={userTariffQuery} 
            onChange={(e) => setUserTariffQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input form-input"
          />
        </div>
        <small>You can use attributes like tariff_id, name, loan term, interest rate, max amount in your WHERE clause.</small>
        <button type="submit" className="form-button">Execute Query</button>
      </form>
      {(role === "ROLE_TARIFF_MANAGER" || role === "ROLE_ADMIN") && <button onClick={() => setModalOpen(true)} className="button button-primary">Add Tariff</button>}
      {modalOpen && <AddTariffModal onClose={() => setModalOpen(false)} onTariffAdded={handleTariffAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {tariffs.map(tariff => (
          <div key={tariff.id} className="item-card" onClick={() => handleTariffClick(tariff.id)}>
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
