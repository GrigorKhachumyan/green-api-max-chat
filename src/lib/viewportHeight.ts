function isTextField(element: EventTarget | null): boolean {
  return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

/**
 * Keeps `--app-height` equal to the visible area above the on-screen keyboard.
 * iOS Safari does not shrink the page when the keyboard opens: it shifts it up, and a full-height layout leaves
 * an empty gap between the composer and the keyboard. While the page is pinch-zoomed the height is left as is.
 */
export function trackViewportHeight(): () => void {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};

  const root = document.documentElement;
  const setHeight = (height: number) => root.style.setProperty('--app-height', `${height}px`);

  const update = () => {
    if (viewport.scale > 1) return;
    setHeight(viewport.height);
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  };

  // iOS reports the new height only after the keyboard has slid away; until then a gap would show under the layout.
  const handleFocusOut = (event: FocusEvent) => {
    if (viewport.scale > 1 || !isTextField(event.target) || isTextField(event.relatedTarget)) return;
    setHeight(window.innerHeight);
  };

  update();
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  document.addEventListener('focusout', handleFocusOut);
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
    document.removeEventListener('focusout', handleFocusOut);
    root.style.removeProperty('--app-height');
  };
}
