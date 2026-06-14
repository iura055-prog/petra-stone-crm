'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  project_type: string;
  stone_type: string;
  status: string;
  address: string;
  meeting_time: string;
  created_at: string;
}

const projectTypes = ['Столешница', 'Ступени', 'Камин', 'Ванная', 'Подоконник', 'Колонна', 'Другое'];
const stoneTypes = ['Мрамор', 'Травертин', 'Известняк', 'Оникс', 'Гранит'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showMeeting, setShowMeeting] = useState<Lead | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', project_type: 'Столешница', stone_type: 'Мрамор' });
  const [meetingForm, setMeetingForm] = useState({ address: '', meeting_time: '' });

  useEffect(() => { loadLeads(); }, []);

  const loadLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
    setLoading(false);
  };

  const addLead = async () => {
    if (!form.name || !form.phone) return;
    await supabase.from('leads').insert([{ ...form, status: 'Новый' }]);
    setForm({ name: '', phone: '', email: '', project_type: 'Столешница', stone_type: 'Мрамор' });
    setShowForm(false);
    loadLeads();
  };

  const addMeeting = async () => {
    if (!showMeeting || !meetingForm.address || !meetingForm.meeting_time) return;
    await supabase.from('leads').update({ address: meetingForm.address, meeting_time: meetingForm.meeting_time, status: 'Замер назначен' }).eq('id', showMeeting.id);
    setShowMeeting(null);
    setMeetingForm({ address: '', meeting_time: '' });
    loadLeads();
  };

  const deleteLead = async (id: number) => {
    await supabase.from('leads').delete().eq('id', id);
    loadLeads();
  };

  const statusColors: Record<string, string> = {
    'Новый': 'bg-blue-500/10 text-blue-400',
    'Замер назначен': 'bg-[#E86C2F]/10 text-[#E86C2F]',
    'В работе': 'bg-yellow-500/10 text-yellow-400',
    'Закрыт': 'bg-gray-500/10 text-gray-400',
  };

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Leads</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{leads.length} лидов</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all">+ Новый лид</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новый лид</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Имя *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Телефон *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
                {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stone_type} onChange={(e) => setForm({ ...form, stone_type: e.target.value })}>
                {stoneTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addLead} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Добавить</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {showMeeting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowMeeting(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Назначить замер</h2>
            <p className="text-[#C4A882]/70 text-sm mb-3">{showMeeting.name}</p>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Адрес *" value={meetingForm.address} onChange={(e) => setMeetingForm({ ...meetingForm, address: e.target.value })} />
              <input type="datetime-local" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={meetingForm.meeting_time} onChange={(e) => setMeetingForm({ ...meetingForm, meeting_time: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addMeeting} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Назначить</button>
              <button onClick={() => setShowMeeting(null)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {leads.length === 0 ? (
        <p className="text-[#C4A882]/40 text-center py-16">Нет лидов</p>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[#F5F0E8] font-medium">{lead.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[lead.status] || ''}`}>{lead.status}</span>
                  </div>
                  <p className="text-[#C4A882]/60 text-xs">{lead.phone} {lead.email ? ' - ' + lead.email : ''} - {lead.project_type} - {lead.stone_type}</p>
                  {lead.meeting_time && <p className="text-[#E86C2F]/70 text-xs mt-1">Замер: {new Date(lead.meeting_time).toLocaleString('ru-RU')} - {lead.address}</p>}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {lead.status === 'Новый' && (
                    <button onClick={() => { setShowMeeting(lead); setMeetingForm({ address: '', meeting_time: '' }); }} className="text-xs bg-[#E86C2F]/10 text-[#E86C2F] px-3 py-1.5 rounded-lg">Замер</button>
                  )}
                  <button onClick={() => deleteLead(lead.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
