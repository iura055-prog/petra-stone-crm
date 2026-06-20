// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { uid } = await req.json();
  const host = process.env.EMAIL_IMAP_HOST || 'imap.yandex.ru';
  const user = process.env.EMAIL_IMAP_USER || 'hi@petra-design.ru';
  const pass = process.env.EMAIL_IMAP_PASS || '';

  return new Promise<NextResponse>((resolve) => {
    const imap = new Imap({ user, password: pass, host, port: 993, tls: true });
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.addFlags(uid, ['\\Seen'], (err) => {
          imap.end();
          if (err) resolve(NextResponse.json({ error: err.message }));
          else resolve(NextResponse.json({ success: true }));
        });
      });
    });
    imap.once('error', (err) => resolve(NextResponse.json({ error: err.message })));
    imap.connect();
  });
}
