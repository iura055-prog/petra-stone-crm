import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { from, subject, body } = await req.json();
  const apiKey = process.env.DEEPSEEK_API_KEY || '';

  if (!apiKey) {
    return NextResponse.json({ error: 'DeepSeek API key not configured' });
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'Ты менеджер компании PETRA Stone for home (обработка натурального камня). Напиши вежливый, профессиональный ответ на русском языке на письмо клиента. Подпишись: "С уважением, PETRA Stone for home, +7 (967) 084-50-06, hi@petra-design.ru". Используй информацию из письма клиента.' },
          { role: 'user', content: `Письмо от: ${from}\nТема: ${subject}\n\n${body}` },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });
    const data = await response.json();
    return NextResponse.json({ reply: data.choices?.[0]?.message?.content || 'Ошибка AI' });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
