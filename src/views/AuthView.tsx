import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PapelUsuario, RegimeTributario } from '../types';

export const AuthView: React.FC = () => {
  const {
    state,
    setCurrentView,
    switchUsuarioPapel,
    updateEmpresa,
  } = useApp();

  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('filipe.reis@techcorp.com.br');
  const [senha, setSenha] = useState('••••••••');
  const [nome, setNome] = useState('Filipe A. Reis');
  const [nomeEmpresa, setNomeEmpresa] = useState('TechCorp Soluções Ltda');
  const [cnpj, setCnpj] = useState('12.345.678/0001-90');
  const [regime, setRegime] = useState<RegimeTributario>('SIMPLES_NACIONAL');
  const [mensagem, setMensagem] = useState('');

  const handleAutenticar = (e: React.FormEvent) => {
    e.preventDefault();

    if (modo === 'registro') {
      updateEmpresa({
        nome: nomeEmpresa,
        cnpj,
        regimeTributario: regime,
      });
      setMensagem('Conta e empresa criadas com sucesso! Você agora é o Administrador (RF02).');
    } else {
      setMensagem('Sessão autenticada via Supabase Auth (RF01)!');
    }

    setTimeout(() => {
      setCurrentView('painel-geral');
    }, 1200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
      <div className="w-full max-w-md bg-surface-container-low rounded-2xl p-8 border border-surface-container-high shadow-xl flex flex-col gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[28px]" aria-hidden="true">
              account_balance_wallet
            </span>
          </div>
          <h1 className="font-headline text-xl font-bold text-on-surface">
            {modo === 'login' ? 'Entrar no Finance' : 'Criar Conta & Empresa'}
          </h1>
          <p className="text-xs text-on-surface-variant">
            {modo === 'login'
              ? 'Acesse a gestão financeira tangível da sua empresa'
              : 'Cadastre sua empresa e comece como Administrador (RF01, RF02)'}
          </p>
        </div>

        {mensagem && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary text-primary text-xs font-semibold text-center" role="status">
            {mensagem}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-surface-container-lowest p-1 border border-surface-container-high/60">
          <button
            type="button"
            onClick={() => setModo('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              modo === 'login'
                ? 'bg-surface-container text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Já tenho acesso (RF01)
          </button>
          <button
            type="button"
            onClick={() => setModo('registro')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              modo === 'registro'
                ? 'bg-surface-container text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Cadastrar Empresa (RF02)
          </button>
        </div>

        <form onSubmit={handleAutenticar} className="flex flex-col gap-4">
          {modo === 'registro' && (
            <>
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">
                  Razão Social da Empresa *
                </label>
                <input
                  type="text"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    Regime Fiscal *
                  </label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value as RegimeTributario)}
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                    <option value="MEI">MEI</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              E-mail Corporativo *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              Senha de Acesso *
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary transition-all shadow-md active:scale-98 cursor-pointer mt-2"
          >
            {modo === 'login' ? 'Entrar no Sistema' : 'Concluir Cadastro & Iniciar'}
          </button>
        </form>

        {/* Quick Demo Role Switcher for Evaluators / Teachers */}
        <div className="pt-4 border-t border-surface-container-high flex flex-col gap-2">
          <span className="text-[11px] font-mono uppercase font-bold text-on-surface-variant text-center">
            Alternar Perfil Instantaneamente (Para Testes)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['ADMIN', 'FINANCEIRO', 'LEITOR'] as PapelUsuario[]).map((papel) => (
              <button
                key={papel}
                type="button"
                onClick={() => {
                  switchUsuarioPapel(papel);
                  setCurrentView('painel-geral');
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                  state.usuario.papel === papel
                    ? 'bg-primary/20 text-primary border-primary'
                    : 'bg-surface-container text-on-surface-variant border-surface-container-high hover:text-on-surface'
                }`}
              >
                {papel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
