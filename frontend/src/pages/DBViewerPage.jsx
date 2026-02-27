import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, storage, theme } from '../utils';
import '../styles/App.css';

export default function DBViewerPage() {
  const navigate = useNavigate();
  const [adminKey, setAdminKey] = useState('');
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is admin
  useEffect(() => {
    const auth = storage.getAuth();
    if (!auth || auth.user?.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLoad = async () => {
    if (!adminKey.trim()) {
      setError('Please enter admin key');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.getDatabase(adminKey);
      if (result.error) {
        setError(result.error || 'Failed to fetch database');
        setDbData(null);
      } else {
        setDbData(result);
      }
    } catch (err) {
      setError('Request failed');
      setDbData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '40px' }}>
      <h1 style={{ color: theme.colors.dark, marginBottom: '20px' }}>📊 Database Viewer</h1>
      
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: theme.colors.light,
        borderRadius: '8px',
        border: `2px solid ${theme.colors.primary}`
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: `1px solid ${theme.colors.border}`,
              fontSize: '1em',
              flex: 1,
              minWidth: '200px'
            }}
          />
          <button
            onClick={handleLoad}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? theme.colors.textMuted : theme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Loading...' : '📂 Load Database'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 15px',
          borderRadius: '4px',
          color: '#c62828',
          background: '#ffcdd2',
          border: `1px solid #ef5350`,
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {dbData && (
        <div>
          <h2 style={{ color: theme.colors.dark, marginBottom: '15px' }}>
            📋 Database Tables ({Object.keys(dbData).length})
          </h2>
          {Object.entries(dbData).map(([tableName, rows]) => (
            <div
              key={tableName}
              style={{
                marginBottom: '25px',
                border: `2px solid ${theme.colors.primary}`,
                padding: '15px',
                borderRadius: '8px',
                background: theme.colors.light
              }}
            >
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#fff',
                background: theme.colors.primary,
                padding: '10px 15px',
                borderRadius: '6px',
                marginLeft: '-15px',
                marginRight: '-15px',
                marginTop: '-15px',
                marginBottom: '15px'
              }}>
                {tableName}
              </h3>

              {Array.isArray(rows) && rows.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.9em',
                    background: '#fff'
                  }}>
                    <thead>
                      <tr style={{ background: theme.colors.primary }}>
                        {Object.keys(rows[0]).map((key) => (
                          <th
                            key={key}
                            style={{
                              border: `1px solid ${theme.colors.border}`,
                              padding: '12px',
                              textAlign: 'left',
                              fontWeight: 'bold',
                              color: '#fff',
                              backgroundColor: theme.colors.primary
                            }}
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr
                          key={idx}
                          style={{
                            background: idx % 2 === 0 ? '#fafafa' : '#fff',
                            borderBottom: `1px solid ${theme.colors.border}`
                          }}
                        >
                          {Object.values(row).map((value, colIdx) => (
                            <td
                              key={colIdx}
                              style={{
                                border: `1px solid ${theme.colors.border}`,
                                padding: '12px',
                                color: theme.colors.dark,
                                wordBreak: 'break-word',
                                maxWidth: '300px'
                              }}
                            >
                              {value === null ? (
                                <span style={{ color: theme.colors.textMuted, fontStyle: 'italic' }}>NULL</span>
                              ) : (
                                String(value).substring(0, 150)
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{
                    marginTop: '10px',
                    fontSize: '0.85em',
                    color: theme.colors.textMuted
                  }}>
                    Total rows: <strong>{rows.length}</strong>
                  </p>
                </div>
              ) : (
                <p style={{
                  color: theme.colors.textMuted,
                  fontStyle: 'italic',
                  padding: '20px',
                  textAlign: 'center',
                  background: '#fafafa',
                  borderRadius: '6px'
                }}>
                  No data in table.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {!dbData && !error && !loading && (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: theme.colors.light,
          borderRadius: '8px',
          border: `2px dashed ${theme.colors.border}`
        }}>
          <p style={{ color: theme.colors.textMuted, fontSize: '1.1em' }}>
            📭 Enter admin key and click "Load Database" to view tables
          </p>
        </div>
      )}
    </div>
  );
}
