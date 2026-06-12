import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../services/api';
import { getInitials, getAvatarGradient, ZODIAC_DATA, formatDate } from '../utils/helpers';
import { MdAdd, MdSearch, MdFilterList, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';

const zodiacSigns = ['All', 'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [zodiacFilter, setZodiacFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '',
    date_of_birth: '', time_of_birth: '', place_of_birth: '', notes: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, [search, zodiacFilter]);

  const loadClients = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (zodiacFilter !== 'All') params.zodiac = zodiacFilter;
      const res = await clientsAPI.getAll(params);
      setClients(res.data.clients);
    } catch (err) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
        toast.success('Client updated! ✨');
      } else {
        await clientsAPI.create(formData);
        toast.success('Client added! 🌟');
      }
      setShowModal(false);
      resetForm();
      loadClients();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save client');
    }
  };

  const handleEdit = (client, e) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      gender: client.gender || '',
      date_of_birth: client.date_of_birth || '',
      time_of_birth: client.time_of_birth || '',
      place_of_birth: client.place_of_birth || '',
      notes: client.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await clientsAPI.delete(id);
      toast.success('Client deleted');
      loadClients();
    } catch (err) {
      toast.error('Failed to delete client');
    }
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({ name: '', email: '', phone: '', gender: '', date_of_birth: '', time_of_birth: '', place_of_birth: '', notes: '' });
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} clients in your practice</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal} id="btn-add-client">
          <MdAdd /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-search">
          <MdSearch className="filter-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="filter-client-search"
          />
        </div>
        <select
          className="filter-select"
          value={zodiacFilter}
          onChange={(e) => setZodiacFilter(e.target.value)}
          id="filter-zodiac"
        >
          {zodiacSigns.map(z => (
            <option key={z} value={z}>{z === 'All' ? '🔮 All Signs' : `${ZODIAC_DATA[z]?.symbol} ${z}`}</option>
          ))}
        </select>
      </div>

      {/* Client Grid */}
      {clients.length > 0 ? (
        <div className="grid-cards">
          {clients.map((client) => (
            <div
              key={client.id}
              className="client-card"
              onClick={() => navigate(`/clients/${client.id}`)}
              id={`client-card-${client.id}`}
            >
              <div className="client-card-header">
                <div
                  className="avatar client-avatar"
                  style={{ background: getAvatarGradient(client.name) }}
                >
                  {getInitials(client.name)}
                </div>
                <div className="client-card-info">
                  <h3>{client.name}</h3>
                  <p>{client.place_of_birth || 'Location not set'}</p>
                </div>
                {client.zodiac_sign && (
                  <span className="zodiac-badge" style={{ marginLeft: 'auto' }}>
                    <span className="zodiac-icon">{ZODIAC_DATA[client.zodiac_sign]?.symbol}</span>
                    {client.zodiac_sign}
                  </span>
                )}
              </div>

              <div className="client-card-details">
                {client.email && (
                  <div className="client-card-detail">📧 {client.email}</div>
                )}
                {client.phone && (
                  <div className="client-card-detail">📱 {client.phone}</div>
                )}
                {client.date_of_birth && (
                  <div className="client-card-detail">🎂 {formatDate(client.date_of_birth)}</div>
                )}
                {client.nakshatra && (
                  <div className="client-card-detail">⭐ {client.nakshatra} Nakshatra</div>
                )}
              </div>

              <div className="client-card-footer">
                <div className="client-card-stat">
                  Consultations: <span>{client.consultation_count || 0}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => handleEdit(client, e)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(client.id, e)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No clients found</h3>
          <p className="empty-state-text">
            {search || zodiacFilter !== 'All'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first client to your practice'}
          </p>
          {!search && zodiacFilter === 'All' && (
            <button className="btn btn-primary" onClick={openAddModal}>
              <MdAdd /> Add Your First Client
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Client Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <MdClose />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-name">Full Name *</label>
                    <input
                      type="text"
                      id="client-name"
                      className="form-input"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-gender">Gender</label>
                    <select
                      id="client-gender"
                      className="form-select"
                      value={formData.gender}
                      onChange={(e) => setFormData(p => ({ ...p, gender: e.target.value }))}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-email">Email</label>
                    <input
                      type="email"
                      id="client-email"
                      className="form-input"
                      placeholder="Enter email"
                      value={formData.email}
                      onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-phone">Phone</label>
                    <input
                      type="tel"
                      id="client-phone"
                      className="form-input"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--accent-primary-light)' }}>🔮 Birth Details</span>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-dob">Date of Birth</label>
                    <input
                      type="date"
                      id="client-dob"
                      className="form-input"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData(p => ({ ...p, date_of_birth: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-tob">Time of Birth</label>
                    <input
                      type="time"
                      id="client-tob"
                      className="form-input"
                      value={formData.time_of_birth}
                      onChange={(e) => setFormData(p => ({ ...p, time_of_birth: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="client-pob">Place of Birth</label>
                    <input
                      type="text"
                      id="client-pob"
                      className="form-input"
                      placeholder="City, State"
                      value={formData.place_of_birth}
                      onChange={(e) => setFormData(p => ({ ...p, place_of_birth: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="client-notes">Notes</label>
                  <textarea
                    id="client-notes"
                    className="form-textarea"
                    placeholder="Additional notes about the client..."
                    value={formData.notes}
                    onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="btn-save-client">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
