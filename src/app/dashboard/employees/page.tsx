'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Employee {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  department: string;
  notes: string;
}

const departments = ['Офис', 'Производство', 'Монтаж', 'Дизайн', 'Продажи', 'Руководство'];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', position: '', phone: '', email: '', department: '', notes: '' });
  const [search, setSearch] = useState('');

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (data) setEmployees(data);
    setLoading(false);
  };

  const saveEmployee = async () => {
    if (!form.name) return;
    if (editing) {
      await supabase.from('employees').update(form).eq('id', editing.id);
    } else {
      await supabase.from('employees').insert([form]);
    }
    setEditing(null); setShowForm(false);
    setForm({ name: '', position: '', phone: '', email: '', department: '', notes: '' });
    loadEmployees();
  };

  const deleteEmployee = async (id: number) => {
    if (!confirm('Удалить сотрудника?')) return;
    await supabase.from('employees').delete().eq('id', id);
    loadEmployees();
  };

  const startEdit = (e: Employee) => { setEditing(e); setForm({ name: e.name, position: e.position || '', phone: e.phone || '', email: e.email || '', department: e.department || '', notes: e.notes || '' }); setShowForm(true); };
  const startNew = () => { setEditing(null); setForm({ name: '', position: '', phone: '', email: '', department: '', notes: '' }); setShowForm(true); };

  const filtered = employees.filter(e => {
    const q = search.toLowerCase();
    return !q || e.name?.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q) || e.department?.toLowerCase().includes(q);
  });

  const deptColors: Record<string, string> = {
    'Офис': 'bg-blue-500/10 text-blue-400',
    'Производство': 'bg-yellow-500/10 text-yellow-400',
    'Монтаж': 'bg-orange-500/10 text-orange-400',
    'Дизайн': 'bg-purple-500/10 text-purple-400',
    'Продажи': 'bg-green-500/10 text-green-400',
    'Руководство': 'bg-[#E86C2F]/10 text-[#E86C2F]',
  };

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Сотрудники</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{employees.length} сотрудников</p>
        </div>
        <button onClick={startNew} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all">+ Добавить</button>
      </div>

      <input className="w-full px-4 py-3 bg-[#0F0B05] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-4 focus:outline-none focus:border-[#E86C2F]/50" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{editing ? 'Редактировать' : 'Новый сотрудник'}</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Имя *</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Должность</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Телефон</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Email</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Отдел</label><select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>{['', ...departments].map(d => <option key={d} value={d}>{d || ''}</option>)}</select></div>
              <div><label className="text-xs text-[#C4A882]/70 block mb-1">Заметки</label><textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveEmployee} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">{editing ? 'Сохранить' : 'Добавить'}</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(e => (
          <div key={e.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between hover:border-[#C4A882]/20 transition-all">
            <div className="flex-1 cursor-pointer" onClick={() => startEdit(e)}>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-[#F5F0E8] font-medium">{e.name}</p>
                {e.department && <span className={`text-xs px-2 py-0.5 rounded-full ${deptColors[e.department] || ''}`}>{e.department}</span>}
                {e.position && <p className="text-[#C4A882]/50 text-xs">{e.position}</p>}
              </div>
              <p className="text-[#C4A882]/60 text-xs">{e.phone} {e.email ? '| ' + e.email : ''}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(e)} className="text-xs text-[#C4A882]/50 hover:text-[#F5F0E8] px-2">Ред.</button>
              <button onClick={() => deleteEmployee(e.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
