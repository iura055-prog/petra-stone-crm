'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ImageDesignerPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Добро пожаловать в AI Image Designer PETRA Stone! Я помогу создать дизайн изделия из натурального камня. Какое изделие проектируем?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/image-designer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Ошибка: ' + data.error }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Ошибка соединения с сервером' }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Image Designer</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>AI DeepSeek - Дизайн изделий из камня</p>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: 'Добро пожаловать в AI Image Designer PETRA Stone! Я помогу создать дизайн изделия из натурального камня. Какое изделие проектируем?' }])} className="border border-[#C4A882]/20 text-[#C4A882] px-4 py-2 rounded-lg text-sm">Новый дизайн</button>
      </div>

      <div className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-6 max-w-2xl">
        <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-[#E86C2F] text-white' : 'bg-[#1A1208] text-[#F5F0E8] border border-[#C4A882]/10'}`} style={{ fontFamily: 'DM Sans, sans-serif', whiteSpace: 'pre-line' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-[#C4A882]/60 text-sm">AI генерирует дизайн...</div>}
          <div ref={chatEndRef} />
        </div>

        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Опишите пожелания..." className="flex-1 px-4 py-3 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#E86C2F]/50" style={{ fontFamily: 'DM Sans, sans-serif' }} />
          <button onClick={sendMessage} disabled={loading} className="bg-[#E86C2F] text-white px-5 py-3 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50"></button>
        </div>
      </div>
    </div>
  );
}
