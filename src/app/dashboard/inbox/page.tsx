'use client';

import { useState } from 'react';

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  seen: boolean;
}

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Email | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(20);

  const loadEmails = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inbox?limit=' + limit);
      const data = await res.json();
      if (data.emails) setEmails(data.emails);
      else setStatus('Ошибка: ' + (data.error || 'нет данных'));
    } catch (e) { setStatus('Ошибка соединения'); }
    setLoading(false);
  };

  const loadMore = () => { setLimit(limit + 50); setTimeout(() => loadEmails(), 100); };

  const generateReply = async (email: Email) => {
    setSelected(email);
    setStatus('AI генерирует ответ...');
    try {
      const res = await fetch('/api/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: email.from, subject: email.subject, body: email.body }),
      });
      const data = await res.json();
      if (data.reply) { setEditedReply(data.reply); setStatus(''); }
      else setStatus('Ошибка AI: ' + (data.error || ''));
    } catch (e) { setStatus('Ошибка соединения'); }
  };

  const sendReply = async () => {
    setStatus('Отправка...');
    try {
      const recipient = selected ? (selected.from.includes('<') ? selected.from.split('<')[1].split('>')[0] : selected.from) : '';
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, subject: 'Re: ' + (selected?.subject || ''), html: editedReply.replace(/\n/g, '<br>') }),
      });
      const data = await res.json();
      if (data.success) { setStatus('Ответ отправлен!'); setSelected(null); }
      else setStatus('Ошибка отправки: ' + data.error);
    } catch (e) { setStatus('Ошибка соединения'); }
  };

  const unreadCount = emails.filter(e => !e.seen).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Входящие</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            hi@petra-design.ru - {emails.length} писем {unreadCount > 0 && '(непрочитано: ' + unreadCount + ')'}
          </p>
        </div>
        <button onClick={loadEmails} disabled={loading} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50">
          {loading ? 'Загрузка...' : 'Проверить почту'}
        </button>
      </div>
      {status && !selected && <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-400 text-sm">{status}</div>}
      <div className="space-y-2 mb-4">
        {emails.length === 0 && !loading ? <p className="text-[#C4A882]/40 text-center py-8">Нажмите Проверить почту</p> : emails.map((email) => (
          <div key={email.id}
            className={'rounded-xl p-4 cursor-pointer transition-all border ' + (!email.seen ? 'bg-[#E86C2F]/5 border-[#E86C2F]/20' : 'bg-[#0F0B05] border-[#C4A882]/10 hover:border-[#C4A882]/20')}
            onClick={() => generateReply(email)}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {!email.seen && <span className="w-2 h-2 rounded-full bg-[#E86C2F]"></span>}
                <p className={'text-sm ' + (!email.seen ? 'text-[#F5F0E8] font-semibold' : 'text-[#C4A882]')}>{email.from}</p>
              </div>
              <p className="text-[#C4A882]/40 text-xs">{email.date ? new Date(email.date).toLocaleString('ru-RU') : ''}</p>
            </div>
            <p className={'text-sm ' + (!email.seen ? 'text-[#F5F0E8] font-semibold' : 'text-[#C4A882]/80')}>{email.subject}</p>
            <p className="text-[#C4A882]/40 text-xs mt-1 truncate">{email.body?.slice(0, 150)}...</p>
          </div>
        ))}
      </div>
      {emails.length > 0 && (
        <button onClick={loadMore} className="w-full py-2 border border-[#C4A882]/20 text-[#C4A882] rounded-lg text-sm hover:border-[#C4A882]/40 transition-all">Загрузить ещё 50 писем</button>
      )}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-2 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Ответ клиенту</h2>
            <p className="text-[#C4A882]/60 text-sm mb-2">От: {selected.from} | Тема: {selected.subject}</p>
            <div className="bg-[#1A1208] border border-[#C4A882]/10 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto">
              <p className="text-[#C4A882]/50 text-xs mb-2">Входящее письмо:</p>
              <p className="text-[#C4A882]/80 text-sm whitespace-pre-wrap">{selected.body}</p>
            </div>
            {status && <p className="text-yellow-400 text-sm mb-2">{status}</p>}
            <p className="text-[#C4A882]/50 text-xs mb-2">AI ответ (можно редактировать):</p>
            <textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-4" rows={8} value={editedReply} onChange={(e) => setEditedReply(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={sendReply} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">Отправить ответ</button>
              <button onClick={() => setSelected(null)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
