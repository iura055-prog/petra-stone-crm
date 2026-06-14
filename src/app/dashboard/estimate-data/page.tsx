'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Estimate {
  id: number;
  client_name: string;
  phone: string;
  email: string;
  address: string;
  stone_type: string;
  total_cost: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function EstimateDataPage() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_name: '', phone: '', email: '', address: '', stone_type: 'Мрамор', total_cost: 0, notes: '' });

  useEffect(() => { loadEstimates(); }, []);

  const loadEstimates = async () => {
    const { data } = await supabase.from('estimates').select('*').order('created_at', { ascending: false });
    if (data) setEstimates(data);
    setLoading(false);
  };

  const addEstimate = async () => {
    if (!form.client_name) return;
    await supabase.from('estimates').insert([{ ...form, status: 'Черновик' }]);
    setForm({ client_name: '', phone: '', email: '', address: '', stone_type: 'Мрамор', total_cost: 0, notes: '' });
    setShowForm(false);
    loadEstimates();
  };

  const deleteEstimate = async (id: number) => {
    await supabase.from('estimates').delete().eq('id', id);
    loadEstimates();
  };

  const changeStatus = async (id: number, status: string) => {
    await supabase.from('estimates').update({ status }).eq('id', id);
    loadEstimates();
  };

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>База смет</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{estimates.length} смет</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all">+ Новая смета</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новая смета</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Имя *" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input type="number" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Стоимость" value={form.total_cost || ''} onChange={(e) => setForm({ ...form, total_cost: Number(e.target.value) })} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stone_type} onChange={(e) => setForm({ ...form, stone_type: e.target.value })}>
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

      <div className="space-y-2">
        {estimates.map((est) => (
          <div key={est.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#F5F0E8] font-medium">{est.client_name}</p>
              <p className="text-[#C4A882]/60 text-xs">{est.stone_type} - {est.total_cost?.toLocaleString()} руб.</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={est.status} onChange={(e) => changeStatus(est.id, e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-[#1A1208] text-[#C4A882] border border-[#C4A882]/20">
                {['Черновик', 'Готово к отправке', 'Отправлено'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => deleteEstimate(est.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
