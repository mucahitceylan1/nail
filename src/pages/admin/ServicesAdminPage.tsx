import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, TrendingUp, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useServiceStore } from '../../store/useServiceStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import type { Service, ServiceCategory } from '../../types';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

function SortableServiceItem({
  service,
  appointmentCount,
  onRequestDelete,
}: {
  service: Service;
  appointmentCount: number;
  onRequestDelete: (service: Service) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });
  const updateService = useServiceStore((s) => s.updateService);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    void updateService(service.id, { price: Number(val) || 0 });
  };

  return (
    <div
      ref={setNodeRef}
      className={`card ${isDragging ? 'dragging' : ''}`}
      style={{ ...style, display: 'flex', alignItems: 'center', gap: '20px', padding: '16px 24px', marginBottom: '8px', cursor: 'default' }}
    >
      <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', opacity: 0.3 }}>
        <GripVertical size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{service.name}</h3>
          <Badge color="accent">{service.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</Badge>
          {appointmentCount > 0 && <Badge color="warning">{appointmentCount} randevu</Badge>}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{service.duration} dakika</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', opacity: 0.5 }}>₺</span>
          <input
            type="text"
            value={service.price || ''}
            onChange={handlePriceChange}
            style={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              padding: '10px 12px 10px 24px',
              borderRadius: '2px',
              width: '100px',
              fontWeight: 700,
              textAlign: 'right',
              fontSize: '1rem',
            }}
          />
        </div>
        <Button
          variant={service.isActive ? 'editorial' : 'ghost'}
          size="sm"
          onClick={() => void updateService(service.id, { isActive: !service.isActive })}
          style={{ minWidth: '80px' }}
        >
          {service.isActive ? 'AKTİF' : 'PASİF'}
        </Button>
        <button
          type="button"
          onClick={() => onRequestDelete(service)}
          disabled={appointmentCount > 0}
          title={appointmentCount > 0 ? 'Randevularda kullanılan hizmet silinemez.' : 'Hizmeti sil'}
          style={{
            color: '#ef4444',
            padding: '8px',
            cursor: appointmentCount > 0 ? 'not-allowed' : 'pointer',
            opacity: appointmentCount > 0 ? 0.25 : 0.5,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!appointmentCount) e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = appointmentCount > 0 ? '0.25' : '0.5';
          }}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function ServicesAdminPage() {
  const services = useServiceStore((s) => s.services);
  const addService = useServiceStore((s) => s.addService);
  const deleteService = useServiceStore((s) => s.deleteService);
  const reorderServices = useServiceStore((s) => s.reorderServices);
  const appointments = useAppointmentStore((s) => s.appointments);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [pageError, setPageError] = useState('');
  const [newService, setNewService] = useState<Omit<Service, 'id'>>({
    name: '',
    category: 'kalici_oje',
    price: 0,
    duration: 30,
    isActive: true,
    description: '',
  });

  const appointmentCounts = useMemo(() => {
    const counts = new Map<string, number>();
    appointments.forEach((appointment) => {
      appointment.serviceIds.forEach((id) => {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      });
    });
    return counts;
  }, [appointments]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) void reorderServices(active.id as string, over.id as string);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageError('');
    await addService(newService);
    setShowAddModal(false);
    setNewService({
      name: '',
      category: 'kalici_oje',
      price: 0,
      duration: 30,
      isActive: true,
      description: '',
    });
  };

  const handleDeleteService = async () => {
    if (!deleteTarget) return;
    try {
      setPageError('');
      await deleteService(deleteTarget.id);
    } catch (e) {
      console.error(e);
      setPageError(e instanceof Error ? e.message : 'Hizmet silinemedi.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const categories: ServiceCategory[] = [
    'kalici_oje', 'protez_tirnak', 'protez_bakim', 'manikur', 'pedikur',
    'jel_guclendirme', 'tirnak_yeme_tedavisi', 'kas_sekillendirme', 'artlar', 'tirnak_tamiri', 'diger',
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="admin-content">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <span className="section-label">Hizmet Yönetimi</span>
          <h1 className="display-2 font-display">Hizmetler</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} />
            Sıralamayı değiştirmek için kartları sürükleyin. Fiyatlar anlık olarak sisteme yansır.
          </p>
        </div>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          YENİ HİZMET EKLE
        </Button>
      </header>

      {pageError && (
        <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          {pageError}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {services.map((service) => (
              <SortableServiceItem
                key={service.id}
                service={service}
                appointmentCount={appointmentCounts.get(service.id) ?? 0}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Yeni Hizmet Ekle"
          onClick={() => setShowAddModal(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') setShowAddModal(false); }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg)', padding: '40px', maxWidth: '500px', width: '90%',
              border: '1px solid var(--color-border)', position: 'relative',
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', color: 'var(--color-text)', opacity: 0.5 }}
            >
              <X size={24} />
            </button>

            <h2 className="font-display" style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Yeni Hizmet Ekle</h2>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.6 }}>Hizmet Adı</label>
                <input
                  type="text"
                  required
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  style={{ width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.6 }}>Kategori</label>
                <select
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value as ServiceCategory })}
                  style={{ width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '12px' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.6 }}>Fiyat (₺)</label>
                  <input
                    type="number"
                    required
                    value={newService.price || ''}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    style={{ width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '12px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.6 }}>Süre (Dakika)</label>
                  <input
                    type="number"
                    required
                    value={newService.duration || ''}
                    onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    style={{ width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '12px' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <Button variant="primary" type="submit" style={{ width: '100%' }}>KAYDET</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDeleteService();
        }}
        title="Hizmeti Sil"
        message={deleteTarget ? `"${deleteTarget.name}" hizmetini silmek istediğinizden emin misiniz?` : ''}
        confirmLabel="Sil"
        variant="danger"
      />
    </motion.div>
  );
}
