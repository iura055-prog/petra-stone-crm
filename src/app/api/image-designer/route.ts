import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY || 'sk-placeholder';

    if (apiKey === 'sk-placeholder') {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 });
    }

    const systemPrompt = `Ты  AI-дизайнер компании PETRA Stone for home. Помогаешь клиенту спроектировать изделие из натурального камня.

Задай по порядку вопросы:
1. Какое изделие? (столешница, ступени, камин, ванная, подоконник, колонна)
2. Какой камень? (мрамор, травертин, известняк, оникс, гранит)
3. Какая обработка края? (прямой, фаска 5мм, фаска 10мм, скруглённый, фигурный)
4. Нужна ли врезка под мойку? (да, сверху / да, снизу / нет)
5. Цветовая гамма интерьера? (светлая, тёмная, бежевая, серая, другая)

После сбора всей информации  опиши визуализацию: как будет выглядеть изделие, текстура камня, сочетание с интерьером. Добавь [Изображение-заглушка] и спроси: "Похоже на то, что вы хотели? (Да / Нет, нужно уточнить)"

Если клиент говорит "Нет"  спроси что изменить и опиши новый вариант. После 10 итераций предложи завершить.

Отвечай на русском, дружелюбно, профессионально, с энтузиазмом о красоте камня.`;

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
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const reply = data.choices?.[0]?.message?.content || 'Извините, ошибка генерации.';
    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
