import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import api from '../../authorization/AxiosApi';
import "react-datepicker/dist/react-datepicker.css";
import "./Report.css";

const ReportPage = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reportData, setReportData] = useState([]);

    const fetchReport = async () => {
        try {
            const response = await api.get(`http://localhost:8080/reports/credit`, {
                params: { from: startDate.toISOString().split('T')[0], to: endDate.toISOString().split('T')[0] }
            });
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('Failed to fetch report');
        }
    };

    return (
        <div className="report container">
            <h1>Credit Report</h1>
            <div>
                <label>Start Date: </label>
                <DatePicker selected={startDate} onChange={date => setStartDate(date)} />
            </div>
            <div>
                <label>End Date: </label>
                <DatePicker selected={endDate} onChange={date => setEndDate(date)} />
            </div>
            <button onClick={fetchReport}>Generate Report</button>
            <table>
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Total Issued</th>
                        <th>Total Returned</th>
                        <th>Overdue Percentage</th>
                        <th>Profitability</th>
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.period}</td>
                            <td>{item.totalIssued.toFixed(2)}</td>
                            <td>{item.totalReturned.toFixed(2)}</td>
                            <td>{item.overduePercentage.toFixed(2)}%</td>
                            <td>{(item.profitability * 100).toFixed(2)}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportPage;
