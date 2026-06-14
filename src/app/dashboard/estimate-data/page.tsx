'use client';

import { useState } from 'react';

interface EstimateFile {
  id: number;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  stoneType: string;
  date: string;
  status: 'Черновик' | 'Готово к отправке' | 'Отправлено';
  totalCost: number;
  notes: string;
}

export default function EstimateDataPage() {
  const [estimates, setEstimates] = useState<EstimateFile[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_estimates');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<EstimateFile>>({
    clientName: '', phone: '', email: '', address: '', stoneType: 'Мрамор',
    totalCost: 0, notes: '', status: 'Черновик'
  });

  const saveEstimates = (newEst: EstimateFile[]) => {
    setEstimates(newEst);
    localStorage.setItem('petra_estimates', JSON.stringify(newEst));
  };

  const addEstimate = () => {
    if (!form.clientName) return;
    const newEst: EstimateFile = {
      id: Date.now(),
      clientName: form.clientName || '',
      phone: form.phone || '',
      email: form.email || '',
      address: form.address || '',
      stoneType: form.stoneType || 'Мрамор',
      date: new Date().toISOString().split('T')[0],
      status: 'Черновик',
      totalCost: form.totalCost || 0,
      notes: form.notes || '',
    };
    saveEstimates([newEst, ...estimates]);
    setForm({ clientName: '', phone: '', email: '', address: '', stoneType: 'Мрамор', totalCost: 0, notes: '', status: 'Черновик' });
    setShowForm(false);
  };

  const deleteEstimate = (id: number) => saveEstimates(estimates.filter((e) => e.id !== id));
  const changeStatus = (id: number, status: EstimateFile['status']) => saveEstimates(estimates.map((e) => e.id === id ? { ...e, status } : e));

  const statusColors: Record<string, string> = {
    'Черновик': 'bg-gray-500/10 text-gray-400',
    'Готово к отправке': 'bg-[#E86C2F]/10 text-[#E86C2F]',
    'Отправлено': 'bg-green-500/10 text-green-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>База смет</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{estimates.length} смет</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all shadow-lg shadow-[#E86C2F]/10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          + Новая смета
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новая смета</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Имя клиента *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Адрес" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input type="number" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Стоимость" value={form.totalCost || ''} onChange={(e) => setForm({ ...form, totalCost: Number(e.target.value) })} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stoneType} onChange={(e) => setForm({ ...form, stoneType: e.target.value })}>
                {['Мрамор', 'Травертин', 'Известняк', 'Оникс', 'Гранит'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Заметки" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addEstimate} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Добавить</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {estimates.length === 0 ? (
        <div className="text-center py-16"><p className="text-[#C4A882]/40">Нет смет</p></div>
      ) : (
        <div className="space-y-2">
          {estimates.map((est) => (
            <div key={est.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[#F5F0E8] font-medium">{est.clientName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[est.status]}`}>{est.status}</span>
                  </div>
                  <p className="text-[#C4A882]/60 text-xs">{est.date} • {est.stoneType} • {est.totalCost.toLocaleString()} ₽</p>
                  {est.notes && <p className="text-[#C4A882]/40 text-xs mt-1">{est.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <select value={est.status} onChange={(e) => changeStatus(est.id, e.target.value as EstimateFile['status'])} className={`text-xs px-2 py-1 rounded-lg ${statusColors[est.status]}`}>
                    {['Черновик', 'Готово к отправке', 'Отправлено'].map((s) => <option key={s} value={s} className="bg-[#1A1208]">{s}</option>)}
                  </select>
                  <button onClick={() => deleteEstimate(est.id)} className="text-red-400/30 hover:text-red-400 text-sm">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}