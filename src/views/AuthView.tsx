import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RegimeTributario } from '../types';

export const AuthView: React.FC = () => {
  const { login, register } = useApp();
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [nomeEmpresa, setNomeEmpresa] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [regime, setRegime] = useState<RegimeTributario>('SIMPLES_NACIONAL');
  const [mensagem, setMensagem] = useState('');
  const [cadastroConcluido, setCadastroConcluido] = useState(false);

  const handleAutenticar = (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem('');
    setCadastroConcluido(false);

    if (modo === 'registro') {
      try {
        register({
          email,
          senha,
          nome,
          nomeEmpresa,
          cnpj,
          regimeTributario: regime,
        });
        setModo('login');
        setSenha('');
        setCadastroConcluido(true);
        setMensagem('Conta criada. Entre com seu e-mail e senha para continuar.');
      } catch (error) {
        setMensagem(error instanceof Error ? error.message : 'Não foi possível criar a conta.');
      }
      return;
    }

    if (!login(email, senha)) {
      setMensagem('E-mail ou senha incorretos.');
    }
  };

  const trocarModo = (novoModo: 'login' | 'registro') => {
    setModo(novoModo);
    setMensagem('');
    setCadastroConcluido(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md bg-surface-container-low rounded-2xl p-8 border border-surface-container-high shadow-xl flex flex-col gap-6">
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
              ? 'Entre na sua conta para acessar a gestão financeira.'
              : 'Cadastre sua empresa para começar a usar o Finance.'}
          </p>
        </div>

        {mensagem && (
          <div
            className={`p-3 rounded-lg text-xs font-semibold text-center ${
              cadastroConcluido
                ? 'bg-primary/10 border border-primary text-primary'
                : 'bg-error/10 border border-error text-error'
            }`}
            role={cadastroConcluido ? 'status' : 'alert'}
          >
            {mensagem}
          </div>
        )}

        <div className="flex rounded-lg bg-surface-container-lowest p-1 border border-surface-container-high/60">
          <button
            type="button"
            onClick={() => trocarModo('login')}
            aria-pressed={modo === 'login'}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              modo === 'login'
                ? 'bg-surface-container text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Já tenho conta
          </button>
          <button
            type="button"
            onClick={() => trocarModo('registro')}
            aria-pressed={modo === 'registro'}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              modo === 'registro'
                ? 'bg-surface-container text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleAutenticar} className="flex flex-col gap-4">
          {modo === 'registro' && (
            <>
              <div>
                <label htmlFor="nome" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Seu nome completo *
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label htmlFor="empresa" className="block text-xs font-medium text-on-surface-variant mb-1">
                  Razão social da empresa *
                </label>
                <input
                  id="empresa"
                  type="text"
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cnpj" className="block text-xs font-medium text-on-surface-variant mb-1">
                    CNPJ *
                  </label>
                  <input
                    id="cnpj"
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="regime" className="block text-xs font-medium text-on-surface-variant mb-1">
                    Regime fiscal *
                  </label>
                  <select
                    id="regime"
                    value={regime}
                    onChange={(e) => setRegime(e.target.value as RegimeTributario)}
                    className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                    <option value="MEI">MEI</option>
                    <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-on-surface-variant mb-1">
              E-mail *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-xs font-medium text-on-surface-variant mb-1">
              Senha *
            </label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-3 py-2 bg-surface-container-lowest rounded-xl border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary-container font-bold text-sm hover:bg-primary transition-all shadow-md active:scale-98 cursor-pointer mt-2"
          >
            {modo === 'login' ? 'Entrar no sistema' : 'Concluir cadastro'}
          </button>
        </form>

        {modo === 'login' && (
          <p className="text-center text-xs text-on-surface-variant">
            Acesso de demonstração: <span className="font-mono">filipe@gmail.com</span> /{' '}
            <span className="font-mono">123456</span>
          </p>
        )}
      </div>
    </div>
  );
};
