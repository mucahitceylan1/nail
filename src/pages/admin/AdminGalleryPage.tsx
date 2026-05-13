// src/pages/admin/AdminGalleryPage.tsx
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Trash2, Upload } from 'lucide-react';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  SITE_GALLERY_BUCKET,
  dbDeleteGalleryAsset,
  dbInsertGalleryAsset,
  dbReorderGalleryAssets,
  dbUpdateGalleryAssetAltText,
} from '../../api/supabase/ops';
import { refreshAdminData } from '../../api/supabase/sync';
import { uploadWithSignOrSupabase } from '../../lib/mediaUpload';
import { useSiteGalleryStore } from '../../store/useSiteGalleryStore';
import type { GalleryAsset } from '../../types';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

function extAndContentType(file: File): { ext: string; contentType: string } {
  const t = file.type;
  if (t === 'image/png') return { ext: 'png', contentType: 'image/png' };
  if (t === 'image/webp') return { ext: 'webp', contentType: 'image/webp' };
  return { ext: 'jpg', contentType: 'image/jpeg' };
}

export default function AdminGalleryPage() {
  const { t } = useTranslation('admin');
  const assets = useSiteGalleryStore((s) => s.assets);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryAsset | null>(null);

  useEffect(() => {
    void refreshAdminData();
  }, []);

  const reload = async () => {
    setErr(null);
    await refreshAdminData();
  };

  const onPickFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    try {
      let order = assets.length;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { ext, contentType } = extAndContentType(file);
        const id = crypto.randomUUID();
        const storagePath = `site/${id}.${ext}`;
        await uploadWithSignOrSupabase(SITE_GALLERY_BUCKET, storagePath, file, contentType);
        await dbInsertGalleryAsset({ storagePath, sortOrder: order, altText: file.name });
        order += 1;
      }
      await reload();
    } catch (er: unknown) {
      setErr(er instanceof Error ? er.message : String(er));
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const confirmRemove = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setErr(null);
    try {
      await dbDeleteGalleryAsset(deleteTarget.id);
      await reload();
    } catch (er: unknown) {
      setErr(er instanceof Error ? er.message : String(er));
    } finally {
      setBusy(false);
      setDeleteTarget(null);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= assets.length) return;
    const ids = assets.map((x) => x.id);
    const tmp = ids[index];
    ids[index] = ids[j];
    ids[j] = tmp;
    setBusy(true);
    setErr(null);
    try {
      await dbReorderGalleryAssets(ids);
      await reload();
    } catch (er: unknown) {
      setErr(er instanceof Error ? er.message : String(er));
    } finally {
      setBusy(false);
    }
  };

  const updateAltText = async (id: string, current: string, next: string) => {
    if (current === next) return;
    setBusy(true);
    setErr(null);
    try {
      await dbUpdateGalleryAssetAltText(id, next);
      await reload();
    } catch (er: unknown) {
      setErr(er instanceof Error ? er.message : String(er));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="admin-content">
      <header style={{ marginBottom: 24 }}>
        <span className="section-label">{t('gallery_kicker')}</span>
        <h1 className="display-2 font-display">{t('gallery_title')}</h1>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 560, marginTop: 8 }}>{t('gallery_lead')}</p>
      </header>

      {err && (
        <div className="card" style={{ padding: 12, marginBottom: 16, borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onPickFiles}
          className="sr-only"
          aria-label={t('gallery_upload')}
        />
        <Button type="button" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload size={16} style={{ marginRight: 8 }} aria-hidden />
          {t('gallery_upload')}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} onClick={() => void reload()}>
          {t('gallery_refresh')}
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {assets.map((a, index) => (
          <div key={a.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ aspectRatio: '1', background: 'var(--color-surface-2)' }}>
              <img src={a.imageUrl} alt={a.altText ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)' }}>
              <input
                type="text"
                defaultValue={a.altText ?? ''}
                onBlur={(e) => void updateAltText(a.id, a.altText ?? '', e.target.value.trim())}
                disabled={busy}
                placeholder="İşlem / Açıklama girin..."
                style={{ width: '100%', padding: '4px 8px', fontSize: '0.8125rem', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-surface)' }}
              />
            </div>
            <div style={{ padding: 12, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || index === 0}
                  onClick={() => void move(index, -1)}
                  aria-label={t('gallery_move_up')}
                  style={{ padding: '6px' }}
                >
                  <ChevronUp size={18} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy || index === assets.length - 1}
                  onClick={() => void move(index, 1)}
                  aria-label={t('gallery_move_down')}
                  style={{ padding: '6px' }}
                >
                  <ChevronDown size={18} />
                </Button>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                disabled={busy} 
                onClick={() => setDeleteTarget(a)} 
                aria-label={t('gallery_delete')}
                style={{ padding: '6px' }}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && !busy && <p style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>{t('gallery_empty')}</p>}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmRemove()}
        title="Görseli Sil"
        message="Bu galeri görselini kalıcı olarak silmek istediğinizden emin misiniz?"
        confirmLabel="Sil"
        variant="danger"
      />
    </motion.div>
  );
}
