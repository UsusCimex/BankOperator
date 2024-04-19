import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/CreditService';
import AddCreditModal from './AddCreditModal';
import '../ListView.css';

function Credits() {
  const [credits, setCredits] = useState([]);
  const baseQuery = "SELECT * FROM credit";
  const [userCreditQuery, setUserCreditQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userCreditQuery');
    const savedResults = sessionStorage.getItem('queryCreditResults');
    if (savedQuery) setUserCreditQuery(savedQuery);
    if (savedResults) setCredits(JSON.parse(savedResults));
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    const fullQuery = `${baseQuery} ${userCreditQuery}`;
    try {
      const data = await executeCustomQuery(fullQuery);
      setCredits(data || []);
      sessionStorage.setItem('queryCreditResults', JSON.stringify(data || []));
      sessionStorage.setItem('userCreditQuery', userCreditQuery);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch credit details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuery = (e) => {
    e.preventDefault();
    fetchCredits();
  };

  const handleCreditClick = (creditId) => {
    navigate(`/credits/${creditId}`);
  };

  const handleCreditAdded = () => {
    fetchCredits();
  };

  return (
    <div>
      <h2>Credits</h2>
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
            value={userCreditQuery} 
            onChange={(e) => setUserCreditQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input form-input"
          />
        </div>
        <small>You can use attributes like credit_id, client_id, tariff_id, amount, status, start_date, end_date in your WHERE clause.</small>
        <button type="submit" className="form-button">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="button button-primary">Add Credit</button>
      {modalOpen && <AddCreditModal onClose={() => setModalOpen(false)} onCreditAdded={handleCreditAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {credits.map(credit => (
          <div key={credit.id} className="item-card" onClick={() => handleCreditClick(credit.id)}>
            <p>Client: {credit.client?.name}</p>
            <p>Tariff: {credit.tariff?.name}</p>
            <p>Amount: {credit.amount}</p>
            <p>Status: {credit.status}</p>
            <p>Start Date: {credit.startDate}</p>
            <p>End Date: {credit.endDate}</p>
          </div>
        ))}
      </div>
    </div>
  );  
}

export default Credits;
