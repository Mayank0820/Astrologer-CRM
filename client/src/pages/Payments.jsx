import { useState, useEffect } from 'react';
import { paymentsAPI } from '../services/api';
import { formatCurrency, formatDate, formatTime, getInitials, getAvatarGradient, getStatusColor } from '../utils/helpers';
import { MdPayments, MdTrendingUp, MdAccountBalance } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Payments() {
  const [data, setData] = useState({ payments: [], summary: {}, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');

  useEffect(() => {
    loadPayments();
  }, [methodFilter]);

  const loadPayments = async () => {
    try {
      const params = {};
      if (methodFilter) params.method = methodFilter;
      const res = await paymentsAPI.getAll(params);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const { payments, summary } = data;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payments</h1>
          <p className="page-subtitle">Track your revenue and transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card green" id="stat-total-received">
          <div className="stat-icon green"><MdTrendingUp /></div>
          <div className="stat-info">
            <div className="stat-label">Total Received</div>
            <div className="stat-value">{formatCurrency(summary?.total_received || 0)}</div>
          </div>
        </div>
        <div className="stat-card pink" id="stat-refunded">
          <div className="stat-icon pink"><MdAccountBalance /></div>
          <div className="stat-info">
            <div className="stat-label">Total Refunded</div>
            <div className="stat-value">{formatCurrency(summary?.total_refunded || 0)}</div>
          </div>
        </div>
        <div className="stat-card purple" id="stat-transactions">
          <div className="stat-icon purple"><MdPayments /></div>
          <div className="stat-info">
            <div className="stat-label">Total Transactions</div>
            <div className="stat-value">{summary?.total_transactions || 0}</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filters-bar">
        <select
          className="filter-select"
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          id="filter-payment-method"
        >
          <option value="">All Methods</option>
          <option value="cash">💵 Cash</option>
          <option value="upi">📱 UPI</option>
          <option value="card">💳 Card</option>
        </select>
      </div>

      {/* Payments Table */}
      {payments.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ background: getAvatarGradient(p.client_name), color: 'white', fontSize: 10 }}>
                        {getInitials(p.client_name)}
                      </div>
                      <span style={{ fontWeight: 500 }}>{p.client_name}</span>
                    </div>
                  </td>
                  <td>{p.consultation_type || 'General'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-secondary)' }}>{formatCurrency(p.amount)}</td>
                  <td>
                    <span className="badge badge-purple">
                      {p.method === 'upi' ? '📱 UPI' : p.method === 'card' ? '💳 Card' : '💵 Cash'}
                    </span>
                  </td>
                  <td><span className={`badge badge-${getStatusColor(p.status === 'completed' ? 'completed' : 'pending')}`}>{p.status}</span></td>
                  <td>
                    <div>{formatDate(p.paid_at)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(p.paid_at)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <h3 className="empty-state-title">No payments yet</h3>
          <p className="empty-state-text">Payments will appear here when consultations are completed</p>
        </div>
      )}
    </div>
  );
}
