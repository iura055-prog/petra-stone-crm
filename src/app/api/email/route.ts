import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.yandex.ru',
      port: Number(process.env.EMAIL_PORT) || 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER || 'hi@petra-design.ru',
        pass: process.env.EMAIL_PASS || '',
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'hi@petra-design.ru',
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
