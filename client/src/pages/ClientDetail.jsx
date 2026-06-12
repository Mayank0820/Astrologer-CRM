import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import { getInitials, getAvatarGradient, ZODIAC_DATA, formatDate, formatDateTime, formatCurrency, getStatusColor } from '../utils/helpers';
import BirthChart from '../components/charts/BirthChart';
import { MdArrowBack, MdEmail, MdPhone, MdLocationOn, MdCalendarMonth, MdAccessTime, MdEdit } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, [id]);

  const loadClient = async () => {
    try {
      const res = await clientsAPI.getById(id);
      setClient(res.data);
    } catch (err) {
      toast.error('Failed to load client');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !client) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const zodiacInfo = ZODIAC_DATA[client.zodiac_sign] || {};

  return (
    <div className="fade-in">
      {/* Back Button */}
      <button
        className="btn btn-ghost mb-lg"
        onClick={() => navigate('/clients')}
        id="btn-back-clients"
        style={{ gap: 8 }}
      >
        <MdArrowBack /> Back to Clients
      </button>

      {/* Client Header */}
      <div className="detail-header">
        <div
          className="avatar avatar-xl"
          style={{ background: getAvatarGradient(client.name), color: 'white' }}
        >
          {getInitials(client.name)}
        </div>
        <div className="detail-info" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h1>{client.name}</h1>
            {client.zodiac_sign && (
              <span className="zodiac-badge" style={{ fontSize: '0.875rem', padding: '6px 16px' }}>
                <span style={{ fontSize: '1.2rem' }}>{zodiacInfo.symbol}</span>
                {client.zodiac_sign}
              </span>
            )}
            {client.nakshatra && (
              <span className="badge badge-gold">⭐ {client.nakshatra}</span>
            )}
          </div>
          <div className="detail-meta">
            {client.email && (
              <div className="detail-meta-item"><MdEmail /> {client.email}</div>
            )}
            {client.phone && (
              <div className="detail-meta-item"><MdPhone /> {client.phone}</div>
            )}
            {client.place_of_birth && (
              <div className="detail-meta-item"><MdLocationOn /> {client.place_of_birth}</div>
            )}
            {client.date_of_birth && (
              <div className="detail-meta-item"><MdCalendarMonth /> {formatDate(client.date_of_birth)}</div>
            )}
            {client.time_of_birth && (
              <div className="detail-meta-item"><MdAccessTime /> {client.time_of_birth}</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="detail-grid">
        {/* Left: Consultations */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Consultation History</h3>
              <span className="badge badge-purple">{client.consultations?.length || 0} total</span>
            </div>
            {client.consultations?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {client.consultations.map((c) => (
                  <div key={c.id} className="consultation-item">
                    <div className="consultation-time">
                      <div className="time">{formatDate(c.scheduled_at)}</div>
                    </div>
                    <div className="consultation-info">
                      <h4>{c.type || c.service_name || 'General'}</h4>
                      <p>
                        <span className={`badge badge-${getStatusColor(c.status)}`}>{c.status}</span>
                        {c.duration_minutes && <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontSize: 11 }}>{c.duration_minutes} min</span>}
                      </p>
                      {c.notes && (
                        <p style={{ marginTop: 4, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.notes}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="consultation-amount">{formatCurrency(c.amount)}</div>
                      <span className={`badge badge-${getStatusColor(c.payment_status)} mt-sm`} style={{ fontSize: 10 }}>
                        {c.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">📅</div>
                <p className="text-muted">No consultations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Birth Chart & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Birth Chart */}
          {client.date_of_birth && (
            <div className="card" id="birth-chart-card">
              <div className="card-header">
                <h3 className="card-title">Birth Chart (Kundli)</h3>
              </div>
              <BirthChart
                dateOfBirth={client.date_of_birth}
                timeOfBirth={client.time_of_birth}
                zodiacSign={client.zodiac_sign}
              />
            </div>
          )}

          {/* Payment Summary */}
          {client.paymentSummary && (
            <div className="card" id="payment-summary">
              <div className="card-header">
                <h3 className="card-title">Payment Summary</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Paid</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: 18 }}>{formatCurrency(client.paymentSummary.total_paid)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Pending</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-secondary)', fontSize: 18 }}>{formatCurrency(client.paymentSummary.total_pending)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Total Sessions</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>{client.paymentSummary.total_consultations}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Notes</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{client.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
