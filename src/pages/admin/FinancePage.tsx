// src/pages/admin/FinancePage.tsx
// Nail Lab. by İldem — Functional Finance Management
import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { useFinanceStore } from '../../store/useFinanceStore';
import { formatPrice, formatDate, getToday, getMonthName, getStartOfMonth, getEndOfMonth } from '../../utils/formatters';
import { getStudioWallCalendarParts } from '../../utils/studioTime';
import { validateAmount } from '../../utils/validators';
import type { IncomeCategory, ExpenseCategory } from '../../types';

const INCOME_CATEGORIES: { value: IncomeCategory; label: string }[] = [
  { value: 'randevu', label: 'Randevu' },
  { value: 'bahsis', label: 'Bahşiş' },
  { value: 'urun_satisi', label: 'Ürün Satışı' },
];

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'malzeme', label: 'Malzeme' },
  { value: 'kira', label: 'Kira' },
  { value: 'fatura', label: 'Fatura' },
  { value: 'diger', label: 'Diğer' },
];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function FinancePage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const getMonthSummary = useFinanceStore((s) => s.getMonthSummary);

  const today = getToday();
  const studioNow = getStudioWallCalendarParts();
  const currentMonth = studioNow.month0;
  const currentYear = studioNow.year;

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateStart, setDateStart] = useState(getStartOfMonth(today));
  const [dateEnd, setDateEnd] = useState(getEndOfMonth(today));
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('randevu');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(today);
  const [formError, setFormError] = useState('');

  const periodSummary = useMemo(() => {
    const periodTxs = transactions.filter((t) => t.date >= dateStart && t.date <= dateEnd);
    const totalIncome = periodTxs.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = periodTxs.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense
    };
  }, [transactions, dateStart, dateEnd]);

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((t) => t.date >= dateStart && t.date <= dateEnd);
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filterType, dateStart, dateEnd]);

  const parentRef = useRef<HTMLDivElement>(null);
  // TanStack Virtual currently triggers react-compiler compatibility warning in eslint.
  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filteredTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { label: string; amount: number; type: string }> = {};
    filteredTransactions.forEach((t) => {
      const key = `${t.type}_${t.category}`;
      if (!breakdown[key]) {
        breakdown[key] = { label: t.category, amount: 0, type: t.type };
      }
      breakdown[key].amount += t.amount;
    });
    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const handleAddTransaction = async () => {
    const amount = parseFloat(newAmount);
    const result = validateAmount(amount);
    if (!result.isValid) { setFormError(result.message); return; }
    if (!newDescription.trim()) { setFormError('Açıklama zorunludur.'); return; }

    try {
      await addTransaction({
        type: newType,
        amount,
        category: newCategory,
        description: newDescription.trim(),
        date: newDate,
      });
      setNewAmount('');
      setNewDescription('');
      setShowAddModal(false);
      setFormError('');
    } catch (e) {
      console.error(e);
      setFormError('Kayıt eklenemedi.');
    }
  };

  const maxBarValue = Math.max(periodSummary.totalIncome, periodSummary.totalExpense, 1);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="admin-content">
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="section-label">Finans Yönetimi</span>
          <h1 className="display-2 font-display">Gelir-Gider Takibi</h1>
        </div>
        <Button variant="editorial" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Yeni İşlem</Button>
      </header>

      {/* Summary Metro */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div className="metric-card">
          <span className="section-label" style={{ fontSize: '0.6rem' }}>Dönem Geliri</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatPrice(periodSummary.totalIncome)}</div>
          <TrendingUp size={16} color="var(--color-success)" style={{ position: 'absolute', right: 16, bottom: 16 }} />
        </div>
        <div className="metric-card">
          <span className="section-label" style={{ fontSize: '0.6rem' }}>Dönem Gideri</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>{formatPrice(periodSummary.totalExpense)}</div>
          <TrendingDown size={16} color="var(--color-danger)" style={{ position: 'absolute', right: 16, bottom: 16 }} />
        </div>
        <div className="metric-card">
          <span className="section-label" style={{ fontSize: '0.6rem' }}>Net Kar</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: periodSummary.netProfit >= 0 ? 'var(--color-accent)' : 'var(--color-danger)' }}>
            {formatPrice(periodSummary.netProfit)}
          </div>
          <DollarSign size={16} color="var(--color-accent)" style={{ position: 'absolute', right: 16, bottom: 16 }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '32px' }}>
        <div>
          {/* Filters & Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
              {(['all', 'income', 'expense'] as const).map(type => (
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
                  {type === 'all' ? 'Tümü' : type === 'income' ? 'Gelir' : 'Gider'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
               <Calendar size={14} color="var(--color-text-muted)" />
               <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '0.8rem' }} />
               <span style={{ opacity: 0.3 }}>—</span>
               <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '0.8rem' }} />
            </div>
          </div>

          <div ref={parentRef} className="card" style={{ height: '500px', overflowY: 'auto', padding: 0 }}>
             <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map(vr => {
                  const t = filteredTransactions[vr.index];
                  return (
                    <div key={t.id} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: vr.size, transform: `translateY(${vr.start}px)`, borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                           <div style={{ width: '4px', height: '24px', background: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }} />
                           <div>
                              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.description}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{formatDate(t.date)} · {t.category}</div>
                           </div>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                           <span style={{ fontWeight: 700, color: t.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                              {t.type === 'income' ? '+' : '-'}{formatPrice(t.amount)}
                           </span>
                           <button onClick={() => setDeleteTarget(t.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                        </div>
                    </div>
                  );
                })}
             </div>
             {filteredTransactions.length === 0 && (
                <EmptyState icon={<DollarSign size={40} />} title="Kayıt Bulunmuyor" description="Seçili aralıkta finansal kayıt bulunamadı." />
             )}
          </div>
        </div>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <span className="section-label" style={{ marginBottom: '16px' }}>Kategori Dağılımı</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {categoryBreakdown.map((item, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ textTransform: 'capitalize' }}>{item.label}</span>
                    <span style={{ fontWeight: 700 }}>{formatPrice(item.amount)}</span>
                  </div>
                  <div style={{ height: '4px', background: 'var(--color-border)', width: '100%' }}>
                     <div style={{ height: '100%', width: `${(item.amount / maxBarValue) * 100}%`, background: item.type === 'income' ? 'var(--color-success)' : 'var(--color-danger)', opacity: 0.6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' }}>
            <span className="section-label">Aylık Analiz</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Seçili dönem içerisinde gelirlerin giderlere oranı %{Math.round((periodSummary.totalIncome / (periodSummary.totalExpense || 1)) * 100)}.
            </p>
          </div>
        </aside>
      </div>

      {/* Modalları DashboardPage'deki gibi standart Modal ve ConfirmDialog ile kullanıyoruz */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Yeni İşlem Ekle">
         <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', border: '1px solid var(--color-border)', borderRadius: '2px' }}>
               {(['income', 'expense'] as const).map(type => (
                 <button key={type} onClick={() => { setNewType(type); setNewCategory(type === 'income' ? 'randevu' : 'malzeme'); }} style={{ flex: 1, padding: '12px', background: newType === type ? 'var(--color-surface-2)' : 'transparent', color: newType === type ? 'var(--color-accent)' : 'var(--color-text-muted)', border: 'none', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem' }}>{type === 'income' ? 'Gelir' : 'Gider'}</button>
               ))}
            </div>
            <Input label="Tutar (₺)" type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '2px' }}>
               {(newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                 <option key={cat.value} value={cat.value}>{cat.label}</option>
               ))}
            </select>
            <Input label="Açıklama" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
            <Input label="Tarih" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
            {formError && <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>{formError}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
               <Button variant="ghost" onClick={() => setShowAddModal(false)}>İptal</Button>
               <Button variant="editorial" onClick={handleAddTransaction}>Ekle</Button>
            </div>
         </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) void deleteTransaction(deleteTarget).catch((e) => { console.error(e); alert('İşlem silinemedi.'); }); setDeleteTarget(null); }} title="İşlemi Sil" message="Bu işlemi silmek istediğinizden emin misiniz?" confirmLabel="Sil" variant="danger" />
    </motion.div>
  );
}
