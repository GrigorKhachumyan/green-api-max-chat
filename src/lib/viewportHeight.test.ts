import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackViewportHeight } from './viewportHeight';

function setup(viewport: { height: number; scale: number }) {
  const listeners = new Map<string, () => void>();
  const visualViewport = {
    ...viewport,
    addEventListener: (type: string, listener: () => void) => listeners.set(type, listener),
    removeEventListener: (type: string) => listeners.delete(type),
  };
  const style = { setProperty: vi.fn(), removeProperty: vi.fn() };
  const scrollTo = vi.fn();
  vi.stubGlobal('window', { visualViewport, scrollY: 120, scrollTo });
  vi.stubGlobal('document', { documentElement: { style } });
  return { visualViewport, listeners, style, scrollTo };
}

afterEach(() => vi.unstubAllGlobals());

describe('trackViewportHeight', () => {
  it('sizes the app to the area above the keyboard and keeps the page in place', () => {
    const { visualViewport, listeners, style, scrollTo } = setup({ height: 800, scale: 1 });
    trackViewportHeight();
    expect(style.setProperty).toHaveBeenLastCalledWith('--app-height', '800px');

    visualViewport.height = 420;
    listeners.get('resize')?.();
    expect(style.setProperty).toHaveBeenLastCalledWith('--app-height', '420px');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('leaves the height alone while the page is pinch-zoomed', () => {
    const { style } = setup({ height: 300, scale: 2 });
    trackViewportHeight();
    expect(style.setProperty).not.toHaveBeenCalled();
  });

  it('stops tracking on cleanup', () => {
    const { listeners, style } = setup({ height: 800, scale: 1 });
    const stop = trackViewportHeight();
    stop();
    expect(listeners.size).toBe(0);
    expect(style.removeProperty).toHaveBeenCalledWith('--app-height');
  });
});
