import React, { useState } from 'react';

type Produto = {
  id: string;
  nome: string;
  preco: number; // em reais
  imagem?: string;
  slug: string;
};

type Props = {
  produto: Produto;
};

export default function ProdutoCard({ produto }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{ qrCode?: string; pixCopyPaste?: string } | null>(null);

  const handleComprar = async () => {
    setLoading(true);
    setError(null);
    setPix(null);
    try {
      const response = await fetch('https://interbox-captacao.netlify.app/.netlify/functions/create-charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productSlug: produto.slug,
          customerData: {
            name: 'Cliente INTERBØX',
            email: 'cliente@example.com'
          }
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Falha ao criar charge');
      }
      setPix({ qrCode: data.qrCode || data.charge?.qrCodeImage, pixCopyPaste: data.pixCopyPaste || data.charge?.brCode });
    } catch (e: any) {
      setError(e.message || 'Erro ao processar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center gap-4">
        {produto.imagem ? (
          <img src={produto.imagem} alt={produto.nome} className="h-20 w-20 object-cover rounded" />
        ) : (
          <div className="h-20 w-20 rounded bg-white/10" />
        )}
        <div className="flex-1">
          <div className="text-white font-semibold">{produto.nome}</div>
          <div className="text-white/80">R$ {produto.preco.toFixed(2)}</div>
        </div>
        <button
          onClick={handleComprar}
          disabled={loading}
          className="px-4 py-2 rounded bg-pink-600 hover:bg-pink-500 text-white disabled:opacity-50"
        >
          {loading ? 'Gerando PIX...' : 'Comprar'}
        </button>
      </div>
      {error && <div className="text-red-400 mt-3 text-sm">{error}</div>}
      {pix && (
        <div className="mt-4 space-y-2">
          {pix.qrCode && (
            <img src={pix.qrCode} alt="QR Code" className="w-40 h-40" />
          )}
          {pix.pixCopyPaste && (
            <div className="text-xs break-all text-white/80">{pix.pixCopyPaste}</div>
          )}
        </div>
      )}
    </div>
  );
}


