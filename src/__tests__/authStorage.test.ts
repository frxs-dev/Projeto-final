import { beforeEach, describe, expect, it } from 'vitest';
import {
  authenticateAccount,
  loadAppState,
  registerAccount,
} from '../services/storage';

const storedValues = new Map<string, string>();

beforeEach(() => {
  storedValues.clear();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storedValues.get(key) ?? null,
      setItem: (key: string, value: string) => storedValues.set(key, value),
      removeItem: (key: string) => storedValues.delete(key),
    },
  });
});

describe('Autenticação e isolamento das contas', () => {
  it('aceita somente as credenciais de demonstração corretas', () => {
    expect(authenticateAccount('filipe@gmail.com', '123456')?.id).toBe('usr_001');
    expect(authenticateAccount('filipe@gmail.com', 'senha-errada')).toBeNull();
  });

  it('mantém os dados de demonstração fora das contas cadastradas', () => {
    const account = registerAccount({
      nome: 'Nova Pessoa',
      email: 'nova@example.com',
      senha: 'senha123',
      nomeEmpresa: 'Nova Empresa',
      cnpj: '00.000.000/0001-00',
      regimeTributario: 'MEI',
    });

    const newAccountState = loadAppState(account.id, account);
    const demoState = loadAppState('usr_001');

    expect(newAccountState.lancamentos).toHaveLength(0);
    expect(newAccountState.contas).toHaveLength(0);
    expect(newAccountState.usuario.email).toBe('nova@example.com');
    expect(demoState.lancamentos.length).toBeGreaterThan(0);
  });

  it('impede o cadastro de um e-mail já existente', () => {
    expect(() => registerAccount({
      nome: 'Outra Pessoa',
      email: 'FILIPE@GMAIL.COM',
      senha: 'senha123',
      nomeEmpresa: 'Outra Empresa',
      cnpj: '00.000.000/0001-01',
      regimeTributario: 'MEI',
    })).toThrow('Este e-mail já possui uma conta');
  });
});
