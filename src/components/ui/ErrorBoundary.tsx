import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset: () => void;
}

interface State {
  failed: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Render error', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main role="alert" className="flex h-full flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="font-medium">Что-то пошло не так</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover"
          >
            Перезагрузить
          </button>
          <button
            type="button"
            onClick={this.props.onReset}
            className="rounded-xl bg-surface px-4 py-2 text-sm font-medium transition hover:bg-line"
          >
            Выйти
          </button>
        </div>
      </main>
    );
  }
}
