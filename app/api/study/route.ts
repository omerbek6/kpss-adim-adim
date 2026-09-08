import { getStudyDb } from '@/db/state';
import { emptyState, validateState } from '@/lib/study';

const reply = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
// This personal workspace is served behind the owner-only Sites access gate.
// It intentionally has one owner and does not offer shared or public access.
export async function GET() {
  try {
    const row = await getStudyDb()
      .prepare('SELECT data, revision FROM study_state WHERE id = 1')
      .first<{ data: string; revision: number }>();
    return reply(
      row
        ? { state: JSON.parse(row.data), revision: row.revision }
        : { state: emptyState(), revision: 0 },
    );
  } catch {
    return reply(
      {
        error: 'Kayıtlarına ulaşılamadı. İnternetini kontrol edip tekrar dene.',
      },
      503,
    );
  }
}
export async function PUT(request: Request) {
  try {
    const origin = request.headers.get('Origin');
    if (
      request.headers.get('Sec-Fetch-Site') === 'cross-site' ||
      (origin && origin !== new URL(request.url).origin)
    )
      return reply(
        { error: 'Bu işlem aynı çalışma sayfasından yapılmalı.' },
        403,
      );
    if (!request.headers.get('Content-Type')?.includes('application/json'))
      return reply({ error: 'Geçersiz kayıt biçimi.' }, 415);
    const text = await request.text();
    if (text.length > 180000) return reply({ error: 'Kayıt çok büyük.' }, 413);
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return reply({ error: 'Geçersiz kayıt.' }, 400);
    }
    if (
      !body ||
      typeof body !== 'object' ||
      !Number.isInteger(body.revision) ||
      body.revision < 0 ||
      !validateState(body.state)
    )
      return reply({ error: 'Geçersiz çalışma kaydı.' }, 400);
    const db = getStudyDb();
    await db
      .prepare(
        'INSERT OR IGNORE INTO study_state (id,data,revision) VALUES (1,?,0)',
      )
      .bind(JSON.stringify(emptyState()))
      .run();
    const result = await db
      .prepare(
        'UPDATE study_state SET data = ?, revision = revision + 1 WHERE id = 1 AND revision = ?',
      )
      .bind(JSON.stringify(body.state), body.revision)
      .run();
    if (result.meta.changes !== 1)
      return reply(
        {
          error:
            'Başka bir sekmede kayıt değişti. Son kaydı yükleyip yeniden dene.',
        },
        409,
      );
    return reply({ state: body.state, revision: body.revision + 1 });
  } catch {
    return reply(
      {
        error:
          'Değişiklik kaydedilemedi. İnternetini kontrol edip tekrar dene.',
      },
      503,
    );
  }
}
