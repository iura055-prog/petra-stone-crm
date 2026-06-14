'use client';

import { useState } from 'react';

interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  stoneType: string;
  status: string;
  address: string;
  meetingTime: string;
  createdAt: string;
}

const projectTypes = ['Столешница', 'Ступени', 'Камин', 'Ванная', 'Подоконник', 'Колонна', 'Другое'];
const stoneTypes = ['Мрамор', 'Травертин', 'Известняк', 'Оникс', 'Гранит'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_leads');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [showMeeting, setShowMeeting] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', projectType: 'Столешница', stoneType: 'Мрамор'
  });
  const [meetingForm, setMeetingForm] = useState({ address: '', meetingTime: '' });

  const saveLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem('petra_leads', JSON.stringify(newLeads));
  };

  const addLead = () => {
    if (!form.name || !form.phone) return;
    const newLead: Lead = {
      id: Date.now(),
      ...form,
      status: 'Новый',
      address: '',
      meetingTime: '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    saveLeads([newLead, ...leads]);
    setForm({ name: '', phone: '', email: '', projectType: 'Столешница', stoneType: 'Мрамор' });
    setShowForm(false);
  };

  const addMeeting = () => {
    if (!showMeeting || !meetingForm.address || !meetingForm.meetingTime) return;
    const updated = leads.map((l) =>
      l.id === showMeeting.id
        ? { ...l, address: meetingForm.address, meetingTime: meetingForm.meetingTime, status: 'Замер назначен' }
        : l
    );
    saveLeads(updated);
    setShowMeeting(null);
    setMeetingForm({ address: '', meetingTime: '' });
  };

  const deleteLead = (id: number) => {
    saveLeads(leads.filter((l) => l.id !== id));
  };

  const statusColors: Record<string, string> = {
    'Новый': 'bg-blue-500/10 text-blue-400',
    'Замер назначен': 'bg-[#E86C2F]/10 text-[#E86C2F]',
    'В работе': 'bg-yellow-500/10 text-yellow-400',
    'Смета отправлена': 'bg-green-500/10 text-green-400',
    'Закрыт': 'bg-gray-500/10 text-gray-400',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Leads</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {leads.length} лидов
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#E86C2F] hover:bg-[#E86C2F]/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-[#E86C2F]/10"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          + Новый лид
        </button>
      </div>

      {/* Модалка: новый лид */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новый лид</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm placeholder-[#C4A882]/30" placeholder="Имя *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm placeholder-[#C4A882]/30" placeholder="Телефон *" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm placeholder-[#C4A882]/30" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>
                {projectTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stoneType} onChange={(e) => setForm({ ...form, stoneType: e.target.value })}>
                {stoneTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addLead} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm font-medium">Добавить</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: замер */}
      {showMeeting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowMeeting(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Назначить замер</h2>
            <p className="text-[#C4A882]/70 text-sm mb-3">{showMeeting.name}</p>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Адрес *" value={meetingForm.address} onChange={(e) => setMeetingForm({ ...meetingForm, address: e.target.value })} />
              <input type="datetime-local" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={meetingForm.meetingTime} onChange={(e) => setMeetingForm({ ...meetingForm, meetingTime: e.target.value })} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addMeeting} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm font-medium">Назначить</button>
              <button onClick={() => setShowMeeting(null)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Список */}
      {leads.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[#C4A882]/40 text-lg">Нет лидов</p>
          <p className="text-[#C4A882]/30 text-sm mt-1">Нажмите «+ Новый лид» чтобы добавить</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 hover:border-[#C4A882]/20 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-[#F5F0E8] font-medium">{lead.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[lead.status] || 'bg-gray-500/10 text-gray-400'}`}>
                      {lead.status}
                    </span>
                  </div>
                  <p className="text-[#C4A882]/60 text-xs">
                    {lead.phone} {lead.email ? `• ${lead.email}` : ''} • {lead.projectType} • {lead.stoneType}
                  </p>
                  {lead.meetingTime && (
                    <p className="text-[#E86C2F]/70 text-xs mt-1">
                      Замер: {new Date(lead.meetingTime).toLocaleString('ru-RU')} • {lead.address}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {lead.status === 'Новый' && (
                    <button
                      onClick={() => { setShowMeeting(lead); setMeetingForm({ address: '', meetingTime: '' }); }}
                      className="text-xs bg-[#E86C2F]/10 text-[#E86C2F] px-3 py-1.5 rounded-lg hover:bg-[#E86C2F]/20 transition-all"
                    >
                      Назначить замер
                    </button>
                  )}
                  <button
                    onClick={() => deleteLead(lead.id)}
                    className="text-red-400/30 hover:text-red-400 text-sm transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}