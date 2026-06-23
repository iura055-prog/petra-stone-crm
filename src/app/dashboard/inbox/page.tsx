'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Email {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
  seen: boolean;
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
}

type Category = 'clients' | 'suppliers' | 'production' | 'employees';

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Email | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [status, setStatus] = useState('');
  const [limit, setLimit] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [forwardMode, setForwardMode] = useState(false);
  const [clientCheck, setClientCheck] = useState<{ found: boolean; client?: Client; category?: string } | null>(null);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [adding, setAdding] = useState(false);
  const [supplierMatch, setSupplierMatch] = useState<{ id: number; name: string } | null>(null);

  const loadEmails = async () => {
    setLoading(true);
    try { const res = await fetch('/api/inbox?limit=' + limit); const data = await res.json(); if (data.emails) setEmails(data.emails); else setStatus('Ошибка'); } catch (e) { setStatus('Ошибка соединения'); }
    setLoading(false);
  };
  const loadMore = () => { setLimit(limit + 50); setTimeout(() => loadEmails(), 100); };
  const extractEmail = (from: string) => from.includes('<') ? from.split('<')[1].split('>')[0].trim().toLowerCase() : from.trim().toLowerCase();
  const extractName = (from: string) => from.includes('<') ? from.split('<')[0].replace(/"/g, '').trim() : '';

  const checkContact = async (email: string) => {
    const tables = [{ table: 'clients', category: 'Клиент' }, { table: 'suppliers', category: 'Поставщик' }, { table: 'production', category: 'Производство' }, { table: 'employees', category: 'Сотрудник Petra' }];
    for (const t of tables) {
      const { data } = await supabase.from(t.table).select('id, name, phone, email').ilike('email', '%' + email + '%').limit(1);
      if (data && data.length > 0) return { found: true, client: data[0], category: t.category };
    }
    return { found: false };
  };

  const findSupplierMatch = async (fromText: string) => {
    const { data } = await supabase.from('suppliers').select('id, name').order('created_at');
    if (!data) return null;
    const lower = fromText.toLowerCase();
    for (const s of data) {
      if (s.name && lower.includes(s.name.toLowerCase())) return s;
    }
    return null;
  };

  const openEmail = async (email: Email) => {
    const addr = extractEmail(email.from);
    setSelected(email); setReplyTo(addr); setEditedReply(''); setForwardMode(false); setStatus(''); setShowCategorySelect(false); setAdding(false); setSupplierMatch(null);
    if (!email.seen) {
      fetch('/api/inbox/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: email.id }) });
      setEmails(emails.map(e => e.id === email.id ? { ...e, seen: true } : e));
    }
    const result = await checkContact(addr);
    setClientCheck(result as any);
    if (!result.found) {
      const match = await findSupplierMatch(email.from);
      if (match) setSupplierMatch(match);
    }
  };

  const addContact = async (category: Category) => {
    if (!selected) return; setAdding(true);
    const name = extractName(selected.from) || extractEmail(selected.from);
    const email = extractEmail(selected.from);
    let insertData: any = { name, email };
    if (category === 'clients') insertData = { ...insertData, type: 'Частное лицо', source: 'Входящее письмо' };
    if (category === 'production') insertData = { ...insertData, status: 'Принят' };
    await supabase.from(category).insert([insertData]);
    const result = await checkContact(email); setClientCheck(result as any); setShowCategorySelect(false); setStatus('Добавлено!');
    setAdding(false);
  };

  const addToSupplier = async () => {
    if (!selected || !supplierMatch) return; setAdding(true);
    const name = extractName(selected.from) || extractEmail(selected.from);
    const email = extractEmail(selected.from);
    await supabase.from('supplier_contacts').insert([{ name, email, supplier_id: supplierMatch.id }]);
    const result = await checkContact(email); setClientCheck(result as any); setSupplierMatch(null); setShowCategorySelect(false); setStatus('Добавлен в ' + supplierMatch.name + '!');
    setAdding(false);
  };

  const generateReply = async () => {
    if (!selected) return; setGenerating(true); setStatus('AI генерирует ответ...'); setForwardMode(false);
    try {
      const res = await fetch('/api/inbox/reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: selected.from, subject: selected.subject, body: selected.body }) });
      const data = await res.json(); if (data.reply) { setEditedReply(data.reply); setStatus(''); } else setStatus('Ошибка AI');
    } catch (e) { setStatus('Ошибка соединения'); }
    setGenerating(false);
  };

  const startForward = () => {
    if (!selected) return; setForwardMode(true); setReplyTo('');
    setEditedReply('--- Пересылаемое письмо ---\nОт: ' + selected.from + '\nДата: ' + (selected.date ? new Date(selected.date).toLocaleString('ru-RU') : '') + '\nТема: ' + selected.subject + '\n\n' + selected.body);
    setStatus('');
  };

  const sendReply = async () => {
    if (!replyTo.trim()) { setStatus('Введите адрес получателя'); return; } setStatus('Отправка...');
    try {
      const subject = forwardMode ? 'Fwd: ' + (selected?.subject || '') : 'Re: ' + (selected?.subject || '');
      const res = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: replyTo, subject, html: editedReply.replace(/\n/g, '<br>') }) });
      const data = await res.json(); if (data.success) { setStatus(forwardMode ? 'Переслано!' : 'Ответ отправлен!'); setSelected(null); } else setStatus('Ошибка отправки');
    } catch (e) { setStatus('Ошибка соединения'); }
  };

  const categories = [{ key: 'clients' as Category, label: 'Клиент' }, { key: 'suppliers' as Category, label: 'Поставщик' }, { key: 'production' as Category, label: 'Производство' }, { key: 'employees' as Category, label: 'Сотрудник Petra' }];
  const unreadCount = emails.filter(e => !e.seen).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Входящие</h1><p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>hi@petra-design.ru - {emails.length} писем {unreadCount > 0 && '(непрочитано: ' + unreadCount + ')'}</p></div>
        <button onClick={loadEmails} disabled={loading} className="bg-[#E86C2F] text-white px-5 py-2.5 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50">{loading ? 'Загрузка...' : 'Проверить почту'}</button>
      </div>
      {status && !selected && <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-400 text-sm">{status}</div>}
      <div className="space-y-2 mb-4">
        {emails.length === 0 && !loading ? <p className="text-[#C4A882]/40 text-center py-8">Нажмите Проверить почту</p> : emails.map((email) => (
          <div key={email.id} className={'rounded-xl p-4 cursor-pointer transition-all border ' + (!email.seen ? 'bg-[#E86C2F]/5 border-[#E86C2F]/20' : 'bg-[#0F0B05] border-[#C4A882]/10 hover:border-[#C4A882]/20')} onClick={() => openEmail(email)}>
            <div className="flex items-center justify-between mb-1"><div className="flex items-center gap-2">{!email.seen && <span className="w-2 h-2 rounded-full bg-[#E86C2F]"></span>}<p className={'text-sm ' + (!email.seen ? 'text-[#F5F0E8] font-semibold' : 'text-[#C4A882]')}>{email.from}</p></div><p className="text-[#C4A882]/40 text-xs">{email.date ? new Date(email.date).toLocaleString('ru-RU') : ''}</p></div>
            <p className={'text-sm ' + (!email.seen ? 'text-[#F5F0E8] font-semibold' : 'text-[#C4A882]/80')}>{email.subject}</p><p className="text-[#C4A882]/40 text-xs mt-1 truncate">{email.body?.slice(0, 150)}...</p>
          </div>
        ))}
      </div>
      {emails.length > 0 && <button onClick={loadMore} className="w-full py-2 border border-[#C4A882]/20 text-[#C4A882] rounded-lg text-sm hover:border-[#C4A882]/40 transition-all">Загрузить ещё 50 писем</button>}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setSelected(null)}>
          <div className="bg-[#0F0B05] border border-[#C4A882]/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl text-[#F5F0E8] mb-2 font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>{forwardMode ? 'Переслать: ' : ''}{selected.subject}</h2>
            <p className="text-[#C4A882]/60 text-sm mb-2">От: {selected.from} | {selected.date ? new Date(selected.date).toLocaleString('ru-RU') : ''}</p>

            {clientCheck && !clientCheck.found && supplierMatch && !showCategorySelect && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-3 flex items-center justify-between">
                <p className="text-green-400 text-sm">Найден поставщик: {supplierMatch.name}</p>
                <button onClick={addToSupplier} disabled={adding} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs hover:bg-green-500/90">{adding ? '...' : 'Добавить контакт'}</button>
              </div>
            )}
            {clientCheck && !clientCheck.found && !supplierMatch && !showCategorySelect && (
              <div className="bg-[#E86C2F]/10 border border-[#E86C2F]/20 rounded-lg p-3 mb-3 flex items-center justify-between">
                <p className="text-[#E86C2F] text-sm">Контакта нет в базе</p>
                <button onClick={() => setShowCategorySelect(true)} className="bg-[#E86C2F] text-white px-4 py-1.5 rounded-lg text-xs hover:bg-[#E86C2F]/90">Добавить</button>
              </div>
            )}
            {clientCheck && !clientCheck.found && showCategorySelect && (
              <div className="bg-[#E86C2F]/10 border border-[#E86C2F]/20 rounded-lg p-3 mb-3">
                <p className="text-[#E86C2F] text-sm mb-2">Выберите категорию:</p>
                {adding ? <p className="text-[#C4A882]/60 text-sm">Добавление...</p> : (
                  <div className="grid grid-cols-2 gap-2">{categories.map(cat => (<button key={cat.key} onClick={() => addContact(cat.key)} className="bg-[#E86C2F]/20 text-[#E86C2F] py-2 rounded-lg text-xs hover:bg-[#E86C2F]/30 transition-all">{cat.label}</button>))}</div>
                )}
                <button onClick={() => setShowCategorySelect(false)} className="w-full mt-2 border border-[#C4A882]/20 text-[#C4A882] py-1.5 rounded-lg text-xs">Отмена</button>
              </div>
            )}
            {clientCheck && clientCheck.found && clientCheck.client && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mb-3"><p className="text-green-400 text-xs">{clientCheck.category}: {clientCheck.client.name} {clientCheck.client.phone ? '| ' + clientCheck.client.phone : ''}</p></div>
            )}

            <div className="bg-[#1A1208] border border-[#C4A882]/10 rounded-lg p-3 mb-4 max-h-40 overflow-y-auto"><p className="text-[#C4A882]/80 text-sm whitespace-pre-wrap">{selected.body}</p></div>
            {!editedReply ? (
              <div className="flex gap-3">
                <button onClick={generateReply} disabled={generating} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50">{generating ? 'Генерация...' : 'Подготовить ответ'}</button>
                <button onClick={startForward} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm hover:border-[#C4A882]/40">Переслать</button>
                <button onClick={() => setSelected(null)} className="flex-1 border border-red-500/20 text-red-400 py-2.5 rounded-lg text-sm">Отмена</button>
              </div>
            ) : (
              <>
                {status && <p className="text-yellow-400 text-sm mb-2">{status}</p>}
                <label className="text-[#C4A882]/50 text-xs mb-1 block">Кому:</label><input className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-3" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="email@example.com" />
                <label className="text-[#C4A882]/50 text-xs mb-1 block">{forwardMode ? 'Письмо:' : 'Ответ:'}</label><textarea className="w-full px-3 py-2.5 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm mb-4" rows={8} value={editedReply} onChange={(e) => setEditedReply(e.target.value)} />
                <div className="flex gap-3"><button onClick={sendReply} className="flex-1 bg-[#E86C2F] text-white py-2.5 rounded-lg text-sm">{forwardMode ? 'Отправить пересылку' : 'Отправить ответ'}</button><button onClick={() => setSelected(null)} className="flex-1 border border-[#C4A882]/20 text-[#C4A882] py-2.5 rounded-lg text-sm">Отмена</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
