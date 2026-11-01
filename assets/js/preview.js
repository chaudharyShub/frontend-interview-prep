/**
 * React preview, running inside a sandboxed iframe (react-preview.html).
 * The editor posts { type: 'render', code, theme }; this compiles the JSX with Sucrase,
 * runs it and renders the default export. Console output and errors go back to the editor.
 *
 * The iframe has `sandbox="allow-scripts"` (no allow-same-origin), so the user's code
 * can't read the main page or its saved progress.
 */
(function () {
  'use strict';

  const parentWin = window.parent;
  const send = msg => parentWin.postMessage(Object.assign({ source: 'fip-preview' }, msg), '*');
  const rootEl = document.getElementById('root');
  let root = null;

  // ---------- Console forwarding ----------
  function fmt(v, depth = 0) {
    if (typeof v === 'string') return depth ? JSON.stringify(v) : v;
    if (typeof v === 'function') return `[Function${v.name ? ': ' + v.name : ''}]`;
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v && typeof v === 'object') {
      if (depth > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
      try {
        if (Array.isArray(v)) return `[${v.map(x => fmt(x, depth + 1)).join(', ')}]`;
        const keys = Object.keys(v);
        return keys.length ? `{ ${keys.map(k => `${k}: ${fmt(v[k], depth + 1)}`).join(', ')} }` : '{}';
      } catch (e) { return String(v); }
    }
    return String(v);
  }
  ['log', 'info', 'warn', 'error'].forEach(level => {
    const orig = console[level].bind(console);
    console[level] = (...args) => {
      orig(...args);
      send({ type: 'log', level: level === 'info' ? 'log' : level, text: args.map(a => fmt(a)).join(' ') });
    };
  });

  // ---------- Errors ----------
  function showError(text) {
    if (root) { root.unmount(); root = null; }
    rootEl.innerHTML = '';
    const box = document.createElement('pre');
    box.className = 'error';
    box.textContent = text;
    rootEl.appendChild(box);
    send({ type: 'error', text });
    reportSize();
  }
  window.addEventListener('error', e => { send({ type: 'error', text: e.message }); });
  window.addEventListener('unhandledrejection', e => {
    const r = e.reason;
    send({ type: 'error', text: 'Unhandled promise rejection – ' + (r && r.message ? r.message : String(r)) });
  });

  class ErrorBoundary extends React.Component {
    constructor(props) { super(props); this.state = { error: null }; }
    static getDerivedStateFromError(error) { return { error }; }
    render() {
      if (this.state.error) return React.createElement('pre', { className: 'error' }, `${this.state.error.name}: ${this.state.error.message}`);
      return this.props.children;
    }
  }

  // ---------- Compile & render ----------
  const MODULES = { react: React, 'react-dom': ReactDOM, 'react-dom/client': ReactDOM };
  function requireShim(name) {
    if (name in MODULES) return MODULES[name];
    throw new Error(`Can't import "${name}" here. Only react and react-dom are available.`);
  }

  function render(code) {
    let compiled;
    try {
      compiled = Sucrase.transform(code, { transforms: ['jsx', 'imports'], production: true }).code;
    } catch (e) {
      showError(`SyntaxError: ${e.message}`);
      return;
    }
    const module = { exports: {} };
    try {
      new Function('require', 'module', 'exports', 'React', compiled)(requireShim, module, module.exports, React);
    } catch (e) {
      showError(`${e.name}: ${e.message}`);
      return;
    }
    const ex = module.exports;
    const Component = ex.default || ex.App || (typeof ex === 'function' ? ex : null);
    if (typeof Component !== 'function') {
      showError('Nothing to render. Add `export default function App() { … }`.');
      return;
    }
    if (root) root.unmount();
    rootEl.innerHTML = '';
    root = ReactDOM.createRoot(rootEl);
    root.render(React.createElement(ErrorBoundary, null, React.createElement(Component)));
    send({ type: 'rendered' });
  }

  // ---------- Size reporting so the editor can size the iframe ----------
  let lastH = 0;
  function reportSize() {
    const h = Math.ceil(document.documentElement.scrollHeight);
    if (h !== lastH) { lastH = h; send({ type: 'size', height: h }); }
  }
  if ('ResizeObserver' in window) new ResizeObserver(reportSize).observe(document.body);

  window.addEventListener('message', e => {
    if (e.source !== parentWin) return;
    const msg = e.data || {};
    if (msg.type !== 'render') return;
    document.documentElement.dataset.theme = msg.theme === 'dark' ? 'dark' : 'light';
    render(String(msg.code || ''));
  });

  send({ type: 'ready' });
})();
