'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Event {
  id: number;
  client_name: string;
  address: string;
  phone: string;
  stone_type: string;
  event_date: string;
  event_time: string;
  notes: string;
  status: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_name: '', address: '', phone: '', stone_type: 'Мрамор', event_date: '', event_time: '', notes: '' });
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = async () => {
    const { data } = await supabase.from('calendar_events').select('*').order('event_date', { ascending: true });
    if (data) setEvents(data);
    setLoading(false);
  };

  const addEvent = async () => {
    if (!form.client_name || !form.event_date) return;
    await supabase.from('calendar_events').insert([{ ...form, status: 'Запланирован' }]);
    setForm({ client_name: '', address: '', phone: '', stone_type: 'Мрамор', event_date: '', event_time: '', notes: '' });
    setShowForm(false);
    loadEvents();
  };

  const deleteEvent = async (id: number) => {
    await supabase.from('calendar_events').delete().eq('id', id);
    loadEvents();
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  const getEventsForDate = (day: number) => {
    const d = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.event_date === d);
  };

  if (loading) return <p className="text-[#C4A882]/40 text-center py-16">Загрузка...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Календарь смет</h1>
        <button onClick={() => setShowForm(true)} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm">+ Встреча</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новая встреча</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Имя *" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Адрес" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input type="date" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
              <input type="time" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} />
              <textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Заметки" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addEvent} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Добавить</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="text-[#C4A882] hover:text-white">Prev</button>
          <h2 className="text-lg text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{monthName}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="text-[#C4A882] hover:text-white">Next</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#C4A882]/60 mb-2">
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={'e'+i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            return (
              <div key={day} className={`min-h-[60px] p-1 rounded text-xs ${dayEvents.length > 0 ? 'bg-[#E86C2F]/10' : ''}`}>
                <span className="text-[#C4A882]/70">{day}</span>
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="mt-0.5 bg-[#E86C2F]/20 text-[#E86C2F] rounded px-1 py-0.5 truncate text-[10px]">{ev.event_time} {ev.client_name}</div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {events.map((ev) => (
          <div key={ev.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[#F5F0E8] font-medium">{ev.client_name}</p>
              <p className="text-[#C4A882]/60 text-xs">{ev.event_date} {ev.event_time} - {ev.stone_type}</p>
            </div>
            <button onClick={() => deleteEvent(ev.id)} className="text-red-400/30 hover:text-red-400 text-sm">X</button>
          </div>
        ))}
      </div>
    </div>
  );
}
