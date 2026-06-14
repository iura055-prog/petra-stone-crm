import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, formData } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-placeholder';

    if (apiKey === 'sk-placeholder') {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 });
    }

    const systemPrompt = `Ты — эксперт-сметчик компании PETRA Stone for home по обработке натурального камня (мрамор, травертин, известняк, оникс, гранит). 
Твоя задача: провести клиента через 5 шагов расчёта сметы.
Шаг 1: спросить тип изделия (столешница, подоконник, ступени, камин, ванная, колонна, другое).
Шаг 2: спросить тип камня (мрамор, травертин, известняк, оникс, гранит).
Шаг 3: спросить площадь в м².
Шаг 4: спросить тип обработки края (прямой, фаска, скруглённый, фигурный).
Шаг 5: спросить расстояние доставки в км.
После шага 5 — рассчитай смету. Цены за м²: мрамор 8500₽, травертин 6200₽, известняк 5500₽, оникс 12000₽, гранит 9500₽.
Раскрой = 30% от материала. Доставка = расстояние × 50₽ + 2000₽. Монтаж = 25% от материала.
Выведи итог в формате: "✅ Смета готова!\\n\\nИзделие: ...\\nКамень: ...\\nПлощадь: ... м²\\n\\n💰 Материал: ... ₽\\n🔪 Раскрой: ... ₽\\n🚚 Доставка: ... ₽\\n🔧 Монтаж: ... ₽\\n\\n💎 ИТОГО: ... ₽"
Отвечай на русском языке, дружелюбно, профессионально.`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content || 'Извините, произошла ошибка. Попробуйте ещё раз.';
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}