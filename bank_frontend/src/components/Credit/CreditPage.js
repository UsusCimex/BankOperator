import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCreditById, updateCredit, deleteCredit } from '../../services/CreditService';
import '../Page.css';

function CreditPage() {
  const { creditId } = useParams();
  const navigate = useNavigate();
  const [credit, setCredit] = useState({
    client: '',
    tariff: '',
    amount: 0,
    status: '',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCredit = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCreditById(creditId);
      setCredit(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch credit details:", error);
      setError("Failed to fetch credit details");
    } finally {
      setLoading(false);
    }
  }, [creditId]);

  useEffect(() => {
    fetchCredit();
  }, [fetchCredit]);

  const handleUpdate = async () => {
    try {
      await updateCredit(creditId, credit);
      alert('Credit updated successfully');
    } catch (error) {
      alert('Failed to update credit');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCredit(creditId);
      alert('Credit deleted successfully');
      navigate('/credits');
    } catch (error) {
      alert('Failed to delete credit');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredit(prevState => ({ ...prevState, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!credit) return <div>No credit data found.</div>;

  return (
    <div className="credit-page">
      <h2 className="credit-header">Credit Details</h2>
      <div className="credit-details">
        <label htmlFor="client">Client:</label>
        <input className="input" id="client" name="client" value={credit.client} onChange={handleChange} placeholder="Client ID" />
        
        <label htmlFor="tariff">Tariff:</label>
        <input className="input" id="tariff" name="tariff" value={credit.tariff} onChange={handleChange} placeholder="Tariff ID" />

        <label htmlFor="amount">Amount:</label>
        <input className="input" id="amount" name="amount" type="number" value={credit.amount} onChange={handleChange} placeholder="Amount" />
        
        <label htmlFor="status">Status:</label>
        <input className="input" id="status" name="status" value={credit.status} onChange={handleChange} placeholder="Status" />
        
        <label htmlFor="startDate">Start Date:</label>
        <input className="input" id="startDate" type="date" name="startDate" value={credit.startDate} onChange={handleChange} />

        <label htmlFor="endDate">End Date:</label>
        <input className="input" id="endDate" type="date" name="endDate" value={credit.endDate} onChange={handleChange} />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Credit</button>
      </div>
    </div>
  );
}

export default CreditPage;
