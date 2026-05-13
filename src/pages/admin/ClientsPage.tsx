// src/pages/admin/ClientsPage.tsx
// Nail Lab. by İldem — Admin Pages
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Plus, Trash2, Phone, Calendar as CalIcon,
  Camera, User, X, Upload,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { useClientStore } from '../../store/useClientStore';
import { useAppointmentStore } from '../../store/useAppointmentStore';
import { useServiceStore } from '../../store/useServiceStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import { formatDate, formatPrice, formatPhone, getToday } from '../../utils/formatters';
import { validateName, validatePhone } from '../../utils/validators';
import type { Client } from '../../types';

const MAX_PHOTOS = 20;

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function ClientsPage() {
  const clients = useClientStore((s) => s.clients);
  const addClient = useClientStore((s) => s.addClient);
  const updateClient = useClientStore((s) => s.updateClient);
  const deleteClient = useClientStore((s) => s.deleteClient);
  const addPhoto = useClientStore((s) => s.addPhoto);
  const deletePhoto = useClientStore((s) => s.deletePhoto);
  const getByClient = useAppointmentStore((s) => s.getByClient);
  const services = useServiceStore((s) => s.services);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteError, setNoteError] = useState('');

  // Photo upload state
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    const q = searchQuery.toLowerCase().trim();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [clients, searchQuery]);

  const parentRef = useRef<HTMLDivElement>(null);
  // TanStack Virtual currently triggers react-compiler compatibility warning in eslint.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredClients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 53,
    overscan: 5,
  });

  const handleAddClient = async () => {
    const nameResult = validateName(newName);
    const phoneResult = validatePhone(newPhone);
    const errors: Record<string, string> = {};
    if (!nameResult.isValid) errors.name = nameResult.message;
    if (!phoneResult.isValid) errors.phone = phoneResult.message;
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setAddBusy(true);
    try {
      await addClient({ name: newName.trim(), phone: newPhone.trim() });
      setNewName('');
      setNewPhone('');
      setFormErrors({});
      setShowAddModal(false);
    } catch (e) {
      console.error(e);
      alert('Müşteri eklenemedi.');
    } finally {
      setAddBusy(false);
    }
  };

  const getClientTotalSpending = useCallback(
    (clientId: string): number => {
      const appointments = getByClient(clientId);
      return appointments
        .filter((a) => a.status === 'completed')
        .reduce((sum, a) => sum + a.totalPrice, 0);
    },
    [getByClient]
  );

  const getClientAppointmentCount = useCallback(
    (clientId: string): number => {
      return getByClient(clientId).length;
    },
    [getByClient]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedClient || !photoPreview) return;

    if (selectedClient.photos.length >= MAX_PHOTOS) {
      alert('Maksimum fotoğraf sayısına ulaşıldı.');
      return;
    }

    setUploadBusy(true);
    try {
      await addPhoto(selectedClient.id, {
        clientId: selectedClient.id,
        type: photoType,
        imageData: photoPreview,
        date: getToday(),
        isPublic: true,
      });

      setPhotoPreview(null);
      setPhotoType('before');
      if (fileInputRef.current) fileInputRef.current.value = '';

      const updated = useClientStore.getState().getClient(selectedClient.id);
      if (updated) setSelectedClient(updated);
    } catch (e) {
      console.error(e);
      alert('Fotoğraf kaydedilemedi.');
    } finally {
      setUploadBusy(false);
    }
  };

  const getServiceNames = (serviceIds: string[]): string =>
    serviceIds
      .map((id) => services.find((s) => s.id === id)?.name ?? 'Bilinmeyen')
      .join(', ');

  // Refresh selected client when store changes
  const refreshSelected = () => {
    if (selectedClient) {
      const updated = useClientStore.getState().getClient(selectedClient.id);
      if (updated) setSelectedClient(updated);
    }
  };

  useEffect(() => {
    setNoteDraft(selectedClient?.notes ?? '');
    setNoteError('');
  }, [selectedClient]);

  const handleDeletePhoto = async (clientId: string, photoId: string) => {
    try {
      await deletePhoto(clientId, photoId);
      refreshSelected();
    } catch (e) {
      console.error(e);
      alert('Fotoğraf silinemedi.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedClient) return;
    try {
      setNoteSaving(true);
      setNoteError('');
      await updateClient(selectedClient.id, { notes: noteDraft.trim() || undefined });
      const updated = useClientStore.getState().getClient(selectedClient.id);
      if (updated) setSelectedClient(updated);
    } catch (e) {
      console.error(e);
      setNoteError('Notlar kaydedilemedi.');
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--sp-4)',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 500,
          }}
        >
          Müşteriler
        </h1>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={() => setShowAddModal(true)}
        >
          Yeni Müşteri
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--sp-3)', maxWidth: '400px' }}>
        <Input
          label="Ara"
          placeholder="İsim veya telefon ile ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>

      {/* Table */}
      {filteredClients.length > 0 ? (
        <div
          ref={parentRef}
          style={{
            overflowY: 'auto',
            maxHeight: '600px',
            borderRadius: '4px',
            border: '1px solid var(--color-surface-2)',
            position: 'relative',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            <thead>
              <tr
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  background: 'var(--color-surface)',
                  borderBottom: '1px solid var(--color-surface-2)',
                }}
              >
                {['Ad Soyad', 'Telefon', 'Kayıt Tarihi', 'Randevu', 'Toplam Harcama', 'İşlem'].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: 'var(--color-text-muted)',
                        whiteSpace: 'nowrap',
                        background: 'var(--color-surface)',
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody
              style={{
                width: '100%',
              }}
            >
              {rowVirtualizer.getVirtualItems()[0]?.start > 0 && (
                <tr>
                  <td colSpan={6} style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start}px` }} />
                </tr>
              )}
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const client = filteredClients[virtualRow.index];
                return (
                  <tr
                    key={client.id}
                    style={{
                      borderBottom: '1px solid var(--color-surface-2)',
                      transition: 'background var(--duration-fast) var(--ease-out)',
                      cursor: 'pointer',
                      height: `${virtualRow.size}px`,
                    }}
                    onClick={() => setSelectedClient(client)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-surface)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                      {client.name}
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {formatPhone(client.phone)}
                    </td>
                    <td
                      style={{
                        padding: '14px 16px',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      {formatDate(client.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {getClientAppointmentCount(client.id)}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-accent)' }}>
                      {formatPrice(getClientTotalSpending(client.id))}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(client.id);
                        }}
                        icon={<Trash2 size={14} />}
                      >
                        Sil
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0) > 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      height: `${rowVirtualizer.getTotalSize() - (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1]?.end ?? 0)}px`
                    }}
                  />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<Users size={48} />}
          title="Müşteri bulunamadı"
          description={searchQuery ? 'Arama sonucu boş.' : 'Henüz müşteri eklenmemiş.'}
          actionLabel={!searchQuery ? 'Müşteri Ekle' : undefined}
          onAction={!searchQuery ? () => setShowAddModal(true) : undefined}
        />
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormErrors({});
          setNewName('');
          setNewPhone('');
        }}
        title="Yeni Müşteri Ekle"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          <Input
            label="Ad Soyad"
            placeholder="Müşteri adını girin"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={() => {
              const r = validateName(newName);
              setFormErrors((p) => ({ ...p, name: r.isValid ? '' : r.message }));
            }}
            error={formErrors.name}
            icon={<User size={16} />}
          />
          <Input
            label="Telefon"
            placeholder="05XX XXX XX XX"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            onBlur={() => {
              const r = validatePhone(newPhone);
              setFormErrors((p) => ({ ...p, phone: r.isValid ? '' : r.message }));
            }}
            error={formErrors.phone}
            icon={<Phone size={16} />}
            type="tel"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-1)' }}>
            <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={addBusy}>
              İptal
            </Button>
            <Button variant="primary" onClick={() => void handleAddClient()} loading={addBusy}>
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>

      {/* Client Detail Modal */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => {
          setSelectedClient(null);
          setPhotoPreview(null);
        }}
        title={selectedClient?.name ?? ''}
        maxWidth="640px"
      >
        {selectedClient && (
          <div>
            {/* Client Info Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                marginBottom: 'var(--sp-3)',
                padding: '16px',
                background: 'var(--color-bg)',
                borderRadius: '4px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Telefon
                </div>
                <div style={{ fontSize: '0.875rem' }}>{formatPhone(selectedClient.phone)}</div>
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                  Toplam Harcama
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                  {formatPrice(getClientTotalSpending(selectedClient.id))}
                </div>
              </div>
            </div>

            <Tabs
              tabs={[
                {
                  id: 'appointments',
                  label: 'Randevular',
                  content: (
                    <ClientAppointments
                      clientId={selectedClient.id}
                      getServiceNames={getServiceNames}
                    />
                  ),
                },
                {
                  id: 'photos',
                  label: 'Fotoğraflar',
                  content: (
                    <div>
                      {/* Upload */}
                      <div
                        style={{
                          marginBottom: 'var(--sp-3)',
                          padding: '16px',
                          border: '1px dashed var(--color-surface-2)',
                          borderRadius: '4px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 'var(--sp-2)',
                            alignItems: 'center',
                            marginBottom: 'var(--sp-2)',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              background: 'var(--color-bg)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                              border: '1px solid var(--color-surface-2)',
                            }}
                          >
                            {(['before', 'after'] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => setPhotoType(type)}
                                style={{
                                  padding: '6px 14px',
                                  fontSize: '0.8125rem',
                                  fontWeight: 500,
                                  color:
                                    photoType === type
                                      ? 'var(--color-accent)'
                                      : 'var(--color-text-muted)',
                                  background:
                                    photoType === type
                                      ? 'var(--color-accent-soft)'
                                      : 'transparent',
                                }}
                              >
                                {type === 'before' ? 'Öncesi' : 'Sonrası'}
                              </button>
                            ))}
                          </div>
                          <label
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 14px',
                              fontSize: '0.8125rem',
                              fontWeight: 500,
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              border: '1px solid var(--color-surface-2)',
                              transition: 'all var(--duration-fast) var(--ease-out)',
                            }}
                          >
                            <Upload size={14} />
                            Dosya Seç
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>

                        {photoPreview && (
                          <div style={{ display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-end' }}>
                            <img
                              src={photoPreview}
                              alt="Önizleme"
                              style={{
                                width: '120px',
                                height: '120px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button variant="primary" size="sm" onClick={() => void handleSavePhoto()} loading={uploadBusy}>
                                Kaydet
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setPhotoPreview(null);
                                  if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                              >
                                İptal
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Photos grid */}
                      {selectedClient.photos.length > 0 ? (
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                            gap: '8px',
                          }}
                        >
                          {selectedClient.photos.map((photo) => (
                            <div
                              key={photo.id}
                              style={{
                                position: 'relative',
                                aspectRatio: '1',
                                borderRadius: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <img
                                src={photo.imageData}
                                alt={photo.type === 'before' ? 'Öncesi' : 'Sonrası'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  left: '4px',
                                }}
                              >
                                <Badge
                                  color={photo.type === 'before' ? 'warning' : 'success'}
                                >
                                  {photo.type === 'before' ? 'Önce' : 'Sonra'}
                                </Badge>
                              </div>
                              <button
                                onClick={() => {
                                  void handleDeletePhoto(selectedClient.id, photo.id);
                                }}
                                aria-label="Fotoğrafı sil"
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  background: 'rgba(224, 112, 112, 0.8)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity var(--duration-fast)',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.opacity = '0';
                                }}
                              >
                                <X size={12} style={{ color: '#0A0A0A' }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <EmptyState
                          icon={<Camera size={36} />}
                          title="Fotoğraf yok"
                          description="Bu müşteriye ait fotoğraf bulunmuyor."
                        />
                      )}
                    </div>
                  ),
                },
                {
                  id: 'notes',
                  label: 'Notlar',
                  content: (
                    <div>
                      <Textarea
                        label="Müşteri Notları"
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        placeholder="Müşteri hakkında not ekleyin..."
                      />
                      {noteError && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', marginTop: '8px' }}>
                          {noteError}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                        <Button variant="primary" size="sm" onClick={() => void handleSaveNotes()} loading={noteSaving}>
                          Notlari Kaydet
                        </Button>
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          void (async () => {
            if (deleteTarget) {
              try {
                await deleteClient(deleteTarget);
              } catch (e) {
                console.error(e);
                alert('Müşteri silinemedi.');
              }
            }
            setDeleteTarget(null);
          })();
        }}
        title="Müşteriyi Sil"
        message="Bu müşteriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmLabel="Sil"
        variant="danger"
      />
    </motion.div>
  );
}

// Sub-component for client appointments tab
function ClientAppointments({
  clientId,
  getServiceNames,
}: {
  clientId: string;
  getServiceNames: (ids: string[]) => string;
}) {
  const allAppointments = useAppointmentStore((s) => s.appointments);
  const appointments = useMemo(
    () => allAppointments.filter((a) => a.clientId === clientId),
    [allAppointments, clientId]
  );

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Bekliyor',
    confirmed: 'Onaylandı',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
  };

  const STATUS_COLORS: Record<string, 'warning' | 'accent' | 'success' | 'danger'> = {
    pending: 'warning',
    confirmed: 'accent',
    completed: 'success',
    cancelled: 'danger',
  };

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={<CalIcon size={36} />}
        title="Randevu yok"
        description="Bu müşteriye ait randevu bulunmuyor."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {appointments.map((appt) => (
        <div
          key={appt.id}
          style={{
            padding: '12px',
            background: 'var(--color-bg)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {formatDate(appt.date)} — {appt.timeSlot}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                marginTop: '2px',
              }}
            >
              {getServiceNames(appt.serviceIds)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {appt.totalPrice > 0 && (
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {formatPrice(appt.totalPrice)}
              </span>
            )}
            <Badge color={STATUS_COLORS[appt.status] ?? 'default'}>
              {STATUS_LABELS[appt.status] ?? appt.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function Users(props: { size: number }) {
  return (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
