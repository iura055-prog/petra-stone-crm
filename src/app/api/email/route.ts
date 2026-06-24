import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import Imap from 'imap';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html } = await req.json();
    const port = Number(process.env.EMAIL_PORT) || 465;
    const user = process.env.EMAIL_USER || 'hi@petra-design.ru';
    const pass = process.env.EMAIL_PASS || '';
    const imapPass = process.env.EMAIL_IMAP_PASS || pass;
    const from = process.env.EMAIL_FROM || 'hi@petra-design.ru';

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.yandex.ru',
      port: port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({ from, to, subject, html });

    // Сохраняем копию в папку Отправленные через IMAP
    const rawEmail = `From: ${from}\r\nTo: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/html; charset=utf-8\r\nDate: ${new Date().toUTCString()}\r\n\r\n${html}`;

    await new Promise<void>((resolve) => {
      const imap = new Imap({ user, password: imapPass, host: 'imap.yandex.ru', port: 993, tls: true });
      imap.once('ready', () => {
        imap.append(Buffer.from(rawEmail, 'utf-8'), { mailbox: 'Sent' }, () => { imap.end(); resolve(); });
      });
      imap.once('error', () => { resolve(); });
      imap.connect();
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
