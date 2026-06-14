'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Contract {
  id: number;
  client_name: string;
  total_cost: number;
  status: string;
  created_at: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadContracts(); }, []);

  const loadContracts = async () => {
    const { data } = await supabase.from('contracts').select('*').order('created_at', { ascending: false });
    if (data) setContracts(data);
    setLoading(false);
  };

  const changeStatus = async (id: number, status: string) => {
    await supabase.from('contracts').update({ status }).eq('id', id);
    loadContracts();
  };

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <h1 className="text-3xl text-[#F5F0E8] font-display mb-6" style={{ fontFamily: 'DM Serif Display, serif' }}>Контракты</h1>
      <div className="space-y-2">
        {contracts.length === 0 ? <p className="text-[#C4A882]/40 text-center py-8">Нет контрактов</p> : contracts.map((c) => (
          <div key={c.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#F5F0E8] font-medium">{c.client_name}</p>
              <p className="text-[#C4A882]/60 text-xs">{c.total_cost?.toLocaleString()} руб.</p>
            </div>
            <select value={c.status} onChange={(e) => changeStatus(c.id, e.target.value)} className="text-xs px-2 py-1 rounded-lg bg-[#1A1208] text-[#C4A882] border border-[#C4A882]/20">
              {['Ожидание', 'Связались', 'Ожидает подписи', 'Депозит получен', 'Закрыт'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
