import { afterEach, describe, expect, it, vi } from 'vitest';

import { trackViewportHeight } from './viewportHeight';

class FakeInput {}

function setup(viewport: { height: number; scale: number }) {
  const viewportListeners = new Map<string, () => void>();
  const documentListeners = new Map<string, (event: Partial<FocusEvent>) => void>();
  const visualViewport = {
    ...viewport,
    addEventListener: (type: string, listener: () => void) => viewportListeners.set(type, listener),
    removeEventListener: (type: string) => viewportListeners.delete(type),
  };
  const style = { setProperty: vi.fn(), removeProperty: vi.fn() };
  const scrollTo = vi.fn();
  vi.stubGlobal('HTMLInputElement', FakeInput);
  vi.stubGlobal('HTMLTextAreaElement', FakeInput);
  vi.stubGlobal('window', { visualViewport, scrollY: 120, scrollTo, innerHeight: 900 });
  vi.stubGlobal('document', {
    documentElement: { style },
    addEventListener: (type: string, listener: (event: Partial<FocusEvent>) => void) =>
      documentListeners.set(type, listener),
    removeEventListener: (type: string) => documentListeners.delete(type),
  });
  return { visualViewport, viewportListeners, documentListeners, style, scrollTo };
}

afterEach(() => vi.unstubAllGlobals());

describe('trackViewportHeight', () => {
  it('sizes the app to the area above the keyboard and keeps the page in place', () => {
    const { visualViewport, viewportListeners, style, scrollTo } = setup({ height: 800, scale: 1 });
    trackViewportHeight();
    expect(style.setProperty).toHaveBeenLastCalledWith('--app-height', '800px');

    visualViewport.height = 420;
    viewportListeners.get('resize')?.();
    expect(style.setProperty).toHaveBeenLastCalledWith('--app-height', '420px');
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it('restores the full height as soon as a text field loses focus', () => {
    const { documentListeners, style } = setup({ height: 420, scale: 1 });
    trackViewportHeight();
    documentListeners.get('focusout')?.({ target: new FakeInput() as EventTarget, relatedTarget: null });
    expect(style.setProperty).toHaveBeenLastCalledWith('--app-height', '900px');
  });

  it('keeps the height when the focus moves to another text field', () => {
    const { documentListeners, style } = setup({ height: 420, scale: 1 });
    trackViewportHeight();
    const field = new FakeInput() as EventTarget;
    documentListeners.get('focusout')?.({ target: field, relatedTarget: field });
    expect(style.setProperty).toHaveBeenLastCalledWith('--app-height', '420px');
  });

  it('leaves the height alone while the page is pinch-zoomed', () => {
    const { style } = setup({ height: 300, scale: 2 });
    trackViewportHeight();
    expect(style.setProperty).not.toHaveBeenCalled();
  });

  it('stops tracking on cleanup', () => {
    const { viewportListeners, documentListeners, style } = setup({ height: 800, scale: 1 });
    const stop = trackViewportHeight();
    stop();
    expect(viewportListeners.size).toBe(0);
    expect(documentListeners.size).toBe(0);
    expect(style.removeProperty).toHaveBeenCalledWith('--app-height');
  });
});
