'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface EstimateResult {
  materialCost: number;
  cuttingCost: number;
  deliveryCost: number;
  installationCost: number;
  totalCost: number;
  stoneType: string;
  productType: string;
  squareMeters: number;
}

export default function EstimateCalculatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Здравствуйте! Я помогу рассчитать смету на изделие из натурального камня. Для начала скажите, какое изделие вас интересует? (Столешница, Подоконник, Ступени, Камин, Ванная, Колонна, Другое)' }
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    productType: '',
    stoneType: '',
    squareMeters: 0,
    edgeType: '',
    deliveryDistance: 0,
  });
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [loading, setLoading] = useState(false);

  const stonePrices: Record<string, number> = {
    'Мрамор': 8500,
    'Травертин': 6200,
    'Известняк': 5500,
    'Оникс': 12000,
    'Гранит': 9500,
  };

  const processInput = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let response = '';

    switch (step) {
      case 0:
        setFormData({ ...formData, productType: input });
        response = `Отлично, ${input}. Какой камень вы предпочитаете? (Мрамор, Травертин, Известняк, Оникс, Гранит)`;
        setStep(1);
        break;
      case 1:
        setFormData({ ...formData, stoneType: input });
        response = `${input} — прекрасный выбор. Укажите примерную площадь в м²:`;
        setStep(2);
        break;
      case 2:
        const sqm = parseFloat(input);
        if (isNaN(sqm)) { response = 'Пожалуйста, введите число (площадь в м²):'; break; }
        setFormData({ ...formData, squareMeters: sqm });
        response = 'Какая обработка края? (Прямой, Фаска, Скруглённый, Фигурный)';
        setStep(3);
        break;
      case 3:
        setFormData({ ...formData, edgeType: input });
        response = 'Укажите расстояние доставки в км:';
        setStep(4);
        break;
      case 4:
        const dist = parseFloat(input);
        if (isNaN(dist)) { response = 'Введите число (расстояние в км):'; break; }
        const fd = { ...formData, deliveryDistance: dist };
        setFormData(fd);

        const price = stonePrices[fd.stoneType] || 8000;
        const materialCost = price * fd.squareMeters;
        const cuttingCost = materialCost * 0.3;
        const deliveryCost = dist * 50 + 2000;
        const installationCost = materialCost * 0.25;
        const totalCost = materialCost + cuttingCost + deliveryCost + installationCost;

        const estimate: EstimateResult = {
          materialCost: Math.round(materialCost),
          cuttingCost: Math.round(cuttingCost),
          deliveryCost: Math.round(deliveryCost),
          installationCost: Math.round(installationCost),
          totalCost: Math.round(totalCost),
          stoneType: fd.stoneType,
          productType: fd.productType,
          squareMeters: fd.squareMeters,
        };
        setResult(estimate);
        response = `✅ Смета готова!\n\n📋 Изделие: ${estimate.productType}\n🪨 Камень: ${estimate.stoneType}\n📐 Площадь: ${estimate.squareMeters} м²\n\n💰 Материал: ${estimate.materialCost.toLocaleString()} ₽\n🔪 Раскрой: ${estimate.cuttingCost.toLocaleString()} ₽\n🚚 Доставка: ${estimate.deliveryCost.toLocaleString()} ₽\n🔧 Монтаж: ${estimate.installationCost.toLocaleString()} ₽\n\n💎 ИТОГО: ${estimate.totalCost.toLocaleString()} ₽\n\nСмету можно сохранить в Estimate Data.`;
        setStep(5);
        break;
      default:
        response = 'Смета уже рассчитана. Можете начать заново, обновив страницу.';
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    }, 500);
  };

  const resetCalc = () => {
    setMessages([{ role: 'assistant', content: 'Здравствуйте! Я помогу рассчитать смету на изделие из натурального камня. Для начала скажите, какое изделие вас интересует? (Столешница, Подоконник, Ступени, Камин, Ванная, Колонна, Другое)' }]);
    setStep(0);
    setResult(null);
    setFormData({ productType: '', stoneType: '', squareMeters: 0, edgeType: '', deliveryDistance: 0 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>Калькулятор смет</h1>
          <p className="text-[#C4A882]/70 mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>AI-расчёт стоимости</p>
        </div>
        <button onClick={resetCalc} className="border border-[#C4A882]/20 text-[#C4A882] px-4 py-2 rounded-lg text-sm hover:border-[#C4A882]/40 transition-all">Начать заново</button>
      </div>

      <div className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-6 max-w-2xl">
        {/* Чат */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-[#E86C2F] text-white'
                  : 'bg-[#1A1208] text-[#F5F0E8] border border-[#C4A882]/10'
              }`} style={{ fontFamily: 'DM Sans, sans-serif', whiteSpace: 'pre-line' }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1A1208] text-[#C4A882]/60 rounded-xl px-4 py-3 text-sm">Печатает...</div>
            </div>
          )}
        </div>

        {/* Ввод */}
        {step < 5 && (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && processInput()}
              placeholder="Введите ответ..."
              className="flex-1 px-4 py-3 bg-[#1A1208] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] text-sm focus:outline-none focus:border-[#E86C2F]/50"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            />
            <button
              onClick={processInput}
              disabled={loading}
              className="bg-[#E86C2F] text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-[#E86C2F]/90 transition-all disabled:opacity-50"
            >
              →
            </button>
          </div>
        )}

        {/* Итог */}
        {result && (
          <div className="mt-4 p-4 bg-[#E86C2F]/5 border border-[#E86C2F]/20 rounded-xl">
            <p className="text-[#E86C2F] text-2xl font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>
              {result.totalCost.toLocaleString()} ₽
            </p>
            <p className="text-[#C4A882]/70 text-xs mt-1">Итоговая стоимость</p>
          </div>
        )}
      </div>
    </div>
  );
}