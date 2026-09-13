export function studyIdentity(request: Request) {
  // Sites dispatch strips client-supplied identity headers and forwards its signed-in visitor.
  // This app must stay behind that trusted access gate; never expose the Worker directly.
  const id = request.headers.get('oai-authenticated-user-id')?.trim();
  const email = request.headers.get('oai-authenticated-user-email')?.trim();
  if (!id || !email || id.length > 256 || email.length > 320) return null;
  return { id, email };
}
