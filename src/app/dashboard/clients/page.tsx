'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Client {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  notes: string;
  source: string;
  created_at: string;
}

const clientTypes = ['Частное лицо', 'Дизайнер', 'Строительная компания', 'Архитектор', 'Другое'];
const sources = ['Сайт', 'Звонок', 'Рекомендация', 'Выставка', 'Соцсети', 'Другое'];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Client | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({ name: '', company: '', phone: '', email: '', address: '', type: 'Частное лицо', notes: '', source: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) setClients(data);
    setLoading(false);
  };

  const saveClient = async () => {
    if (!form.name) return;
    if (editing) {
      await supabase.from('clients').update(form).eq('id', editing.id);
    } else {
      await supabase.from('clients').insert([form]);
    }
    setEditing(null);
    setShowNew(false);
    setForm({ name: '', company: '', phone: '', email: '', address: '', type: 'Частное лицо', notes: '', source: '' });
    loadClients();
  };

  const deleteClient = async (id: number) => {
    if (!confirm('Удалить клиента?')) return;
    await supabase.from('clients').delete().eq('id', id);
    loadClients();
  };

  const startEdit = (client: Client) => {
    setEditing(client);
    setForm(client);
    setShowNew(true);
  };

  const startNew = () => {
    setEditing(null);
    setForm({ name: '', company: '', phone: '', email: '', address: '', type: 'Частное лицо', notes: '', source: '' });
    setShowNew(true);
  };

  const filtered = clients.filter(c => {
    const s = search.toLowerCase();
    return !s || c.name?.toLowerCase().includes(s) || c.company?.toLowerCase().includes(s) || c.phone?.includes(s) || c.email?.toLowerCase().includes(s);
  });

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Клиенты</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{clients.length} клиентов</p>
        </div>
        <button onClick={startNew} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all">+ Новый клиент</button>
      </div>

      <input className="w-full px-4 py-3 bg-[#0F0B05] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-4 focus:outline-none focus:border-[#E86C2F]/50" placeholder="Поиск по имени, компании, телефону..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowNew(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{editing ? 'Редактировать' : 'Новый клиент'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Имя *</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Компания</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Телефон</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Email</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-[#C4A882]/70 block mb-1">Адрес</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Тип</label><select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })}>{clientTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Источник</label><select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.source || ''} onChange={(e) => setForm({ ...form, source: e.target.value })}>{sources.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div className="col-span-2"><label className="text-xs text-[#C4A882]/70 block mb-1">Заметки</label><textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" rows={3} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveClient} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Сохранить</button>
              <button onClick={() => setShowNew(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.length === 0 ? <p className="text-[#C4A882]/40 text-center py-8">Нет клиентов</p> : filtered.map(c => (
          <div key={c.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between hover:border-[#C4A882]/20 transition-all">
            <div className="flex-1 cursor-pointer" onClick={() => startEdit(c)}>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[#F5F0E8] font-medium">{c.name}</p>
                {c.company && <p className="text-[#C4A882]/50 text-xs">{c.company}</p>}
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E86C2F]/10 text-[#E86C2F]">{c.type}</span>
              </div>
              <p className="text-[#C4A882]/60 text-xs">{c.phone} {c.email ? '| ' + c.email : ''} {c.address ? '| ' + c.address : ''}</p>
              {c.notes && <p className="text-[#C4A882]/40 text-xs mt-1 truncate">{c.notes}</p>}
            </div>
            <button onClick={() => deleteClient(c.id)} className="text-red-400/30 hover:text-red-400 text-sm ml-3">X</button>
          </div>
        ))}
      </div>
    </div>
  );
}
