import { env } from 'cloudflare:workers';
export function getStudyDb() {
  if (!env.DB) throw new Error('Çalışma kaydına ulaşılamıyor.');
  return env.DB;
}
