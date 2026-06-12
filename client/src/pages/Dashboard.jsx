import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, consultationsAPI } from '../services/api';
import { formatCurrency, formatDate, formatTime, getInitials, getAvatarGradient, ZODIAC_DATA, getMonthName, getStatusColor } from '../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MdPeople, MdCalendarMonth, MdPayments, MdTrendingUp, MdAccessTime, MdAdd, MdArrowForward } from 'react-icons/md';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6c63ff', '#ff6b9d', '#00d4ff', '#ffd700', '#00e676', '#ff9100', '#e91e63', '#9c27b0', '#00bcd4', '#795548', '#8bc34a', '#3f51b5'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, activityRes, upcomingRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity(),
        consultationsAPI.getUpcoming(7),
      ]);
      setStats(statsRes.data);
      setActivity(activityRes.data);
      setUpcoming(upcomingRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  const revenueData = (activity?.revenueByMonth || []).map(item => ({
    name: getMonthName(item.month),
    revenue: item.revenue,
    consultations: item.consultation_count,
  }));

  const zodiacData = (stats?.zodiac_distribution || []).map(item => ({
    name: item.zodiac_sign,
    value: item.count,
    symbol: ZODIAC_DATA[item.zodiac_sign]?.symbol || '⭐',
  }));

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your practice overview.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/clients')} id="btn-view-clients">
            <MdPeople /> View Clients
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/consultations')} id="btn-new-consultation">
            <MdAdd /> New Consultation
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card purple" id="stat-total-clients">
          <div className="stat-icon purple"><MdPeople /></div>
          <div className="stat-info">
            <div className="stat-label">Total Clients</div>
            <div className="stat-value">{stats?.total_clients || 0}</div>
          </div>
        </div>

        <div className="stat-card cyan" id="stat-upcoming">
          <div className="stat-icon cyan"><MdCalendarMonth /></div>
          <div className="stat-info">
            <div className="stat-label">Upcoming (7 days)</div>
            <div className="stat-value">{stats?.upcoming_consultations || 0}</div>
          </div>
        </div>

        <div className="stat-card gold" id="stat-revenue">
          <div className="stat-icon gold"><MdPayments /></div>
          <div className="stat-info">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(stats?.total_revenue || 0)}</div>
          </div>
        </div>

        <div className="stat-card green" id="stat-monthly">
          <div className="stat-icon green"><MdTrendingUp /></div>
          <div className="stat-info">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{formatCurrency(stats?.monthly_revenue || 0)}</div>
          </div>
        </div>

        <div className="stat-card pink" id="stat-pending">
          <div className="stat-icon pink"><MdAccessTime /></div>
          <div className="stat-info">
            <div className="stat-label">Pending Payments</div>
            <div className="stat-value">{formatCurrency(stats?.pending_amount || 0)}</div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-xl)' }}>
        {/* Revenue Chart */}
        <div className="card" id="chart-revenue">
          <div className="card-header">
            <h3 className="card-title">Revenue Trend</h3>
            <span className="badge badge-green">Last 6 months</span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6c63ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(108,99,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: '#6b6880', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b6880', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: '#111128',
                    border: '1px solid rgba(108,99,255,0.2)',
                    borderRadius: 12,
                    color: '#e8e6f0'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6c63ff" strokeWidth={2} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p className="text-muted">No revenue data yet</p>
            </div>
          )}
        </div>

        {/* Zodiac Distribution */}
        <div className="card" id="chart-zodiac">
          <div className="card-header">
            <h3 className="card-title">Client Zodiac Distribution</h3>
            <span className="badge badge-purple">All time</span>
          </div>
          {zodiacData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie
                    data={zodiacData}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {zodiacData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#111128',
                      border: '1px solid rgba(108,99,255,0.2)',
                      borderRadius: 12,
                      color: '#e8e6f0'
                    }}
                    formatter={(value, name) => [`${value} clients`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {zodiacData.slice(0, 6).map((item, i) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.symbol} {item.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p className="text-muted">No client data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid-2">
        {/* Upcoming Consultations */}
        <div className="card" id="upcoming-consultations">
          <div className="card-header">
            <h3 className="card-title">Upcoming Consultations</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/consultations')}>
              View All <MdArrowForward />
            </button>
          </div>
          {upcoming.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.slice(0, 5).map((c) => (
                <div key={c.id} className="consultation-item">
                  <div className="consultation-time">
                    <div className="time">{formatTime(c.scheduled_at)}</div>
                    <div className="date">{formatDate(c.scheduled_at)}</div>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: getAvatarGradient(c.client_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {getInitials(c.client_name)}
                  </div>
                  <div className="consultation-info">
                    <h4>{c.client_name}</h4>
                    <p>{c.type || c.service_name}</p>
                  </div>
                  <div className="consultation-amount">{formatCurrency(c.amount)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">📅</div>
              <p className="text-muted">No upcoming consultations</p>
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="card" id="recent-clients">
          <div className="card-header">
            <h3 className="card-title">Recent Clients</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')}>
              View All <MdArrowForward />
            </button>
          </div>
          {activity?.recentClients?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activity.recentClients.map((client) => (
                <div
                  key={client.id}
                  className="consultation-item"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: getAvatarGradient(client.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                    {getInitials(client.name)}
                  </div>
                  <div className="consultation-info">
                    <h4>{client.name}</h4>
                    <p>{client.place_of_birth || 'Location not set'}</p>
                  </div>
                  {client.zodiac_sign && (
                    <span className="zodiac-badge">
                      <span className="zodiac-icon">{ZODIAC_DATA[client.zodiac_sign]?.symbol}</span>
                      {client.zodiac_sign}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">👥</div>
              <p className="text-muted">No clients yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
