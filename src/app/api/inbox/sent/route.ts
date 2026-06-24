// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

export async function GET(): Promise<NextResponse> {
  const host = process.env.EMAIL_IMAP_HOST || 'imap.yandex.ru';
  const user = process.env.EMAIL_IMAP_USER || 'hi@petra-design.ru';
  const pass = process.env.EMAIL_IMAP_PASS || '';

  if (!pass) return NextResponse.json({ error: 'IMAP не настроен' }, { status: 500 });

  return new Promise<NextResponse>((resolve) => {
    const imap = new Imap({ user, password: pass, host, port: 993, tls: true });
    const emails: any[] = [];

    imap.once('ready', () => {
      imap.openBox('Sent', true, () => {
        imap.search(['ALL'], (err, results) => {
          if (err || !results.length) { imap.end(); resolve(NextResponse.json({ emails: [] })); return; }
          const recent = results.slice(-50).reverse();
          let count = 0;
          recent.forEach((uid) => {
            const fetch = imap.fetch(uid, { bodies: '' });
            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (!err) {
                    emails.push({
                      id: String(uid),
                      to: parsed.to?.text || '',
                      subject: parsed.subject || '',
                      date: parsed.date?.toISOString() || '',
                      body: parsed.html || parsed.text || '',
                    });
                  }
                  count++;
                  if (count === recent.length) { imap.end(); resolve(NextResponse.json({ emails })); }
                });
              });
            });
          });
        });
      });
    });
    imap.once('error', (err) => resolve(NextResponse.json({ error: err.message })));
    imap.connect();
  });
}
