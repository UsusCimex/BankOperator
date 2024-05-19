import React, { useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { executeCustomQuery } from '../../services/CustomQueryService';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/sql/sql';
import './QueryPage.css';

const QueryPage = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await executeCustomQuery(query);
      if (response.error) {
        setError(response.error);
        setResult(null);
      } else {
        setResult(response);
        setError(null);
      }
    } catch (error) {
      setError("An unexpected error occurred: " + error.message);
      setResult(null);
    }
  };

  return (
    <div className="query-page">
      <h2>Execute SQL Query</h2>
      <form onSubmit={handleSubmit}>
        <div className="query-input-wrapper">
          <CodeMirror
            value={query}
            options={{
              mode: 'sql',
              theme: 'material',
              lineNumbers: true,
              lineWrapping: true,
              viewportMargin: Infinity,
            }}
            onBeforeChange={(editor, data, value) => {
              setQuery(value);
            }}
            className="code-mirror"
          />
        </div>
        <button type="submit">Execute Query</button>
      </form>
      {result && result.data && (
        <div className="query-result">
          <h3>Result:</h3>
          {renderTable(result.columns, result.data)}
        </div>
      )}
      {result && result.affectedRows !== undefined && (
        <div className="query-result">
          <h3>Result:</h3>
          <p>Affected Rows: {result.affectedRows}</p>
        </div>
      )}
      {error && (
        <div className="query-error">
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

const renderTable = (columns, data) => {
  if (data.length === 0 || !Array.isArray(data)) return null;

  return (
    <table>
      <thead>
        <tr>
          {columns.map((header, index) => (
            <th key={index}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((header, cellIndex) => (
              <td key={cellIndex}>{row[header]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default QueryPage;
