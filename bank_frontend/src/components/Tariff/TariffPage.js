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

  const fetchData = useCallback(async () => {
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
    const timer = setTimeout(() => {
      fetchData();
    }, 50);

    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleUpdate = async () => {
    try {
      await updateTariff(tariffId, tariff);
      alert('Tariff updated successfully');
      navigate('/tariffs');
    } catch (error) {
      setError(`Failed to update tariff: ${error.message}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTariff(tariffId);
      alert('Tariff deleted successfully');
      navigate('/tariffs');
    } catch (error) {
      setError(`Failed to delete tariff: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTariff(prevState => ({ ...prevState, [name]: parseFloat(value) || value }));
  };

  const dismissError = () => setError(null);

  if (loading) return <div>Loading...</div>;
  if (!tariff) return <div>No tariff data found.</div>;

  return (
    <div className="detail-page tariff-page">
      {error && (
        <div className="alert alert-danger">
          <button onClick={dismissError} className="close" title="Close">
            &times;
          </button>
          {error}
        </div>
      )}
      <h2 className="detail-header">Tariff Details</h2>
      <div className="detail-details">
        <label htmlFor="name">Name:</label>
        <input className="input" id="name" name="name" value={tariff.name || ''} onChange={handleChange} placeholder="Tariff Name" />
        
        <label htmlFor="loanTerm">Loan Term (months):</label>
        <input className="input" id="loanTerm" name="loanTerm" type="number" value={tariff.loanTerm || 0} onChange={handleChange} placeholder="Loan Term" />

        <label htmlFor="interestRate">Interest Rate (%):</label>
        <input className="input" id="interestRate" name="interestRate" type="number" value={tariff.interestRate || 0.0} onChange={handleChange} placeholder="Interest Rate" />
        
        <label htmlFor="maxAmount">Max Amount:</label>
        <input className="input" id="maxAmount" name="maxAmount" type="number" value={tariff.maxAmount || 0} onChange={handleChange} placeholder="Max Amount" />
      </div>
      <div className="buttons">
        <button className="button" onClick={handleUpdate}>Save Changes</button>
        <button className="button" onClick={handleDelete}>Delete Tariff</button>
      </div>
    </div>
  );
}

export default TariffPage;
