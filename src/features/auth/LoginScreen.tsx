import { type ChangeEvent, type SubmitEvent, useState } from 'react';

import { type Credentials, errorMessage, getStateInstance } from '@/api';
import { LogoIcon } from '@/components/icons';
import { instanceStateMessage } from '@/lib';

import { LoginField } from './components';
import { normalizeCredentials, validateCredentials } from './utils';

interface Props {
  notice: string | null;
  onLogin: (credentials: Credentials) => void;
}

const EMPTY_FORM: Credentials = { apiUrl: '', idInstance: '', apiTokenInstance: '' };

export function LoginScreen({ notice, onLogin }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof Credentials) => (event: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const credentials = normalizeCredentials(form);
    const validationError = validateCredentials(credentials);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const { stateInstance } = await getStateInstance(credentials);
      if (stateInstance === 'authorized') onLogin(credentials);
      else setError(instanceStateMessage(stateInstance));
    } catch (err) {
      setError(errorMessage(err, 'Не удалось подключиться'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-5 rounded-2xl bg-surface p-8 shadow-[0_8px_30px_rgba(20,30,60,0.08)]"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <LogoIcon className="h-12 w-12" />
          <h1 className="text-xl font-semibold">Вход в MAX Chat</h1>
          <p className="text-sm text-muted">
            Данные инстанса из личного кабинета <span className="whitespace-nowrap">GREEN-API</span>
          </p>
        </div>

        {notice && (
          <p role="status" className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
            {notice}
          </p>
        )}

        <LoginField
          label="apiUrl"
          hint="Например, https://3100.api.green-api.com"
          value={form.apiUrl}
          onChange={update('apiUrl')}
          placeholder="https://xxxx.api.green-api.com"
          autoComplete="url"
          inputMode="url"
        />
        <LoginField
          label="idInstance"
          value={form.idInstance}
          onChange={update('idInstance')}
          placeholder="3100000001"
          autoComplete="username"
          inputMode="numeric"
        />
        <LoginField
          label="apiTokenInstance"
          type="password"
          value={form.apiTokenInstance}
          onChange={update('apiTokenInstance')}
          placeholder="••••••••••••"
          autoComplete="current-password"
        />

        {error && (
          <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2.5 font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? 'Проверяем…' : 'Войти'}
        </button>

        <p className="text-center text-xs text-muted">Данные хранятся только в этой вкладке и удаляются при выходе.</p>
      </form>
    </main>
  );
}
