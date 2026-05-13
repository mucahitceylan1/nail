// Nail Lab. by İldem — Functional Photo Management
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Image, Trash2, Eye, Plus, Camera } from 'lucide-react';
import Toggle from '../../components/ui/Toggle';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { useClientStore } from '../../store/useClientStore';
import { getToday } from '../../utils/formatters';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function PhotosPage() {
  const clients = useClientStore((s) => s.clients);
  const deletePhoto = useClientStore((s) => s.deletePhoto);
  const togglePhotoPublic = useClientStore((s) => s.togglePhotoPublic);
  const addPhoto = useClientStore((s) => s.addPhoto);

  const [filterType, setFilterType] = useState<'all' | 'before' | 'after'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ clientId: string; photoId: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  // Upload Form State
  const [uploadClientId, setUploadClientId] = useState('');
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [uploadType, setUploadType] = useState<'before' | 'after'>('before');
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);

  const addClient = useClientStore((s) => s.addClient);

  const clientsWithPhotos = useMemo(() => {
    return clients
      .filter((c) => c.photos.length > 0)
      .map((c) => ({
        ...c,
        photos: filterType === 'all' ? c.photos : c.photos.filter((p) => p.type === filterType),
      }))
      .filter((c) => c.photos.length > 0);
  }, [clients, filterType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (uploadType === 'before') setBeforeImage(reader.result as string);
        else setAfterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    let finalClientId = uploadClientId;
    
    if (isNewClient) {
      if (!newClientName.trim()) return;
      try {
        const client = await addClient({ name: newClientName.trim(), phone: '', notes: 'Hızlı yükleme ile oluşturuldu' });
        finalClientId = client.id;
      } catch (e) {
        console.error('Müşteri oluşturulamadı:', e);
        alert('Müşteri oluşturulamadı.');
        return;
      }
    }

    if (!finalClientId || (!beforeImage && !afterImage)) return;

    setUploading(true);
    try {
      if (beforeImage) {
        await addPhoto(finalClientId, {
          clientId: finalClientId,
          date: getToday(),
          type: 'before',
          imageData: beforeImage,
          isPublic: true,
        });
      }
      if (afterImage) {
        await addPhoto(finalClientId, {
          clientId: finalClientId,
          date: getToday(),
          type: 'after',
          imageData: afterImage,
          isPublic: true,
        });
      }
      setShowUploadModal(false);
      setBeforeImage(null);
      setAfterImage(null);
      setUploadClientId('');
      setNewClientName('');
      setIsNewClient(false);
    } catch (e) {
      console.error(e);
      alert('Yükleme başarısız.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="admin-content">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="section-label">Galeri</span>
          <h1 className="display-2 font-display">Fotoğraf Yönetimi</h1>
        </div>
        <Button variant="editorial" icon={<Plus size={16} />} onClick={() => setShowUploadModal(true)}>Hızlı Fotoğraf Yükle</Button>
      </header>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
         <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
            {(['all', 'before', 'after'] as const).map(type => (
              <button 
                key={type} 
                onClick={() => setFilterType(type)}
                style={{ 
                  padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                  background: filterType === type ? 'var(--color-accent-soft)' : 'transparent',
                  color: filterType === type ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                {type === 'all' ? 'Tümü' : type === 'before' ? 'Öncesi' : 'Sonrası'}
              </button>
            ))}
         </div>
         <span className="section-label" style={{ marginBottom: 0 }}>Toplam {clientsWithPhotos.reduce((s,c)=>s+c.photos.length,0)} Kare</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {clientsWithPhotos.map(client => (
          <div key={client.id}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{client.name}</h2>
                <div style={{ height: '1px', flex: 1, background: 'var(--color-border)', opacity: 0.5 }} />
                <Badge color="accent">{client.photos.length} GÖRÜNTÜ</Badge>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                {client.photos.map(photo => (
                  <div key={photo.id} className="card" style={{ padding: 0, position: 'relative', overflow: 'hidden' }}>
                     <div style={{ aspectRatio: '1', position: 'relative' }}>
                        <img src={photo.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                           <Badge color={photo.type === 'before' ? 'warning' : 'success'}>{photo.type === 'before' ? 'ÖNCE' : 'SONRA'}</Badge>
                        </div>
                        {photo.isPublic && (
                           <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                              <Badge color="accent"><Eye size={10} style={{ marginRight: '4px' }} /> YAYINDA</Badge>
                           </div>
                        )}
                     </div>
                     <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Toggle checked={photo.isPublic || false} onChange={() => void togglePhotoPublic(client.id, photo.id)} id={`p-${photo.id}`} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>{photo.isPublic ? 'YAYINDA' : 'GİZLİ'}</span>
                         </div>
                         <button onClick={() => setDeleteTarget({clientId: client.id, photoId: photo.id})} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        ))}
        {clientsWithPhotos.length === 0 && (
          <EmptyState icon={<Image size={48} />} title="Fotoğraf Bulunmuyor" description="Filtreye uygun fotoğraf kaydı bulunamadı." />
        )}
      </div>

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Hızlı Fotoğraf Yükle">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <label className="section-label" style={{ marginBottom: 0 }}>Müşteri Seçin</label>
               <button 
                  onClick={() => setIsNewClient(!isNewClient)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
               >
                  {isNewClient ? 'Mevcut Listeden Seç' : '+ Yeni Müşteri'}
               </button>
            </div>
            
            {isNewClient ? (
               <input 
                  type="text"
                  placeholder="Müşteri Adı Soyadı..."
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  autoFocus
               />
            ) : (
               <select 
                 value={uploadClientId} 
                 onChange={e => setUploadClientId(e.target.value)}
                 style={{ width: '100%', padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
               >
                  <option value="">Müşteri Seç...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            )}
            
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
               {(['before', 'after'] as const).map(type => (
                 <button 
                   key={type} 
                   onClick={() => setUploadType(type)} 
                   style={{ 
                     flex: 1, padding: '12px', 
                     background: uploadType === type ? 'var(--color-surface-2)' : 'transparent', 
                     color: uploadType === type ? 'var(--color-accent)' : 'var(--color-text-muted)', 
                     border: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem',
                     position: 'relative'
                   }}
                 >
                   {type === 'before' ? 'Öncesi' : 'Sonrası'}
                   {((type === 'before' && beforeImage) || (type === 'after' && afterImage)) && (
                     <div style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)' }} />
                   )}
                 </button>
               ))}
            </div>

            <div 
              onClick={() => document.getElementById(`file-upload-${uploadType}`)?.click()}
              style={{ height: '240px', border: '2px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', borderRadius: '4px' }}
            >
               {(uploadType === 'before' ? beforeImage : afterImage) ? (
                 <>
                   <img src={uploadType === 'before' ? beforeImage! : afterImage!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                      <Camera color="white" size={32} />
                   </div>
                 </>
               ) : (
                 <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <Camera size={32} style={{ marginBottom: '12px' }} />
                    <p style={{ fontSize: '0.8rem', fontWeight: 600 }}>{uploadType === 'before' ? 'ÖNCESİ' : 'SONRASI'} Fotoğrafı Seç</p>
                 </div>
               )}
               <input
                 type="file"
                 id={`file-upload-${uploadType}`}
                 className="sr-only"
                 accept="image/*"
                 onChange={handleFileChange}
                 aria-label="Fotoğraf dosyası seç"
               />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
               <Button variant="ghost" onClick={() => setShowUploadModal(false)}>İptal</Button>
               <Button 
                  variant="editorial" 
                  onClick={handleUpload} 
                  disabled={uploading || (!isNewClient && !uploadClientId) || (isNewClient && !newClientName.trim()) || (!beforeImage && !afterImage)}
                  loading={uploading}
               >
                  Yükle
               </Button>
            </div>
         </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) deletePhoto(deleteTarget.clientId, deleteTarget.photoId); setDeleteTarget(null); }} title="Görseli Sil" message="Bu görseli kalıcı olarak silmek istediğinizden emin misiniz?" confirmLabel="Sil" variant="danger" />
    </motion.div>
  );
}
