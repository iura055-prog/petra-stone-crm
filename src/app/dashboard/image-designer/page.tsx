'use client';

import { useState } from 'react';

interface DesignMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ImageDesignerPage() {
  const [messages, setMessages] = useState<DesignMessage[]>([
    { role: 'assistant', content: 'Добро пожаловать в Image Designer! Я помогу создать дизайн изделия из камня. Для начала — какое изделие проектируем? (Столешница, Ступени, Камин, Ванная, Подоконник)' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [iteration, setIteration] = useState(1);
  const [designData, setDesignData] = useState({ productType: '', stoneType: '', edgeType: '', sinkType: '' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processInput = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    let response = '';

    switch (step) {
      case 0:
        setDesignData({ ...designData, productType: input });
        response = `${input} — понял. Какой камень? (Мрамор, Травертин, Известняк, Оникс, Гранит)`;
        setStep(1);
        break;
      case 1:
        setDesignData({ ...designData, stoneType: input });
        response = `${input} — отличный выбор. Какая обработка края? (Прямой, Фаска 5мм, Фаска 10мм, Скруглённый, Фигурный)`;
        setStep(2);
        break;
      case 2:
        setDesignData({ ...designData, edgeType: input });
        response = 'Нужна врезка под мойку? (Да, сверху / Да, снизу / Нет)';
        setStep(3);
        break;
      case 3:
        const fd = { ...designData, sinkType: input };
        setDesignData(fd);
        setPreviewUrl('/api/placeholder/800/600');
        response = `🎨 Генерирую визуализацию...\n\nИтерация ${iteration}\n\n📋 ${fd.productType} из ${fd.stoneType}\n🔪 Кромка: ${fd.edgeType}\n🚰 Мойка: ${fd.sinkType}\n\n[Изображение-заглушка сгенерировано]\n\nПохоже на то, что вы хотели? (Да / Нет, нужно уточнить)`;
        setStep(4);
        break;
      case 4:
        if (input.toLowerCase().includes('да')) {
          response = '✅ Дизайн утверждён! Сохраняю в папку сметы.';
          setStep(5);
        } else if (iteration >= 10) {
          response = 'Достигнут лимит итераций (10). Предлагаю продолжить вручную или сохранить последний вариант.';
          setStep(5);
        } else {
          setIteration(iteration + 1);
          response = `Понял, давайте уточним. Итерация ${iteration + 1}. Что изменить? (Камень, кромку, мойку, другое)`;
          setStep(0);
        }
        break;
      default:
        response = 'Дизайн завершён. Можете начать заново.';
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 600);
  };

  const resetDesign = () => {
    setMessages([{ role: 'assistant', content: 'Добро пожаловать в Image Designer! Я помогу создать дизайн изделия из камня. Для начала — какое изделие проектируем?' }]);
    setStep(0);
    setIteration(1);
    setDesignData({ productType: '', stoneType: '', edgeType: '', sinkType: '' });
    setPreviewUrl(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Image Designer</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>AI-дизайн изделий из камня</p>
        </div>
        <button onClick={resetDesign} className="border border-[#C4A882]/20 text-[#C4A882] px-4 py-2 rounded-lg text-sm hover:border-[#C4A882]/40 transition-all">Новый дизайн</button>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-6">
          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-[#E86C2F] text-white' : 'bg-[#1A1208] text-[#F5F0E8] border border-[#C4A882]/10'}`}
                  style={{ fontFamily: 'DM Sans, sans-serif', whiteSpace: 'pre-line' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-[#C4A882]/60 text-sm">Генерация...</div>}
          </div>
          {step < 5 && (
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && processInput()}
                placeholder="Введите ответ..." className="flex-1 px-4 py-3 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#E86C2F]/50" />
              <button onClick={processInput} disabled={loading} className="bg-[#E86C2F] text-white px-5 py-3 rounded-lg text-sm hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50">→</button>
            </div>
          )}
        </div>

        {previewUrl && (
          <div className="lg:w-80 bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-4 flex flex-col items-center">
            <p className="text-xs text-[#C4A882]/60 mb-3">Визуализация (итерация {iteration})</p>
            <div className="w-full aspect-square bg-gradient-to-br from-[#1A1208] to-[#0F0B05] rounded-lg flex items-center justify-center border border-[#C4A882]/10">
              <div className="text-center">
                <p className="text-5xl mb-2">🪨</p>
                <p className="text-[#C4A882]/40 text-xs">{designData.stoneType}</p>
                <p className="text-[#C4A882]/30 text-xs">{designData.productType}</p>
              </div>
            </div>
            <div className="mt-3 space-y-1 w-full text-xs text-[#C4A882]/50">
              <p>Изделие: {designData.productType}</p>
              <p>Камень: {designData.stoneType}</p>
              <p>Кромка: {designData.edgeType}</p>
              <p>Мойка: {designData.sinkType}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}