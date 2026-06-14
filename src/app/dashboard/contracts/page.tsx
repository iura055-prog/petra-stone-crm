'use client';

import { useState } from 'react';

interface Contract {
  id: number;
  clientName: string;
  proposalId: number;
  totalCost: number;
  status: 'Ожидание' | 'Связались' | 'Ожидает подписи' | 'Депозит получен' | 'Закрыт';
  date: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_contracts');
      if (saved) return JSON.parse(saved);
      const items = JSON.parse(localStorage.getItem('petra_followup') || '[]');
      const ctr = items.filter((i: any) => i.status === 'Связались').map((i: any) => ({
        id: Date.now() + Math.random(),
        clientName: i.clientName,
        proposalId: i.proposalId,
        totalCost: i.totalCost,
        status: 'Ожидание',
        date: new Date().toISOString().split('T')[0],
      }));
      localStorage.setItem('petra_contracts', JSON.stringify(ctr));
      return ctr;
    }
    return [];
  });

  const saveContracts = (c: Contract[]) => {
    setContracts(c);
    localStorage.setItem('petra_contracts', JSON.stringify(c));
  };

  const changeStatus = (id: number, status: Contract['status']) => {
    saveContracts(contracts.map((c) => c.id === id ? { ...c, status } : c));
  };

  const deleteContract = (id: number) => saveContracts(contracts.filter((c) => c.id !== id));

  const statusColors: Record<string, string> = {
    'Ожидание': 'bg-yellow-500/10 text-yellow-400',
    'Связались': 'bg-blue-500/10 text-blue-400',
    'Ожидает подписи': 'bg-[#E86C2F]/10 text-[#E86C2F]',
    'Депозит получен': 'bg-green-500/10 text-green-400',
    'Закрыт': 'bg-gray-500/10 text-gray-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Контракты</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{contracts.length} контрактов</p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-16"><p className="text-[#C4A882]/40">Нет контрактов</p></div>
      ) : (
        <div className="space-y-2">
          {contracts.map((c) => (
            <div key={c.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between hover:border-[#C4A882]/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[#F5F0E8] font-medium">{c.clientName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                </div>
                <p className="text-[#C4A882]/60 text-xs">{c.date} • {c.totalCost.toLocaleString()} ₽</p>
              </div>
              <div className="flex items-center gap-2">
                {c.status === 'Ожидает подписи' && (
                  <button className="text-xs bg-[#E86C2F]/10 text-[#E86C2F] px-3 py-1.5 rounded-lg hover:bg-[#E86C2F]/20 transition-all" onClick={() => alert('Контракт отправлен (заглушка Gmail)')}>
                    Отправить контракт
                  </button>
                )}
                <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value as Contract['status'])} className={`text-xs px-2 py-1 rounded-lg ${statusColors[c.status]}`}>
                  {['Ожидание', 'Связались', 'Ожидает подписи', 'Депозит получен', 'Закрыт'].map((s) => <option key={s} value={s} className="bg-[#1A1208]">{s}</option>)}
                </select>
                <button onClick={() => deleteContract(c.id)} className="text-red-400/30 hover:text-red-400 text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}