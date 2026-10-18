// Applies the appearance settings (theme and text size) to the page.

export function applyAppearance(settings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme; // "system", "light" or "dark" (see css/base.css)
  root.style.setProperty('--font-size', `${settings.fontSize}px`);
}
