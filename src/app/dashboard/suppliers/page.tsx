'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Supplier {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  stone_types: string;
  website: string;
  notes: string;
}

interface Contact {
  id: number;
  supplier_id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  notes: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({ name: '', company: '', phone: '', email: '', stone_types: '', website: '', notes: '' });
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactForm, setContactForm] = useState({ name: '', position: '', phone: '', email: '', notes: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => { loadSuppliers(); }, []);

  const loadSuppliers = async () => {
    const { data } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    if (data) setSuppliers(data);
    setLoading(false);
  };

  const loadContacts = async (supplierId: number) => {
    const { data } = await supabase.from('supplier_contacts').select('*').eq('supplier_id', supplierId).order('created_at', { ascending: true });
    if (data) setContacts(data);
    setExpanded(supplierId);
  };

  const saveSupplier = async () => {
    if (!form.name) return;
    if (editing) { await supabase.from('suppliers').update(form).eq('id', editing.id); }
    else { await supabase.from('suppliers').insert([form]); }
    setEditing(null); setShowNew(false);
    setForm({ name: '', company: '', phone: '', email: '', stone_types: '', website: '', notes: '' });
    loadSuppliers();
  };

  const deleteSupplier = async (id: number) => {
    if (!confirm('Удалить поставщика?')) return;
    await supabase.from('suppliers').delete().eq('id', id);
    loadSuppliers();
  };

  const saveContact = async () => {
    if (!contactForm.name) return;
    if (editingContact) {
      await supabase.from('supplier_contacts').update(contactForm).eq('id', editingContact.id);
    } else if (expanded) {
      await supabase.from('supplier_contacts').insert([{ ...contactForm, supplier_id: expanded }]);
    }
    setContactForm({ name: '', position: '', phone: '', email: '', notes: '' });
    setShowContactForm(false);
    setEditingContact(null);
    if (expanded) loadContacts(expanded);
  };

  const startEditContact = (c: Contact) => {
    setEditingContact(c);
    setContactForm({ name: c.name, position: c.position || '', phone: c.phone || '', email: c.email || '', notes: c.notes || '' });
    setShowContactForm(true);
  };

  const deleteContact = async (id: number) => {
    await supabase.from('supplier_contacts').delete().eq('id', id);
    if (expanded) loadContacts(expanded);
  };

  const startEdit = (s: Supplier) => { setEditing(s); setForm(s); setShowNew(true); };
  const startNew = () => { setEditing(null); setForm({ name: '', company: '', phone: '', email: '', stone_types: '', website: '', notes: '' }); setShowNew(true); };
  const startNewContact = () => { setEditingContact(null); setContactForm({ name: '', position: '', phone: '', email: '', notes: '' }); setShowContactForm(true); };

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.company?.toLowerCase().includes(q) || s.stone_types?.toLowerCase().includes(q);
  });

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Поставщики</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{suppliers.length} поставщиков</p>
        </div>
        <button onClick={startNew} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all">+ Новый поставщик</button>
      </div>

      <input className="w-full px-4 py-3 bg-[#0F0B05] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-4 focus:outline-none focus:border-[#E86C2F]/50" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {showNew && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowNew(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{editing ? 'Редактировать' : 'Новый поставщик'}</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Имя *</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Компания</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.company || ''} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Телефон</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Email</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-[#C4A882]/70 block mb-1">Типы камня</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stone_types || ''} onChange={(e) => setForm({ ...form, stone_types: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-[#C4A882]/70 block mb-1">Сайт</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.website || ''} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
              <div className="col-span-2"><label className="text-xs text-[#C4A882]/70 block mb-1">Заметки</label><textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" rows={2} value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveSupplier} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Сохранить</button>
              <button onClick={() => setShowNew(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(s => (
          <div key={s.id}>
            <div className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 hover:border-[#C4A882]/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1 cursor-pointer" onClick={() => expanded === s.id ? setExpanded(null) : loadContacts(s.id)}>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[#F5F0E8] font-medium">{s.name}</p>
                    {s.company && <p className="text-[#C4A882]/50 text-xs">{s.company}</p>}
                    <span className="text-[#C4A882]/30 text-xs">{expanded === s.id ? '' : ''}</span>
                  </div>
                  <p className="text-[#C4A882]/60 text-xs">{s.stone_types}</p>
                  {s.email && <p className="text-[#C4A882]/40 text-xs">{s.email} {s.phone ? '| ' + s.phone : ''}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(s)} className="text-xs text-[#C4A882]/50 hover:text-[#F5F0E8] px-2">Ред.</button>
                  <button onClick={() => deleteSupplier(s.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
                </div>
              </div>

              {expanded === s.id && (
                <div className="mt-3 pt-3 border-t border-[#C4A882]/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#C4A882]/50">Контакты ({contacts.length})</p>
                    <button onClick={startNewContact} className="text-xs bg-[#E86C2F]/10 text-[#E86C2F] px-2 py-1 rounded-lg hover:bg-[#E86C2F]/20">+ Добавить</button>
                  </div>
                  {contacts.length === 0 ? (
                    <p className="text-[#C4A882]/30 text-xs">Нет контактов</p>
                  ) : (
                    <div className="space-y-2">
                      {contacts.map(c => (
                        <div key={c.id} className="bg-[#1A1208] rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <p className="text-[#F5F0E8] text-sm font-medium">{c.name}</p>
                            {c.position && <p className="text-[#C4A882]/50 text-xs">{c.position}</p>}
                            <p className="text-[#C4A882]/40 text-xs">{c.phone} {c.email ? '| ' + c.email : ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => startEditContact(c)} className="text-xs text-[#C4A882]/50 hover:text-[#F5F0E8]">Ред.</button>
                            <button onClick={() => deleteContact(c.id)} className="text-red-400/30 hover:text-red-400 text-xs">X</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showContactForm && (
                    <div className="mt-3 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg p-3">
                      <p className="text-xs text-[#C4A882]/50 mb-2">{editingContact ? 'Редактировать контакт' : 'Новый контакт'}</p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input className="px-2 py-1.5 bg-[#0F0B05] border border-[#C4A882]/20 rounded text-[#F5F0E8] text-xs" placeholder="Имя *" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                        <input className="px-2 py-1.5 bg-[#0F0B05] border border-[#C4A882]/20 rounded text-[#F5F0E8] text-xs" placeholder="Должность" value={contactForm.position} onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })} />
                        <input className="px-2 py-1.5 bg-[#0F0B05] border border-[#C4A882]/20 rounded text-[#F5F0E8] text-xs" placeholder="Телефон" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} />
                        <input className="px-2 py-1.5 bg-[#0F0B05] border border-[#C4A882]/20 rounded text-[#F5F0E8] text-xs" placeholder="Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveContact} className="flex-1 bg-[#E86C2F] text-white py-1.5 rounded text-xs">{editingContact ? 'Сохранить' : 'Добавить'}</button>
                        <button onClick={() => { setShowContactForm(false); setEditingContact(null); }} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-1.5 rounded text-xs">Отмена</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
