type Tool = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (value: unknown) => unknown;
};
type Context = {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function registerStudyTools(
  read: () => unknown,
  setStep: (id: string, checked: boolean) => Promise<unknown>,
) {
  const context = (document as Document & { modelContext?: Context })
    .modelContext;
  if (!context?.registerTool) return () => {};
  const lifecycle = new AbortController();
  const definitions: Tool[] = [
    {
      name: 'read_study_progress',
      title: 'Çalışma ilerlemesini oku',
      description:
        'Bugünkü planı, konu sürelerini ve işaretlenmiş adımları okur. Kayıt değiştirmez.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => read(),
    },
    {
      name: 'set_study_step_completed',
      title: 'Çalışma adımını işaretle',
      description:
        'Kullanıcının tamamladığını belirttiği bir adımı işaretler veya işareti kaldırır. Ekrandaki tikle aynı kaydı günceller; öğrenmeyi kendiliğinden varsaymaz.',
      inputSchema: {
        type: 'object',
        properties: {
          stepId: { type: 'string' },
          completed: { type: 'boolean' },
        },
        required: ['stepId', 'completed'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (value) => {
        if (!value || typeof value !== 'object')
          throw new Error('Adım ve durum gerekli.');
        const v = value as { stepId: string; completed: boolean };
        if (typeof v.stepId !== 'string' || typeof v.completed !== 'boolean')
          throw new Error('Geçersiz adım veya durum.');
        return setStep(v.stepId, v.completed);
      },
    },
  ];
  for (const tool of definitions) {
    try {
      void Promise.resolve(
        context.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {
      /* Optional browser capability. */
    }
  }
  return () => lifecycle.abort();
}
