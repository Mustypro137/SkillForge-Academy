// Small helper to build HTML elements safely.
// Text is added with textContent (never innerHTML), so text can never run as code.
//
// Example: el('p', { class: 'note' }, 'Hello')

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value == null) continue;
    node.setAttribute(name, value === true ? '' : value);
  }
  for (const child of children) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}
