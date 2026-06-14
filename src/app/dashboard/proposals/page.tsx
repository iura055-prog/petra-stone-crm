'use client';

import { useState } from 'react';

interface Proposal {
  id: number;
  clientName: string;
  estimateId: number;
  stoneType: string;
  totalCost: number;
  status: 'Черновик' | 'Готово' | 'Отправлено';
  discount: number;
  date: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_proposals');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [editing, setEditing] = useState<Proposal | null>(null);

  const saveProposals = (p: Proposal[]) => {
    setProposals(p);
    localStorage.setItem('petra_proposals', JSON.stringify(p));
  };

  const generateProposal = () => {
    const estimates = JSON.parse(localStorage.getItem('petra_estimates') || '[]');
    const ready = estimates.filter((e: any) => e.status === 'Готово к отправке');
    if (ready.length === 0) return;
    const est = ready[0];
    const newProp: Proposal = {
      id: Date.now(),
      clientName: est.clientName,
      estimateId: est.id,
      stoneType: est.stoneType,
      totalCost: est.totalCost,
      status: 'Черновик',
      discount: 0,
      date: new Date().toISOString().split('T')[0],
    };
    saveProposals([newProp, ...proposals]);
  };

  const deleteProposal = (id: number) => saveProposals(proposals.filter((p) => p.id !== id));
  const changeStatus = (id: number, status: Proposal['status']) => saveProposals(proposals.map((p) => p.id === id ? { ...p, status } : p));

  const statusColors: Record<string, string> = {
    'Черновик': 'bg-gray-500/10 text-gray-400',
    'Готово': 'bg-[#E86C2F]/10 text-[#E86C2F]',
    'Отправлено': 'bg-green-500/10 text-green-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Коммерческие предложения</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{proposals.length} КП</p>
        </div>
        <button onClick={generateProposal} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all shadow-lg shadow-[#E86C2F]/10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          + Создать КП
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setEditing(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Редактировать КП</h2>
            <p className="text-[#C4A882]/70 mb-3">{editing.clientName} • {editing.stoneType}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#C4A882]/70">Стоимость</label>
                <input type="number" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={editing.totalCost} onChange={(e) => setEditing({ ...editing, totalCost: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs text-[#C4A882]/70">Скидка %</label>
                <input type="number" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) })} />
              </div>
            </div>
            <button onClick={() => { saveProposals(proposals.map((p) => p.id === editing.id ? editing : p)); setEditing(null); }} className="w-full mt-4 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Сохранить</button>
          </div>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="text-center py-16"><p className="text-[#C4A882]/40">Нет коммерческих предложений. Создайте КП из готовой сметы.</p></div>
      ) : (
        <div className="space-y-2">
          {proposals.map((p) => (
            <div key={p.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between hover:border-[#C4A882]/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[#F5F0E8] font-medium">{p.clientName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{p.status}</span>
                </div>
                <p className="text-[#C4A882]/60 text-xs">{p.date} • {p.stoneType} • {p.totalCost.toLocaleString()} ₽ {p.discount > 0 && `(скидка ${p.discount}%)`}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(p)} className="text-xs text-[#C4A882] hover:text-[#F5F0E8] px-2 py-1">Ред.</button>
                <select value={p.status} onChange={(e) => changeStatus(p.id, e.target.value as Proposal['status'])} className={`text-xs px-2 py-1 rounded-lg ${statusColors[p.status]}`}>
                  {['Черновик', 'Готово', 'Отправлено'].map((s) => <option key={s} value={s} className="bg-[#1A1208]">{s}</option>)}
                </select>
                <button onClick={() => deleteProposal(p.id)} className="text-red-400/30 hover:text-red-400 text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}