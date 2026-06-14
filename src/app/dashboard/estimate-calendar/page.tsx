'use client';

import { useState } from 'react';

interface CalendarEvent {
  id: number;
  clientName: string;
  address: string;
  phone: string;
  stoneType: string;
  date: string;
  time: string;
  notes: string;
  status: 'Запланирован' | 'Выполнен' | 'Отменён' | 'Перенесён';
}

export default function EstimateCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_calendar');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form, setForm] = useState<Partial<CalendarEvent>>({
    clientName: '', address: '', phone: '', stoneType: 'Мрамор',
    date: '', time: '', notes: '', status: 'Запланирован'
  });

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('petra_calendar', JSON.stringify(newEvents));
  };

  const addEvent = () => {
    if (!form.clientName || !form.date) return;
    const newEvent: CalendarEvent = {
      id: Date.now(),
      clientName: form.clientName || '',
      address: form.address || '',
      phone: form.phone || '',
      stoneType: form.stoneType || 'Мрамор',
      date: form.date || '',
      time: form.time || '',
      notes: form.notes || '',
      status: 'Запланирован',
    };
    saveEvents([...events, newEvent]);
    setForm({ clientName: '', address: '', phone: '', stoneType: 'Мрамор', date: '', time: '', notes: '', status: 'Запланирован' });
    setShowForm(false);
  };

  const changeStatus = (id: number, status: CalendarEvent['status']) => {
    saveEvents(events.map((e) => (e.id === id ? { ...e, status } : e)));
  };

  const deleteEvent = (id: number) => {
    saveEvents(events.filter((e) => e.id !== id));
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  const statusColors: Record<string, string> = {
    'Запланирован': 'bg-blue-500/10 text-blue-400',
    'Выполнен': 'bg-green-500/10 text-green-400',
    'Отменён': 'bg-red-500/10 text-red-400',
    'Перенесён': 'bg-yellow-500/10 text-yellow-400',
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Календарь смет</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Замеры и встречи</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-[#E86C2F] hover:bg-[#E86C2F]/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-[#E86C2F]/10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          + Новая встреча
        </button>
      </div>

      {/* Модалка */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-4 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Новая встреча</h2>
            <div className="space-y-3">
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Имя клиента *" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Телефон" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Адрес" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <input type="date" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <input type="time" className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={form.stoneType} onChange={(e) => setForm({ ...form, stoneType: e.target.value })}>
                {['Мрамор', 'Травертин', 'Известняк', 'Оникс', 'Гранит'].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Заметки" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addEvent} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Добавить</button>
              <button onClick={() => setShowForm(false)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Календарь */}
      <div className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="text-[#C4A882] hover:text-[#F5F0E8]">←</button>
          <h2 className="text-lg text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{monthName}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="text-[#C4A882] hover:text-[#F5F0E8]">→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-[#C4A882]/60 mb-2">
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            return (
              <div key={day} className={`min-h-[60px] p-1 rounded text-xs border border-transparent hover:border-[#C4A882]/10 ${dayEvents.length > 0 ? 'bg-[#E86C2F]/5' : ''}`}>
                <span className="text-[#C4A882]/70">{day}</span>
                {dayEvents.map((ev) => (
                  <div key={ev.id} className="mt-0.5 bg-[#E86C2F]/20 text-[#E86C2F] rounded px-1 py-0.5 truncate text-[10px]" title={`${ev.clientName} - ${ev.time}`}>
                    {ev.time} {ev.clientName}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Список встреч */}
      <h2 className="text-xl text-[#F5F0E8] font-display mb-3" style={{ fontFamily: 'DM Serif Display, serif' }}>Все встречи</h2>
      {events.length === 0 ? (
        <p className="text-[#C4A882]/40 text-center py-8">Нет запланированных встреч</p>
      ) : (
        <div className="space-y-2">
          {events.sort((a, b) => a.date.localeCompare(b.date)).map((ev) => (
            <div key={ev.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[#F5F0E8] font-medium">{ev.clientName}</p>
                <p className="text-[#C4A882]/60 text-xs">{ev.date} {ev.time} • {ev.address} • {ev.stoneType}</p>
                {ev.notes && <p className="text-[#C4A882]/40 text-xs mt-1">{ev.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={ev.status}
                  onChange={(e) => changeStatus(ev.id, e.target.value as CalendarEvent['status'])}
                  className={`text-xs px-2 py-1 rounded-lg ${statusColors[ev.status]}`}
                >
                  {['Запланирован', 'Выполнен', 'Отменён', 'Перенесён'].map((s) => (
                    <option key={s} value={s} className="bg-[#1A1208]">{s}</option>
                  ))}
                </select>
                <button onClick={() => deleteEvent(ev.id)} className="text-red-400/30 hover:text-red-400 text-sm">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}