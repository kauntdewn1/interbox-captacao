import { useEffect, useMemo, useState } from 'react';

type LocalKey = 'inscricoes_judge' | 'inscricoes_staff' | 'inscricoes_audiovisual' | 'seguro_solicitacoes';

const DEFAULT_TOKEN = 'interbox2025';

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
    return [];
  } catch {
    return [];
  }
}

export default function MigrarLocalStoragePage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';

  const allData = useMemo(() => {
    return {
      inscricoes_judge: readJson('inscricoes_judge'),
      inscricoes_staff: readJson('inscricoes_staff'),
      inscricoes_audiovisual: readJson('inscricoes_audiovisual'),
      seguro_solicitacoes: readJson('seguro_solicitacoes'),
    } as Record<LocalKey, unknown[]>;
  }, []);

  const [sending, setSending] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    document.title = 'Migrar LocalStorage';
  }, []);

  if (token !== DEFAULT_TOKEN) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold mb-4">Acesso restrito</h1>
        <p>Adicione ?token={DEFAULT_TOKEN} na URL para acessar.</p>
      </div>
    );
  }

  const previewItem = <T,>(arr: T[]): string =>
    arr[0] ? JSON.stringify(arr[0], null, 2) : '—';

  const migrateInscricoes = async (key: 'inscricoes_judge' | 'inscricoes_staff') => {
    const tipo = key.endsWith('judge') ? 'judge' : 'staff';
    const items = allData[key] as Record<string, unknown>[];
    for (const item of items) {
      const payload = {
        nome: item.nome || item.name || 'Não informado',
        email: item.email || 'email@exemplo.com',
        whatsapp: item.whatsapp || item.phone || 'Não informado',
        cpf: item.cpf || null,
        tipo,
        valor: 0,
        status: item.status || 'cadastrado',
        portfolio: item.portfolio || null,
        experiencia: item.experiencia || null,
        disponibilidade: item.disponibilidade || null,
        motivacao: item.motivacao || null,
        certificacoes: item.certificacoes || null,
      };
      try {
        const res = await fetch('/.netlify/functions/save-inscricao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer interbox2025' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLog((l) => [...l, `OK inscricao (${tipo}): ${payload.email}`]);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setLog((l) => [...l, `ERRO inscricao (${tipo}): ${payload.email} -> ${errorMsg}`]);
      }
    }
  };

  const migrateSeguro = async () => {
    const items = allData['seguro_solicitacoes'] as Array<Record<string, unknown>>;
    for (const item of items) {
      const obj = item as {
        nome?: string;
        name?: string;
        email?: string;
        whatsapp?: string;
        phone?: string;
        cpf?: string;
        plano?: string;
        plan?: string;
        cobertura?: string;
        coverage?: string;
        observacoes?: string;
        obs?: string;
        status?: string;
      };
      const payload = {
        nome: obj.nome || obj.name || 'Não informado',
        email: obj.email || 'email@exemplo.com',
        whatsapp: obj.whatsapp || obj.phone || 'Não informado',
        cpf: item.cpf || null,
        plano: item.plano || item.plan || null,
        cobertura: item.cobertura || item.coverage || null,
        observacoes: item.observacoes || item.obs || null,
        status: item.status || 'novo',
      };
      try {
        const res = await fetch('/.netlify/functions/save-seguro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer interbox2025' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setLog((l) => [...l, `OK seguro: ${payload.email}`]);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setLog((l) => [...l, `ERRO seguro: ${item.email} -> ${errorMsg}`]);
      }
    }
  };

  const handleMigrate = async () => {
    setSending(true);
    setLog([]);
    try {
      await migrateInscricoes('inscricoes_judge');
      await migrateInscricoes('inscricoes_staff');
      // Audiovisual descontinuado: apenas ignorar
      await migrateSeguro();
      setLog((l) => [...l, 'Concluído.']);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Migrar LocalStorage → Supabase</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <section className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">inscricoes_judge</h2>
          <p>Total: {allData.inscricoes_judge.length}</p>
          <pre className="text-xs bg-gray-50 p-2 overflow-auto max-h-40">{previewItem(allData.inscricoes_judge)}</pre>
        </section>
        <section className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">inscricoes_staff</h2>
          <p>Total: {allData.inscricoes_staff.length}</p>
          <pre className="text-xs bg-gray-50 p-2 overflow-auto max-h-40">{previewItem(allData.inscricoes_staff)}</pre>
        </section>
        <section className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">inscricoes_audiovisual (IGNORADO)</h2>
          <p>Total: {allData.inscricoes_audiovisual.length}</p>
          <pre className="text-xs bg-gray-50 p-2 overflow-auto max-h-40">{previewItem(allData.inscricoes_audiovisual)}</pre>
        </section>
        <section className="border rounded p-4 bg-white">
          <h2 className="font-semibold mb-2">seguro_solicitacoes</h2>
          <p>Total: {allData.seguro_solicitacoes.length}</p>
          <pre className="text-xs bg-gray-50 p-2 overflow-auto max-h-40">{previewItem(allData.seguro_solicitacoes)}</pre>
        </section>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleMigrate} disabled={sending} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
          {sending ? 'Migrando…' : 'Migrar para Supabase'}
        </button>
        <span className="text-sm text-gray-600">Protegido por token via querystring.</span>
      </div>

      <div className="border rounded p-3 bg-white">
        <h3 className="font-semibold mb-2">Log</h3>
        <pre className="text-xs bg-gray-50 p-2 overflow-auto max-h-64">{log.join('\n') || '—'}</pre>
      </div>
    </div>
  );
}

