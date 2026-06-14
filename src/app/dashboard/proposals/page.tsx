'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Proposal {
  id: number;
  client_name: string;
  stone_type: string;
  total_cost: number;
  discount: number;
  status: string;
  created_at: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_name: '', stone_type: 'Мрамор', total_cost: 0, discount: 0 });

  useEffect(() => { loadProposals(); }, []);

  const loadProposals = async () => {
    const { data } = await supabase.from('proposals').select('*').order('created_at', { ascending: false });
    if (data) setProposals(data);
    setLoading(false);
  };

  const addProposal = async () => {
    if (!form.client_name) return;
    await supabase.from('proposals').insert([{ ...form, status: 'Черновик' }]);
    setForm({ client_name: '', stone_type: 'Мрамор', total_cost: 0, discount: 0 });
    setShowForm(false);
    loadProposals();
  };

  const deleteProposal = async (id: number) => { await supabase.from('proposals').delete().eq('id', id); loadProposals(); };
  const changeStatus = async (id: number, status: string) => { await supabase.from('proposals').update({ status }).eq('id', id); loadProposals(); };

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Коммерческие предложения</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm">+ Создать КП</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новое КП</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Имя клиента" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stone_type} onChange={(e) => setForm({ ...form, stone_type: e.target.value })}>
                {['Мрамор', 'Травертин', 'Известняк', 'Оникс', 'Гранит'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Стоимость" value={form.total_cost || ''} onChange={(e) => setForm({ ...form, total_cost: Number(e.target.value) })} />
              <input type="number" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Скидка %" value={form.discount || ''} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addProposal} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Создать</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {proposals.map((p) => (
          <div key={p.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#F5F0E8] font-medium">{p.client_name}</p>
              <p className="text-[#C4A882]/60 text-xs">{p.stone_type} - {p.total_cost?.toLocaleString()} руб.</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={p.status} onChange={(e) => changeStatus(p.id, e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-[#1A1208] text-[#C4A882] border border-[#C4A882]/20">
                {['Черновик', 'Готово', 'Отправлено'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={() => deleteProposal(p.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
