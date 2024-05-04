import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { executeCustomQuery, getCreditsWithFilters } from '../../services/CreditService';
import { AddCreditModal } from './AddCreditModal';
import '../ListView.css';

function Credits() {
  const [credits, setCredits] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    clientName: '', tariffName: '', amount: '', status: '', startDate: '', endDate: ''
  });
  const baseQuery = "SELECT * FROM credit";
  const [userCreditQuery, setUserCreditQuery] = useState("");
  const navigate = useNavigate();
  const role = sessionStorage.getItem('role');

  useEffect(() => {
    const savedQuery = sessionStorage.getItem('userCreditQuery');
    const savedResults = sessionStorage.getItem('queryCreditResults');
    const savedFilters = sessionStorage.getItem('creditFilters');
    if (savedQuery) setUserCreditQuery(savedQuery);
    if (savedResults) {
      const parsedResults = JSON.parse(savedResults);
      setCredits(parsedResults);
    }
    if (savedFilters) {
      const parsedFilters = JSON.parse(savedFilters);
      setFilters(filters => ({...filters, ...parsedFilters}));
    }
  }, []);

  const fetchCredits = async () => {
    setLoading(true);
    try {
      const data = await getCreditsWithFilters(filters);
      const formattedData = data.map(item => ({
        id: item.id,
        clientName: item.client.name,
        tariffName: item.tariff.name,
        amount: item.amount,
        status: item.status,
        startDate: item.startDate,
        endDate: item.endDate
      }));
      setCredits(formattedData);
      sessionStorage.setItem('queryCreditResults', JSON.stringify(formattedData));
      setError(null);
    } catch (error) {
      console.error("Failed to fetch credit details:", error);
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
    fetchCredits();
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fullQuery = `${baseQuery} ${userCreditQuery}`;
      const data = await executeCustomQuery(fullQuery);
      const formattedData = data.map(item => ({
        id: item.id,
        clientName: item.client.name,
        tariffName: item.tariff.name,
        amount: item.amount,
        status: item.status,
        startDate: item.startDate,
        endDate: item.endDate
      }));
      setCredits(formattedData);
      sessionStorage.setItem('queryCreditResults', JSON.stringify(formattedData));
      sessionStorage.setItem('userCreditQuery', userCreditQuery);
      setError(null);
    } catch (error) {
      console.error("Failed to execute SQL query:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Credits</h2>
      {role === "ROLE_ADMIN" && (
        <form onSubmit={handleSubmitQuery} className="form-standard">
          <div className="form-query-group">
            <input type="text" value={baseQuery} disabled className="base-query-input" />
            <input type="text" value={userCreditQuery} onChange={(e) => setUserCreditQuery(e.target.value)}
              placeholder="e.g., WHERE 1 = 1" className="user-query-input" />
          </div>
          <small>You can use attributes like credit_id, client_id, tariff_id, amount, status, start_date, end_date in your WHERE clause.</small>
          <button type="submit" className="execute-query-button">Execute Query</button>
        </form>
      )}
      <form onSubmit={handleApplyFilters} className="filter-form">
        <div className="form-container">
          <div className="form-input-group">
            <label htmlFor="clientName">Client Name</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={filters.clientName}
              onChange={handleFilterChange}
              placeholder="Client Name"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="tariffName">Tariff Name</label>
            <input
              type="text"
              id="tariffName"
              name="tariffName"
              value={filters.tariffName}
              onChange={handleFilterChange}
              placeholder="Tariff Name"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={filters.amount}
              onChange={handleFilterChange}
              placeholder="Amount"
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="status">Credit Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">Select Credit Status</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div className="form-input-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>
        </div>
        <button type="submit" className="form-button">Search</button>
      </form>
      {(role === "ROLE_OPERATOR" || role === "ROLE_ADMIN") && (
        <button onClick={() => setModalOpen(true)} className="add-button">Add Credit</button>
      )}
      {modalOpen && <AddCreditModal onClose={() => setModalOpen(false)} onCreditAdded={fetchCredits} />}
      {loading && <div>Loading...</div>}
      {error && <div className="alert-danger">Error: {error}</div>}
      <div className="list-container">
        {credits.map(credit => (
          <div key={credit.id} className="item-card" onClick={() => navigate(`/credits/${credit.id}`)}>
            <p>Client: {credit.clientName}</p>
            <p>Tariff: {credit.tariffName}</p>
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
