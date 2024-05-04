import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery, getTariffsWithFilters } from '../../services/TariffService';
import AddTariffModal from './AddTariffModal';
import '../ListView.css';

function Tariffs() {
  const [tariffs, setTariffs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: '', loanTerm: '', interestRate: '', maxAmount: ''
  });
  const baseQuery = "SELECT * FROM tariff";
  const [userTariffQuery, setUserTariffQuery] = useState("");
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userTariffQuery');
    const savedResults = sessionStorage.getItem('queryTariffResults');
    const savedFilters = sessionStorage.getItem('tariffFilters');
    if (savedQuery) setUserTariffQuery(savedQuery);
    if (savedResults) setTariffs(JSON.parse(savedResults));
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }
  }, []);

  const fetchTariffs = async () => {
    setLoading(true);
    try {
      const data = await getTariffsWithFilters(filters);
      setTariffs(data);
      sessionStorage.setItem('queryTariffResults', JSON.stringify(data));
      setError(null);
    } catch (error) {
      console.error("Failed to fetch tariff details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleApplyFilters = async (e) => {
    e.preventDefault();
    fetchTariffs();
  };

  const handleExecuteQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await executeCustomQuery(`${baseQuery} ${userTariffQuery}`);
      setTariffs(data || []);
      sessionStorage.setItem('queryTariffResults', JSON.stringify(data || []));
      sessionStorage.setItem('userTariffQuery', userTariffQuery);
      setError(null);
    } catch (error) {
      console.error("Failed to execute SQL query:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTariffClick = (tariffId) => {
    if (role === "ROLE_TARIFF_MANAGER" || role === "ROLE_ADMIN")
      navigate(`/tariffs/${tariffId}`);
  };

  const handleTariffAdded = () => {
    fetchTariffs();
  };

  return (
    <div className="container">
      <h2>Tariffs</h2>
      {role === "ROLE_ADMIN" && (
      <form onSubmit={handleExecuteQuery} className="form-standard">
        <div className="form-query-group">
          <input 
            type="text" 
            value={baseQuery} 
            disabled 
            className="base-query-input"
          />
          <input 
            type="text" 
            value={userTariffQuery} 
            onChange={(e) => setUserTariffQuery(e.target.value)} 
            placeholder="e.g., WHERE name = 'Standard'"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like tariff_id, name, loan term, interest rate, max amount in your WHERE clause.</small>
        <button type="submit" className="execute-query-button">Execute Query</button>
      </form>
      )}
      <form onSubmit={handleApplyFilters} className="filter-form">
        <div className="form-container">
          {Object.keys(filters).map((key) => (
            <div key={key} className="form-input-group">
              <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input
                type="text"
                id={key}
                name={key}
                value={filters[key]}
                onChange={handleFilterChange}
                placeholder={`Enter ${key}`}
                className="form-input"
              />
            </div>
          ))}
        </div>
        <button type="submit" className="form-button">Apply Filters</button>
      </form>
      {(role === "ROLE_TARIFF_MANAGER" || role === "ROLE_ADMIN") && (
        <div className="button-group">
          <button onClick={() => setModalOpen(true)} className="add-button">Add Tariff</button>
        </div>
      )}
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
