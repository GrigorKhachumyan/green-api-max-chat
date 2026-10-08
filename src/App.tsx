import { useState } from 'react';

import type { Credentials } from '@/api';
import { LoginScreen } from '@/features/auth';
import { Messenger } from '@/features/messenger';
import { clearSession, loadSession, saveCredentials } from '@/lib';

const CORRUPTED_SESSION = 'Данные сессии повреждены. Войдите заново.';
const EXPIRED_SESSION = 'Сессия завершена: GREEN-API отклонил idInstance или apiTokenInstance. Войдите заново.';

export default function App() {
  const [session] = useState(loadSession);
  const [credentials, setCredentials] = useState<Credentials | null>(session.credentials);
  const [restored, setRestored] = useState(session.credentials !== null);
  const [notice, setNotice] = useState<string | null>(session.corrupted ? CORRUPTED_SESSION : null);

  function handleLogin(entered: Credentials) {
    saveCredentials(entered);
    setRestored(false);
    setNotice(null);
    setCredentials(entered);
  }

  function endSession(reason: string | null) {
    clearSession();
    setNotice(reason);
    setCredentials(null);
  }

  if (!credentials) return <LoginScreen notice={notice} onLogin={handleLogin} />;

  return (
    <Messenger
      key={credentials.idInstance}
      credentials={credentials}
      restored={restored}
      onLogout={() => endSession(null)}
      onSessionInvalid={() => endSession(EXPIRED_SESSION)}
    />
  );
}
