import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { to, message } = await req.json();
  const sid = process.env.TWILIO_ACCOUNT_SID;

  if (!sid) {
    return NextResponse.json({ success: true, info: 'SMS-заглушка: Twilio не настроен. Сообщение: ' + message });
  }

  return NextResponse.json({ success: true, info: 'SMS отправлено (заглушка): ' + message });
}
