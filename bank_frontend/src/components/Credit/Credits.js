import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery } from '../../services/CreditService';
import AddCreditModal from './AddCreditModal';
import '../ListView.css';

function Credits() {
  const [credits, setCredits] = useState([]);
  const [baseQuery] = useState("SELECT * FROM credit");
  const [userCreditQuery, setuserCreditQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userCreditQuery');
    const savedResults = sessionStorage.getItem('queryCreditResults');
    if (savedQuery) setuserCreditQuery(savedQuery);
    if (savedResults) setCredits(JSON.parse(savedResults));
  }, []);

  const fetchCredits = async (customQuery) => {
    setLoading(true);
    try {
      const data = await executeCustomQuery(customQuery);
      console.log("Received data:", data);
      setCredits(data || []);
      sessionStorage.setItem('queryCreditResults', JSON.stringify(data || []));
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
    const fullQuery = `${baseQuery} ${userCreditQuery}`;
    fetchCredits(fullQuery);
    sessionStorage.setItem('userCreditQuery', userCreditQuery);
  };

  const handleCreditClick = (creditId) => {
    navigate(`/credits/${creditId}`);
  };

  const handleCreditAdded = () => {
    fetchCredits(`${baseQuery} ${userCreditQuery}`);
  };

  return (
    <div>
      <h2>Credits</h2>
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
            value={userCreditQuery} 
            onChange={(e) => setuserCreditQuery(e.target.value)} 
            placeholder="e.g., WHERE 1 = 1"
            className="user-query-input"
          />
        </div>
        <small>You can use attributes like credit_id, client_id, tarif_id, amount, status, start_date, end_date in your WHERE clause.</small>
        <button type="submit">Execute Query</button>
      </form>
      <button onClick={() => setModalOpen(true)} className="add-element-btn">Add Credit</button>
      {modalOpen && <AddCreditModal onClose={() => setModalOpen(false)} onCreditAdded={handleCreditAdded} />}
      {loading && <div>Loading...</div>}
      {error && <div className="error-message">Error: {error}</div>}
      <div className="element-list">
        {credits && credits.map(credit => (
          <div key={credit.id} className="element-card" onClick={() => handleCreditClick(credit.id)}>
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