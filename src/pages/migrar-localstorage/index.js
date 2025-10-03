import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
const DEFAULT_TOKEN = 'interbox2025';
function readJson(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed))
            return parsed;
        return [];
    }
    catch {
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
        };
    }, []);
    const [sending, setSending] = useState(false);
    const [log, setLog] = useState([]);
    useEffect(() => {
        document.title = 'Migrar LocalStorage';
    }, []);
    if (token !== DEFAULT_TOKEN) {
        return (_jsxs("div", { className: "p-6 max-w-3xl mx-auto", children: [_jsx("h1", { className: "text-xl font-bold mb-4", children: "Acesso restrito" }), _jsxs("p", { children: ["Adicione ?token=", DEFAULT_TOKEN, " na URL para acessar."] })] }));
    }
    const previewItem = (arr) => arr[0] ? JSON.stringify(arr[0], null, 2) : '—';
    const migrateInscricoes = async (key) => {
        const tipo = key.endsWith('judge') ? 'judge' : 'staff';
        const items = allData[key];
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
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                setLog((l) => [...l, `OK inscricao (${tipo}): ${payload.email}`]);
            }
            catch (e) {
                const errorMsg = e instanceof Error ? e.message : String(e);
                setLog((l) => [...l, `ERRO inscricao (${tipo}): ${payload.email} -> ${errorMsg}`]);
            }
        }
    };
    const migrateSeguro = async () => {
        const items = allData['seguro_solicitacoes'];
        for (const item of items) {
            const obj = item;
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
                if (!res.ok)
                    throw new Error(`HTTP ${res.status}`);
                setLog((l) => [...l, `OK seguro: ${payload.email}`]);
            }
            catch (e) {
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
        }
        finally {
            setSending(false);
        }
    };
    return (_jsxs("div", { className: "p-6 max-w-5xl mx-auto", children: [_jsx("h1", { className: "text-2xl font-bold mb-6", children: "Migrar LocalStorage \u2192 Supabase" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-6 mb-8", children: [_jsxs("section", { className: "border rounded p-4 bg-white", children: [_jsx("h2", { className: "font-semibold mb-2", children: "inscricoes_judge" }), _jsxs("p", { children: ["Total: ", allData.inscricoes_judge.length] }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 overflow-auto max-h-40", children: previewItem(allData.inscricoes_judge) })] }), _jsxs("section", { className: "border rounded p-4 bg-white", children: [_jsx("h2", { className: "font-semibold mb-2", children: "inscricoes_staff" }), _jsxs("p", { children: ["Total: ", allData.inscricoes_staff.length] }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 overflow-auto max-h-40", children: previewItem(allData.inscricoes_staff) })] }), _jsxs("section", { className: "border rounded p-4 bg-white", children: [_jsx("h2", { className: "font-semibold mb-2", children: "inscricoes_audiovisual (IGNORADO)" }), _jsxs("p", { children: ["Total: ", allData.inscricoes_audiovisual.length] }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 overflow-auto max-h-40", children: previewItem(allData.inscricoes_audiovisual) })] }), _jsxs("section", { className: "border rounded p-4 bg-white", children: [_jsx("h2", { className: "font-semibold mb-2", children: "seguro_solicitacoes" }), _jsxs("p", { children: ["Total: ", allData.seguro_solicitacoes.length] }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 overflow-auto max-h-40", children: previewItem(allData.seguro_solicitacoes) })] })] }), _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("button", { onClick: handleMigrate, disabled: sending, className: "px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50", children: sending ? 'Migrando…' : 'Migrar para Supabase' }), _jsx("span", { className: "text-sm text-gray-600", children: "Protegido por token via querystring." })] }), _jsxs("div", { className: "border rounded p-3 bg-white", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Log" }), _jsx("pre", { className: "text-xs bg-gray-50 p-2 overflow-auto max-h-64", children: log.join('\n') || '—' })] })] }));
}
