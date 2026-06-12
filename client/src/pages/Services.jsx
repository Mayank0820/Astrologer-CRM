import { useState, useEffect } from 'react';
import { servicesAPI } from '../services/api';
import { formatCurrency, SERVICE_ICONS } from '../utils/helpers';
import { MdAdd, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';

const iconOptions = Object.entries(SERVICE_ICONS);

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', duration_minutes: 30, price: 0, icon: 'star'
  });

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    try {
      const res = await servicesAPI.getAll();
      setServices(res.data);
    } catch (err) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await servicesAPI.update(editing.id, formData);
        toast.success('Service updated! ✨');
      } else {
        await servicesAPI.create(formData);
        toast.success('Service created! 🌟');
      }
      setShowModal(false);
      resetForm();
      loadServices();
    } catch (err) {
      toast.error('Failed to save service');
    }
  };

  const handleEdit = (service) => {
    setEditing(service);
    setFormData({
      name: service.name, description: service.description || '',
      duration_minutes: service.duration_minutes, price: service.price, icon: service.icon || 'star'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await servicesAPI.delete(id);
      toast.success('Service deleted');
      loadServices();
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ name: '', description: '', duration_minutes: 30, price: 0, icon: 'star' });
  };

  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>;
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">{services.length} services offered</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }} id="btn-add-service">
          <MdAdd /> Add Service
        </button>
      </div>

      {services.length > 0 ? (
        <div className="grid-cards">
          {services.map((service) => (
            <div key={service.id} className="service-card" id={`service-${service.id}`}>
              <div className="service-card-header">
                <div className="service-icon stat-icon purple">
                  {SERVICE_ICONS[service.icon] || '⭐'}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => handleEdit(service)} title="Edit">
                    <MdEdit />
                  </button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(service.id)} title="Delete">
                    <MdDelete />
                  </button>
                </div>
              </div>
              <h3>{service.name}</h3>
              <p>{service.description || 'No description'}</p>
              <div className="service-card-footer">
                <span className="service-price">{formatCurrency(service.price)}</span>
                <span className="service-duration">{service.duration_minutes} minutes</span>
              </div>
              {service.consultation_count > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  {service.consultation_count} consultations booked
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔮</div>
          <h3 className="empty-state-title">No services yet</h3>
          <p className="empty-state-text">Create your first service offering</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <MdAdd /> Add First Service
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Service' : 'Add Service'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Icon</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {iconOptions.map(([key, emoji]) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setFormData(p => ({ ...p, icon: key }))}
                        style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: formData.icon === key ? 'rgba(108,99,255,0.2)' : 'var(--bg-tertiary)',
                          border: formData.icon === key ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="service-name">Service Name *</label>
                  <input
                    type="text" id="service-name" className="form-input"
                    placeholder="e.g., Kundli Reading"
                    value={formData.name}
                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="service-desc">Description</label>
                  <textarea
                    id="service-desc" className="form-textarea"
                    placeholder="Describe the service..."
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="service-duration">Duration (minutes)</label>
                    <input
                      type="number" id="service-duration" className="form-input"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData(p => ({ ...p, duration_minutes: parseInt(e.target.value) || 30 }))}
                      min={5}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="service-price">Price (₹)</label>
                    <input
                      type="number" id="service-price" className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                      min={0}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" id="btn-save-service">
                  {editing ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
