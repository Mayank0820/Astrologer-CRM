import { useState, useEffect } from 'react';
import { consultationsAPI, clientsAPI, servicesAPI } from '../services/api';
import { formatDate, formatTime, formatCurrency, getInitials, getAvatarGradient, getStatusColor } from '../utils/helpers';
import { MdAdd, MdSearch, MdClose, MdCheck, MdCancel } from 'react-icons/md';
import toast from 'react-hot-toast';

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '', service_id: '', scheduled_at: '', notes: '', type: ''
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const [consultRes, clientRes, serviceRes] = await Promise.all([
        consultationsAPI.getAll(params),
        clientsAPI.getAll({ limit: 100 }),
        servicesAPI.getAll({ active_only: 'true' }),
      ]);
      setConsultations(consultRes.data.consultations);
      setClients(clientRes.data.clients);
      setServices(serviceRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.client_id || !formData.scheduled_at) {
      toast.error('Please select a client and date');
      return;
    }
    try {
      await consultationsAPI.create(formData);
      toast.success('Consultation scheduled! 📅');
      setShowModal(false);
      setFormData({ client_id: '', service_id: '', scheduled_at: '', notes: '', type: '' });
      loadData();
    } catch (err) {
      toast.error('Failed to create consultation');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const updateData = { status };
      if (status === 'completed') {
        updateData.payment_status = 'completed';
        updateData.payment_method = 'upi';
      }
      await consultationsAPI.update(id, updateData);
      toast.success(`Consultation ${status}! ${status === 'completed' ? '✅' : '❌'}`);
      loadData();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this consultation?')) return;
    try {
      await consultationsAPI.delete(id);
      toast.success('Consultation deleted');
      loadData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Consultations</h1>
          <p className="page-subtitle">Manage your appointments and sessions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="btn-schedule-consultation">
          <MdAdd /> Schedule Consultation
        </button>
      </div>

      {/* Status Tabs */}
      <div className="tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
            id={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Consultations Table */}
      {consultations.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ background: getAvatarGradient(c.client_name), color: 'white', fontSize: 10 }}>
                        {getInitials(c.client_name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.client_name}</div>
                        {c.client_zodiac && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.client_zodiac}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{c.type || c.service_name || 'General'}</td>
                  <td>
                    <div>{formatDate(c.scheduled_at)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(c.scheduled_at)}</div>
                  </td>
                  <td>{c.duration_minutes} min</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-secondary)' }}>{formatCurrency(c.amount)}</td>
                  <td><span className={`badge badge-${getStatusColor(c.status)}`}>{c.status}</span></td>
                  <td><span className={`badge badge-${getStatusColor(c.payment_status)}`}>{c.payment_status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {c.status === 'scheduled' && (
                        <>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleStatusChange(c.id, 'completed')}
                            title="Complete"
                            style={{ color: 'var(--accent-green)' }}
                          >
                            <MdCheck />
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleStatusChange(c.id, 'cancelled')}
                            title="Cancel"
                            style={{ color: 'var(--accent-tertiary)' }}
                          >
                            <MdCancel />
                          </button>
                        </>
                      )}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
                        title="Delete"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3 className="empty-state-title">No consultations found</h3>
          <p className="empty-state-text">Schedule your first consultation to get started</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <MdAdd /> Schedule Consultation
          </button>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Schedule Consultation</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="consult-client">Client *</label>
                  <select
                    id="consult-client"
                    className="form-select"
                    value={formData.client_id}
                    onChange={(e) => setFormData(p => ({ ...p, client_id: e.target.value }))}
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="consult-service">Service</label>
                  <select
                    id="consult-service"
                    className="form-select"
                    value={formData.service_id}
                    onChange={(e) => setFormData(p => ({ ...p, service_id: e.target.value }))}
                  >
                    <option value="">Select a service</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} — {formatCurrency(s.price)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="consult-date">Date & Time *</label>
                  <input
                    type="datetime-local"
                    id="consult-date"
                    className="form-input"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData(p => ({ ...p, scheduled_at: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="consult-notes">Notes</label>
                  <textarea
                    id="consult-notes"
                    className="form-textarea"
                    placeholder="Add consultation notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="btn-save-consultation">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
