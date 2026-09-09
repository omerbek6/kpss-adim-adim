export async function studyRequest(init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/study', {
      ...init,
      signal: controller.signal,
    });
    if (!response.headers.get('Content-Type')?.includes('application/json'))
      throw new Error('Oturumunu yenilemek için sayfayı yeniden aç.');
    return response;
  } catch (e) {
    if (controller.signal.aborted)
      throw new Error(
        'Bağlantı yanıt vermedi. Son kaydı yeniden yükleyip kontrol et.',
      );
    if (e instanceof TypeError)
      throw new Error('İnternet bağlantısı kurulamadı.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
