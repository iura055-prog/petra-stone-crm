// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const host = process.env.EMAIL_IMAP_HOST || 'imap.yandex.ru';
  const port = Number(process.env.EMAIL_IMAP_PORT) || 993;
  const user = process.env.EMAIL_IMAP_USER || 'hi@petra-design.ru';
  const pass = process.env.EMAIL_IMAP_PASS || '';
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');

  if (!pass) return NextResponse.json({ error: 'IMAP не настроен' }, { status: 500 });

  return new Promise<NextResponse>((resolve) => {
    const imap = new Imap({ user, password: pass, host, port, tls: true });
    const emails: any[] = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['ALL'], (err, results) => {
          if (err || !results.length) { imap.end(); resolve(NextResponse.json({ emails: [] })); return; }
          const recent = results.slice(-limit).reverse();
          let count = 0;
          recent.forEach((uid) => {
            const fetch = imap.fetch(uid, { bodies: '', struct: true });
            fetch.on('message', (msg) => {
              let flags: string[] = [];
              msg.on('attributes', (attrs) => { flags = attrs.flags || []; });
              msg.on('body', (stream) => {
                simpleParser(stream, (err, parsed) => {
                  if (!err) {
                    emails.push({
                      id: String(uid),
                      from: parsed.from?.text || '',
                      subject: parsed.subject || '',
                      date: parsed.date?.toISOString() || '',
                      body: parsed.text || '',
                      seen: flags.includes('\\Seen'),
                    });
                  }
                  count++;
                  if (count === recent.length) {
                    emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    imap.end();
                    resolve(NextResponse.json({ emails }));
                  }
                });
              });
            });
          });
        });
      });
    });
    imap.once('error', (err) => { resolve(NextResponse.json({ error: err.message })); });
    imap.connect();
  });
}

