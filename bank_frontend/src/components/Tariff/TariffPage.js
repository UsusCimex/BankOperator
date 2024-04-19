import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTariffById, updateTariff, deleteTariff } from '../../services/TariffService';
import '../DetailEdit.css';

function TariffPage() {
  const { tariffId } = useParams();
  const navigate = useNavigate();
  const [tariff, setTariff] = useState({
    name: '',
    loanTerm: 0,
    interestRate: 0.0,
    maxAmount: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTariff = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTariffById(tariffId);
      setTariff(data);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch tariff details:", error);
      setError("Failed to fetch tariff details");
    } finally {
      setLoading(false);
    }
  }, [tariffId]);

  useEffect(() => {
    fetchTariff();
  }, [fetchTariff]);

  const handleUpdate = async () => {
    try {
      await updateTariff(tariffId, tariff);
      alert('Tariff updated successfully');
    } catch (error) {
      alert('Failed to update tariff');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTariff(tariffId);
      alert('Tariff deleted successfully');
      navigate('/tariffs');
    } catch (error) {
      alert('Failed to delete tariff');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTariff(prevState => ({ ...prevState, [name]: value }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tariff) return <div>No tariff data found.</div>;

  return (
    <div className="tariff-page">
      <h2 className="tariff-header">Tariff Details</h2>
      <div className="tariff-details">
        <label htmlFor="name">Name:</label>
        <input className="input" id="name" name="name" value={tariff.name} onChange={handleChange} placeholder="Tariff Name" />
        
        <label htmlFor="loanTerm">Loan Term (months):</label>
        <input className="input" id="loanTerm" name="loanTerm" type="number" value={tariff.loanTerm} onChange={handleChange} placeholder="Loan Term" />

        <label htmlFor="interestRate">Interest Rate (%):</label>
        <input className="input" id="interestRate" name="interestRate" type="number" value={tariff.interestRate} onChange={handleChange} placeholder="Interest Rate" />
        
        <label htmlFor="maxAmount">Max Amount:</label>
        <input className="input" id="maxAmount" name="maxAmount" type="number" value={tariff.maxAmount} onChange={handleChange} placeholder="Max Amount" />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Tariff</button>
      </div>
    </div>
  );
}

export default TariffPage;
