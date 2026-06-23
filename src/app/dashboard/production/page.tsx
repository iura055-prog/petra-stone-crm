'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProductionContact {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  notes: string;
}

export default function ProductionPage() {
  const [contacts, setContacts] = useState<ProductionContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProductionContact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', position: '', phone: '', email: '', notes: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    const { data } = await supabase.from('production').select('*').order('created_at', { ascending: false });
    if (data) setContacts(data as any);
    setLoading(false);
  };

  const saveContact = async () => {
    if (!form.name) return;
    if (editing) {
      await supabase.from('production').update(form).eq('id', editing.id);
    } else {
      await supabase.from('production').insert([form]);
    }
    setEditing(null); setShowForm(false);
    setForm({ name: '', position: '', phone: '', email: '', notes: '' });
    loadContacts();
  };

  const deleteContact = async (id: number) => {
    if (!confirm('Удалить контакт?')) return;
    await supabase.from('production').delete().eq('id', id);
    loadContacts();
  };

  const startEdit = (c: ProductionContact) => { setEditing(c); setForm({ name: c.name, position: c.position || '', phone: c.phone || '', email: c.email || '', notes: c.notes || '' }); setShowForm(true); };
  const startNew = () => { setEditing(null); setForm({ name: '', position: '', phone: '', email: '', notes: '' }); setShowForm(true); };

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Производство</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{contacts.length} контактов</p>
        </div>
        <button onClick={startNew} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all">+ Добавить контакт</button>
      </div>

      <input className="w-full px-4 py-3 bg-[#0F0B05] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-4 focus:outline-none focus:border-[#E86C2F]/50" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{editing ? 'Редактировать' : 'Новый контакт'}</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Имя *</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Должность</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Телефон</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Email</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Заметки</label><textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveContact} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">{editing ? 'Сохранить' : 'Добавить'}</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(c => (
          <div key={c.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between hover:border-[#C4A882]/20 transition-all">
            <div className="flex-1 cursor-pointer" onClick={() => startEdit(c)}>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[#F5F0E8] font-medium">{c.name}</p>
                {c.position && <p className="text-[#C4A882]/50 text-xs">{c.position}</p>}
              </div>
              <p className="text-[#C4A882]/60 text-xs">{c.phone} {c.email ? '| ' + c.email : ''}</p>
              {c.notes && <p className="text-[#C4A882]/40 text-xs mt-1">{c.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(c)} className="text-xs text-[#C4A882]/50 hover:text-[#F5F0E8] px-2">Ред.</button>
              <button onClick={() => deleteContact(c.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
