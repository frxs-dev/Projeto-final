import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RegimeTributario } from '../types';
import { formatCurrency } from '../services/equivalenceEngine';
import { analisarRegimeTributario } from '../services/simplesNacionalService';

export const AcessibilidadeConfigView: React.FC = () => {
  const {
    state,
    setTema,
    setTamanhoFonte,
    toggleReduzirAnimacoes,
    updateEmpresa,
    resetDatabase,
  } = useApp();

  // Estados locais do perfil da empresa
  const [nomeEmpresa, setNomeEmpresa] = useState(state.empresa.nome);
  const [cnpj, setCnpj] = useState(state.empresa.cnpj);
  const [regime, setRegime] = useState<RegimeTributario>(state.empresa.regimeTributario);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Faturamento anual acumulado estimado com base nos lançamentos de receita
  const faturamentoAcumulado = state.lancamentos
    .filter((l) => l.tipo === 'RECEITA')
    .reduce((acc, l) => acc + l.valor, 0);

  // Diagnóstico tributário do Simples Nacional / MEI (dicas-professor.txt)
  const diagnosticoFiscal = analisarRegimeTributario(regime, faturamentoAcumulado);

  const handleSalvarEmpresa = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmpresa({
      nome: nomeEmpresa.trim(),
      cnpj: cnpj.trim(),
      regimeTributario: regime,
    });
    setMensagemSucesso('Dados da empresa atualizados com sucesso!');
    setTimeout(() => setMensagemSucesso(''), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-12">
      {/* Header */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-low p-6 rounded-xl shadow-md border border-surface-container-high/60">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">
              tune
            </span>
            <span>Preferências Globais</span>
            <span>•</span>
            <span className="text-primary font-bold">RF15 • WCAG 2.1 AA • SIMPLES NACIONAL</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            Acessibilidade &amp; Configurações
          </h1>
          <p className="text-xs text-on-surface-variant">
            Personalização de acessibilidade sensorial, fiscalidade MEI/Simples Nacional e dados cadastrais.
          </p>
        </div>
      </section>

      {mensagemSucesso && (
        <div className="p-4 rounded-xl bg-primary-container/20 border border-primary text-primary text-xs font-semibold flex items-center gap-2" role="status">
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check_circle</span>
          <span>{mensagemSucesso}</span>
        </div>
      )}

      {/* SEÇÃO 1: ACESSIBILIDADE WCAG 2.1 AA (RF15, RNF01) */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high/60 flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
          <div>
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Acessibilidade &amp; Ergonomia Visual (RF15)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Conformidade rigorosa com a norma WCAG 2.1 nível AA para inclusão de todos os usuários
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container-high text-primary font-bold">
            WCAG 2.1 AA
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card: Tema Visual */}
          <div className="p-5 rounded-xl bg-surface-container border border-surface-container-high/60 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              1. Esquema de Cores &amp; Contraste
            </span>
            <p className="text-xs text-on-surface-variant">
              Escolha entre o modo escuro padrão, modo claro diurno ou modo de alto contraste para máxima legibilidade.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={() => setTema('ESCURO')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-between cursor-pointer ${
                  state.usuario.tema === 'ESCURO'
                    ? 'bg-primary-container text-on-primary-container border-primary font-bold'
                    : 'bg-surface-container-low text-on-surface border-surface-container-high'
                }`}
              >
                <span>Tema Escuro (Titanium Default)</span>
                {state.usuario.tema === 'ESCURO' && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTema('CLARO')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-between cursor-pointer ${
                  state.usuario.tema === 'CLARO'
                    ? 'bg-primary-container text-on-primary-container border-primary font-bold'
                    : 'bg-surface-container-low text-on-surface border-surface-container-high'
                }`}
              >
                <span>Tema Claro (Alto Brilho)</span>
                {state.usuario.tema === 'CLARO' && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTema('ALTO_CONTRASTE')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-between cursor-pointer ${
                  state.usuario.tema === 'ALTO_CONTRASTE'
                    ? 'bg-primary-container text-on-primary-container border-primary font-bold'
                    : 'bg-surface-container-low text-on-surface border-surface-container-high'
                }`}
              >
                <span>Alto Contraste (WCAG AAA - 7:1+)</span>
                {state.usuario.tema === 'ALTO_CONTRASTE' && (
                  <span className="material-symbols-outlined text-[16px]">check</span>
                )}
              </button>
            </div>
          </div>

          {/* Card: Tamanho de Fonte */}
          <div className="p-5 rounded-xl bg-surface-container border border-surface-container-high/60 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              2. Escala Tipográfica (Zoom de Texto)
            </span>
            <p className="text-xs text-on-surface-variant">
              Amplie textos e números sem quebrar botões ou estruturas da interface.
            </p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[100, 125, 150].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTamanhoFonte(size)}
                  className={`py-3 px-2 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    state.usuario.tamanhoFonte === size
                      ? 'bg-primary-container text-on-primary-container border-primary'
                      : 'bg-surface-container-low text-on-surface border-surface-container-high hover:border-outline'
                  }`}
                >
                  <div className="font-mono text-sm">{size}%</div>
                  <div className="text-[10px] text-on-surface-variant font-normal">
                    {size === 100 ? 'Padrão' : size === 125 ? 'Médio' : 'Grande'}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-2 p-2 bg-surface-container-lowest rounded-lg border border-surface-container-high text-[11px] text-on-surface-variant">
              Tamanho ativo: <strong className="text-primary font-mono">{state.usuario.tamanhoFonte}%</strong>
            </div>
          </div>

          {/* Card: Redução de Animações */}
          <div className="p-5 rounded-xl bg-surface-container border border-surface-container-high/60 flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                3. Sensibilidade Vestibular
              </span>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Desative transições, efeitos de pulsação e animações que possam causar desconforto visual.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-lowest border border-surface-container-high flex items-center justify-between">
              <span className="text-xs text-on-surface font-semibold">
                Reduzir Animações:
              </span>
              <button
                type="button"
                onClick={toggleReduzirAnimacoes}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                  state.usuario.reduzirAnimacoes ? 'bg-primary justify-end' : 'bg-surface-container-highest justify-start'
                }`}
                aria-pressed={state.usuario.reduzirAnimacoes}
                aria-label="Alternar redução de animações"
              >
                <span className="w-5 h-5 rounded-full bg-surface shadow-md block"></span>
              </button>
            </div>
            <span className="text-[10px] text-on-surface-variant">
              Status: {state.usuario.reduzirAnimacoes ? 'Animações suprimidas (WCAG 2.3.3)' : 'Animações fluidas ativas'}
            </span>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: FISCALIDADE SIMPLES NACIONAL & MEI (dicas-professor.txt) */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high/60 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-surface-container-high">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]" aria-hidden="true">
                receipt_long
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Monitoramento Tributário • SIMPLES NACIONAL &amp; MEI
              </h2>
            </div>
            <p className="text-xs text-on-surface-variant">
              Acompanhamento de teto de faturamento anual, enquadramento e estimativa de Guia DAS
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container-high text-primary font-bold">
            {diagnosticoFiscal.faixaAtingida}
          </span>
        </div>

        {/* Status Bar de Limite de Faturamento */}
        <div className="p-5 rounded-xl bg-surface-container border border-surface-container-high/60 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-medium text-on-surface-variant">
                Faturamento Acumulado no Ano-Calendário:
              </span>
              <div className="font-mono text-xl font-bold text-on-surface">
                {formatCurrency(diagnosticoFiscal.faturamentoAcumulado)}
                <span className="text-xs font-normal text-on-surface-variant ml-2">
                  de {formatCurrency(diagnosticoFiscal.tetoAnual)} (Teto Anual)
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-primary">
                {diagnosticoFiscal.percentualTetoUtilizado}% do Teto
              </span>
              <span className="block text-[11px] text-on-surface-variant">
                {formatCurrency(diagnosticoFiscal.tetoAnual - diagnosticoFiscal.faturamentoAcumulado)} restantes
              </span>
            </div>
          </div>

          {/* Barra de Progresso do Teto Fiscal */}
          <div className="w-full bg-surface-container-lowest rounded-full h-3 overflow-hidden border border-surface-container-high">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                diagnosticoFiscal.status === 'limite_ultrapassado'
                  ? 'bg-error'
                  : diagnosticoFiscal.status === 'alerta'
                  ? 'bg-tertiary'
                  : 'bg-primary'
              }`}
              style={{ width: `${diagnosticoFiscal.percentualTetoUtilizado}%` }}
            />
          </div>

          <div className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high/60 flex items-start gap-3">
            <span
              className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                diagnosticoFiscal.status === 'regular' ? 'text-primary' : 'text-tertiary'
              }`}
            >
              {diagnosticoFiscal.status === 'regular' ? 'verified' : 'warning'}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-on-surface">
                {diagnosticoFiscal.mensagem}
              </span>
              <span className="text-xs text-on-surface-variant">
                Estimativa mensal da Guia DAS: <strong className="text-primary font-mono">{formatCurrency(diagnosticoFiscal.valorEstimadoDAS)}</strong>
              </span>
            </div>
          </div>

          {/* Dicas Fiscais Práticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            {diagnosticoFiscal.dicasMEI.map((dica, index) => (
              <div
                key={index}
                className="p-3 rounded-lg bg-surface-container-low border border-surface-container-high/40 text-xs text-on-surface-variant leading-relaxed"
              >
                📌 {dica}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: DADOS CADASTRAIS DA EMPRESA (RF02) */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high/60 flex flex-col gap-4">
        <h2 className="font-headline text-lg font-bold text-on-surface">
          Dados da Empresa (RF02)
        </h2>

        <form onSubmit={handleSalvarEmpresa} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Razão Social / Nome Fantasia *
            </label>
            <input
              type="text"
              value={nomeEmpresa}
              onChange={(e) => setNomeEmpresa(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Regime Tributário Oficial *
            </label>
            <select
              value={regime}
              onChange={(e) => setRegime(e.target.value as RegimeTributario)}
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="SIMPLES_NACIONAL">Simples Nacional (Microempresa)</option>
              <option value="MEI">MEI (Microempreendedor Individual)</option>
              <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-container text-on-primary-container hover:bg-primary transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Salvar Dados Cadastrais
            </button>
          </div>
        </form>
      </section>

      {/* SEÇÃO 4: GERENCIAMENTO DE BANCO DE DADOS LOCAL */}
      <section className="bg-surface-container-low rounded-2xl p-6 border border-surface-container-high/60 flex flex-col gap-4">
        <h2 className="font-headline text-base font-bold text-on-surface">
          Gerenciamento do Banco de Dados
        </h2>
        <p className="text-xs text-on-surface-variant">
          Você pode resetar todos os lançamentos, contas e relatórios para a base de demonstração original do SENAI a qualquer momento.
        </p>
        <div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja realmente restaurar os dados de demonstração originais?')) {
                resetDatabase();
                alert('Banco de dados restaurado com sucesso!');
              }
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface-container text-error hover:bg-error hover:text-on-error transition-colors border border-surface-container-high cursor-pointer"
          >
            Restaurar Base de Demonstração Padrão
          </button>
        </div>
      </section>
    </div>
  );
};
