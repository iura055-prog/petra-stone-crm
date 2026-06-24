'use client';

import { useState } from 'react';

interface Email {
  id: string;
  to: string;
  subject: string;
  date: string;
  body: string;
}

export default function SentPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Email | null>(null);
  const [status, setStatus] = useState('');

  const loadSent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inbox/sent');
      const data = await res.json();
      if (data.emails) setEmails(data.emails);
      else setStatus('Ошибка: ' + (data.error || 'нет данных'));
    } catch (e) { setStatus('Ошибка соединения'); }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Отправленные</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{emails.length} писем</p>
        </div>
        <button onClick={loadSent} disabled={loading} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50">
          {loading ? 'Загрузка...' : 'Проверить'}
        </button>
      </div>
      {status && <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-400 text-sm">{status}</div>}
      <div className="space-y-2">
        {emails.length === 0 && !loading ? <p className="text-[#C4A882]/40 text-center py-8">Нажмите Проверить</p> : emails.map((email) => (
          <div key={email.id} className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 cursor-pointer hover:border-[#C4A882]/20 transition-all" onClick={() => setSelected(email)}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[#F5F0E8] text-sm font-medium">Кому: {email.to}</p>
              <p className="text-[#C4A882]/40 text-xs">{email.date}</p>
            </div>
            <p className="text-[#C4A882]/80 text-sm">{email.subject}</p>
            <p className="text-[#C4A882]/40 text-xs mt-1 truncate">{email.body?.slice(0, 150)}...</p>
          </div>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-2 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{selected.subject}</h2>
            <p className="text-[#C4A882]/60 text-sm mb-2">Кому: {selected.to} | {selected.date}</p>
            <div className="bg-[#1A1208] border border-[#C4A882]/10 rounded-lg p-3" dangerouslySetInnerHTML={{ __html: selected.body }} />
            <button onClick={() => setSelected(null)} className="w-full mt-4 border border-[#C4A882]/20 text-[#C4A882] py-2 rounded-lg text-sm">Закрыть</button>
          </div>
        </div>
      )}
    </div>
  );
}
