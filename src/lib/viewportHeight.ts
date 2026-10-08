/**
 * Keeps `--app-height` equal to the visible area above the on-screen keyboard.
 * iOS Safari does not shrink the page when the keyboard opens: it shifts it up, and a full-height layout leaves
 * an empty gap between the composer and the keyboard. While the page is pinch-zoomed the height is left as is.
 */
export function trackViewportHeight(): () => void {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};

  const root = document.documentElement;
  const update = () => {
    if (viewport.scale > 1) return;
    root.style.setProperty('--app-height', `${viewport.height}px`);
    if (window.scrollY !== 0) window.scrollTo(0, 0);
  };

  update();
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
    root.style.removeProperty('--app-height');
  };
}
