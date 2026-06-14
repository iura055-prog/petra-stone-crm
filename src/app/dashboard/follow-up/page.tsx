'use client';

import { useState } from 'react';

interface FollowUpItem {
  id: number;
  clientName: string;
  proposalId: number;
  totalCost: number;
  discount: number;
  status: string;
  daysSinceContact: number;
  notes: string;
  email: string;
}

export default function FollowUpPage() {
  const [items, setItems] = useState<FollowUpItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('petra_followup');
      if (saved) return JSON.parse(saved);
      return [];
    }
    return [];
  });

  const [selected, setSelected] = useState<FollowUpItem | null>(null);
  const [filter, setFilter] = useState('Все');
  const [sending, setSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  const saveItems = (newItems: FollowUpItem[]) => {
    setItems(newItems);
    localStorage.setItem('petra_followup', JSON.stringify(newItems));
  };

  const updateItem = (id: number, updates: Partial<FollowUpItem>) => {
    saveItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const sendEmail = async (item: FollowUpItem, template: string) => {
    setSending(true);
    setEmailStatus('');
    try {
      const subjects: Record<string, string> = {
        reminder: 'Напоминание о предложении | PETRA Stone',
        followup: 'Обновлённое предложение | PETRA Stone',
        contract: 'Договор на подпись | PETRA Stone',
      };
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: item.email || 'client@example.com',
          subject: subjects[template] || 'PETRA Stone',
          html: `<div style="font-family:sans-serif;color:#1A1208">
            <h2>PETRA Stone for home</h2>
            <p>Здравствуйте, ${item.clientName}!</p>
            <p>${template === 'reminder' ? 'Напоминаем о нашем предложении.' : template === 'contract' ? 'Направляем договор на подпись.' : 'У нас есть обновление по вашему проекту.'}</p>
            <p><strong>Стоимость:</strong> ${item.totalCost.toLocaleString()} ₽</p>
            ${item.discount > 0 ? `<p><strong>Скидка:</strong> ${item.discount}%</p>` : ''}
            <p>С уважением,<br>PETRA Stone for home<br>+7 (967) 084-50-06</p>
          </div>`,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setEmailStatus('Ошибка: ' + data.error);
      } else {
        setEmailStatus('Письмо отправлено!');
      }
    } catch (e) {
      setEmailStatus('Ошибка соединения');
    }
    setSending(false);
  };

  const filters = ['Все', 'Ожидание', 'Связались', 'Депозит получен', 'Архив'];
  const filtered = filter === 'Все' ? items : items.filter((i) => i.status === filter);

  const statusColors: Record<string, string> = {
    'Ожидание': 'bg-yellow-500/10 text-yellow-400',
    'Связались': 'bg-blue-500/10 text-blue-400',
    'Депозит получен': 'bg-green-500/10 text-green-400',
    'Архив': 'bg-gray-500/10 text-gray-400',
  };

  const needsAttention = items.filter((i) => i.daysSinceContact >= 3 && i.status === 'Ожидание').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Follow Up</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Автоматизация общения</p>
        </div>
      </div>

      {needsAttention > 0 && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-pulse">
          <p className="text-red-400 text-sm">Внимание: {needsAttention} предложений требуют внимания (нет ответа 3+ дня)</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 mb-6">
        {['Активные', 'Требуют внимания', 'Скоро истекают', 'Депозиты получены'].map((card, i) => (
          <div key={i} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4">
            <p className="text-2xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>
              {i === 0 ? items.filter((it) => it.status === 'Ожидание').length : i === 1 ? needsAttention : i === 2 ? items.filter((it) => it.daysSinceContact > 7).length : items.filter((it) => it.status === 'Депозит получен').length}
            </p>
            <p className="text-[#C4A882]/60 text-xs mt-1">{card}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs transition-all ${filter === f ? 'bg-[#E86C2F] text-white' : 'border border-[#C4A882]/20 text-[#C4A882]'}`}>{f}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-[#C4A882]/40 text-center py-8">Нет предложений</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex items-center justify-between hover:border-[#C4A882]/20 transition-all cursor-pointer" onClick={() => setSelected(item)}>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[#F5F0E8] font-medium">{item.clientName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[item.status]}`}>{item.status}</span>
                </div>
                <p className="text-[#C4A882]/60 text-xs">{item.totalCost.toLocaleString()} ₽ {item.discount > 0 ? 'Скидка ' + item.discount + '%' : ''}</p>
              </div>
              <div className="text-right"><p className={`text-xs ${item.daysSinceContact >= 3 ? 'text-red-400' : 'text-[#C4A882]/50'}`}>{item.daysSinceContact} дн.</p></div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-2 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{selected.clientName}</h2>
            <p className="text-[#C4A882]/60 text-sm mb-4">{selected.totalCost.toLocaleString()} ₽ - {selected.daysSinceContact} дней с контакта</p>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => sendEmail(selected, 'reminder')} disabled={sending} className="flex-1 bg-[#E86C2F] text-white py-2 rounded-lg text-sm">Напомнить</button>
                <button onClick={() => sendEmail(selected, 'followup')} disabled={sending} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2 rounded-lg text-sm">Follow-up</button>
              </div>
              <button onClick={() => sendEmail(selected, 'contract')} disabled={sending} className="w-full bg-green-500/10 text-green-400 py-2 rounded-lg text-sm border border-green-500/20">Отправить договор</button>
              {emailStatus && <p className={`text-xs ${emailStatus.includes('Ошибка') ? 'text-red-400' : 'text-green-400'}`}>{emailStatus}</p>}
              <textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" placeholder="Заметки..." value={selected.notes} onChange={(e) => { setSelected({ ...selected, notes: e.target.value }); updateItem(selected.id, { notes: e.target.value }); }} rows={3} />
              <select className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm" value={selected.status} onChange={(e) => { const s = e.target.value; setSelected({ ...selected, status: s }); updateItem(selected.id, { status: s }); }}>
                {['Ожидание', 'Связались', 'Депозит получен', 'Архив'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => setSelected(null)} className="w-full mt-4 border border-[#C4A882]/20 text-[#C4A882] py-2 rounded-lg text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
