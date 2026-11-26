import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TipoLancamento } from '../../types';
import { formatCurrency, formatEquivalence } from '../../services/equivalenceEngine';

interface NovoLancamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipoPredefinido?: TipoLancamento;
}

export const NovoLancamentoModal: React.FC<NovoLancamentoModalProps> = ({
  isOpen,
  onClose,
  tipoPredefinido = 'DESPESA',
}) => {
  const { state, addLancamento, activeExpenseItem, activeProfitItem } = useApp();

  const [passo, setPasso] = useState<1 | 2 | 3>(1);
  const [tipo, setTipo] = useState<TipoLancamento>(tipoPredefinido);
  const [valorStr, setValorStr] = useState<string>('');
  const [categoriaId, setCategoriaId] = useState<string>(
    state.categorias.find((c) => c.tipo === tipoPredefinido)?.id || state.categorias[0]?.id || ''
  );
  const [contaId, setContaId] = useState<string>(state.contas[0]?.id || '');
  const [descricao, setDescricao] = useState<string>('');
  const [data, setData] = useState<string>(new Date().toISOString().slice(0, 10));
  const [numeroDocumento, setNumeroDocumento] = useState<string>('');
  const [erro, setErro] = useState<string>('');

  if (!isOpen) return null;

  const valorNumerico = parseFloat(valorStr.replace(',', '.')) || 0;
  const itemReferencia = tipo === 'DESPESA' ? activeExpenseItem : activeProfitItem;
  const equivalenciaTexto = valorNumerico > 0 ? formatEquivalence(valorNumerico, itemReferencia) : '—';

  const categoriasFiltradas = state.categorias.filter((c) => c.tipo === tipo && c.ativa);

  const handleAvancar = () => {
    setErro('');
    if (passo === 1) {
      if (!valorNumerico || valorNumerico <= 0) {
        setErro('Por favor, informe um valor válido maior que zero.');
        return;
      }
      setPasso(2);
    } else if (passo === 2) {
      if (!categoriaId) {
        setErro('Selecione uma categoria.');
        return;
      }
      if (!contaId) {
        setErro('Selecione uma conta financeira.');
        return;
      }
      setPasso(3);
    } else if (passo === 3) {
      if (!descricao.trim()) {
        setErro('Informe uma descrição para o lançamento.');
        return;
      }
      // Conclui e salva
      addLancamento({
        empresaId: state.empresa.id,
        contaId,
        categoriaId,
        criadoPor: state.usuario.id,
        tipo,
        valor: valorNumerico,
        data,
        descricao: descricao.trim(),
        numeroDocumento: numeroDocumento.trim() || undefined,
      });

      // Limpa e fecha
      setValorStr('');
      setDescricao('');
      setNumeroDocumento('');
      setPasso(1);
      onClose();
    }
  };

  const handleVoltar = () => {
    setErro('');
    if (passo > 1) {
      setPasso((p) => (p - 1) as 1 | 2);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titulo"
    >
      <div className="w-full max-w-lg bg-surface-container rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                add_circle
              </span>
            </div>
            <div>
              <h2 id="modal-titulo" className="font-headline text-base font-bold text-on-surface">
                Novo Lançamento
              </h2>
              <span className="text-xs text-on-surface-variant font-medium">
                Passo {passo} de 3 • Registro Rápido (RNF05)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Fechar janela modal"
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-lowest h-1.5" aria-hidden="true">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${(passo / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {erro && (
            <div
              className="p-3 rounded-lg bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2"
              role="alert"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                error
              </span>
              <span>{erro}</span>
            </div>
          )}

          {/* PASSO 1: Tipo & Valor com Cálculo Tangível Imediato */}
          {passo === 1 && (
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                1. Tipo de Movimentação
              </label>
              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de Lançamento">
                <button
                  type="button"
                  role="radio"
                  aria-checked={tipo === 'RECEITA'}
                  onClick={() => {
                    setTipo('RECEITA');
                    const firstRec = state.categorias.find((c) => c.tipo === 'RECEITA')?.id;
                    if (firstRec) setCategoriaId(firstRec);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                    tipo === 'RECEITA'
                      ? 'bg-primary-container text-on-primary-container border-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container-high hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_downward
                  </span>
                  <span>Receita (Entrada)</span>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={tipo === 'DESPESA'}
                  onClick={() => {
                    setTipo('DESPESA');
                    const firstDesp = state.categorias.find((c) => c.tipo === 'DESPESA')?.id;
                    if (firstDesp) setCategoriaId(firstDesp);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-primary ${
                    tipo === 'DESPESA'
                      ? 'bg-error-container text-on-error-container border-error shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant border-surface-container-high hover:border-outline'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_upward
                  </span>
                  <span>Despesa (Saída)</span>
                </button>
              </div>

              <div>
                <label htmlFor="input-valor" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Valor em Reais (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-on-surface-variant font-bold">
                    R$
                  </span>
                  <input
                    id="input-valor"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={valorStr}
                    onChange={(e) => setValorStr(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Box de Pré-visualização Tangível Instantânea (RF12) */}
              <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[20px]" aria-hidden="true">
                    devices
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">
                    Equivalência no mundo real:
                  </span>
                </div>
                <span className="font-mono text-sm font-bold text-tertiary">
                  {equivalenciaTexto}
                </span>
              </div>
            </div>
          )}

          {/* PASSO 2: Categoria & Conta Financeira */}
          {passo === 2 && (
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                2. Destino Financeiro
              </label>

              <div>
                <label htmlFor="select-categoria" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Categoria Contábil ({tipo === 'RECEITA' ? 'Receita' : 'Despesa'}) *
                </label>
                <select
                  id="select-categoria"
                  value={categoriaId}
                  onChange={(e) => setCategoriaId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categoriasFiltradas.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="select-conta" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Conta Financeira (Origem / Destino) *
                </label>
                <select
                  id="select-conta"
                  value={contaId}
                  onChange={(e) => setContaId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {state.contas.filter((c) => c.ativa).map((cta) => (
                    <option key={cta.id} value={cta.id}>
                      {cta.nome} ({cta.tipo})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* PASSO 3: Descrição, Data & Documento */}
          {passo === 3 && (
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                3. Detalhes do Lançamento
              </label>

              <div>
                <label htmlFor="input-descricao" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Descrição do Lançamento *
                </label>
                <input
                  id="input-descricao"
                  type="text"
                  placeholder="Ex: Mensalidade Cliente Alpha, Servidor AWS..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  autoFocus
                  className="w-full px-3 py-2.5 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="input-data" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Data da Operação *
                  </label>
                  <input
                    id="input-data"
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="input-doc" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Nº Documento / NF (opcional)
                  </label>
                  <input
                    id="input-doc"
                    type="text"
                    placeholder="NF-e #1234"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Resumo do que será gravado */}
              <div className="p-3 bg-surface-container-low rounded-xl text-xs flex justify-between items-center font-mono">
                <span className="text-on-surface-variant">Total:</span>
                <span className={`font-bold ${tipo === 'RECEITA' ? 'text-primary' : 'text-error'}`}>
                  {tipo === 'RECEITA' ? '+' : '-'} {formatCurrency(valorNumerico)} ({equivalenciaTexto})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-surface-container-low flex items-center justify-between border-t border-surface-container-high">
          <button
            type="button"
            onClick={handleVoltar}
            className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          >
            {passo === 1 ? 'Cancelar' : 'Voltar'}
          </button>

          <button
            type="button"
            onClick={handleAvancar}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-container text-on-primary-container hover:bg-primary transition-all shadow-md active:scale-98 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer flex items-center gap-1.5"
          >
            <span>{passo === 3 ? 'Confirmar & Registrar' : 'Continuar'}</span>
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              {passo === 3 ? 'check' : 'arrow_forward'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
