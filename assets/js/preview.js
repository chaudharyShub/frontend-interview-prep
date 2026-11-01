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
  // The browser hides details of errors thrown from the user's code here ("Script error."),
  // because this sandboxed page has an opaque origin. Event handlers and timer callbacks are
  // wrapped below so the real message is reported; this is the fallback for anything else.
  window.addEventListener('error', e => {
    const hidden = !e.error && /^Script error\.?$/.test(e.message);
    send({ type: 'error', text: hidden ? 'Your code threw an error (the browser hid the details). Open the browser console for more.' : e.message });
  });
  const guarded = fn => (typeof fn !== 'function' || fn.__fipWrapped) ? fn : Object.assign(function (...args) {
    try { return fn.apply(this, args); } catch (e) { console.error(e); return undefined; }
  }, { __fipWrapped: true });
  ['setTimeout', 'setInterval', 'requestAnimationFrame', 'queueMicrotask'].forEach(name => {
    const orig = window[name];
    if (typeof orig === 'function') window[name] = (fn, ...rest) => orig.call(window, guarded(fn), ...rest);
  });
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
  // The user's code gets a React whose createElement wraps on* handlers (see `guarded`).
  const UserReact = Object.assign({}, React, {
    createElement(type, props, ...children) {
      if (props) {
        for (const k in props) {
          if (/^on[A-Z]/.test(k) && typeof props[k] === 'function') {
            props = Object.assign({}, props);
            for (const h in props) if (/^on[A-Z]/.test(h)) props[h] = guarded(props[h]);
            break;
          }
        }
      }
      return React.createElement(type, props, ...children);
    },
  });
  const MODULES = { react: UserReact, 'react-dom': ReactDOM, 'react-dom/client': ReactDOM };
  function requireShim(name) {
    if (name in MODULES) return MODULES[name];
    throw new Error(`Can't import "${name}" here. Only react and react-dom are available.`);
  }

  // Loops that run for over a second in one go (render, click handler, effect…) throw.
  const GUARD = '__loopGuard';
  const loopGuard = LoopGuard.makeLoopGuard(1000);

  // Tells the editor the tree has actually rendered (effects run after the commit).
  function Committed() {
    React.useLayoutEffect(() => { send({ type: 'rendered' }); }, []);
    return null;
  }

  function render(code) {
    let compiled;
    try {
      compiled = Sucrase.transform(code, { transforms: ['jsx', 'imports'], production: true }).code;
      compiled = LoopGuard.protectLoops(compiled, GUARD);
    } catch (e) {
      showError(`SyntaxError: ${e.message}`);
      return;
    }
    const module = { exports: {} };
    try {
      new Function('require', 'module', 'exports', 'React', GUARD, compiled)(requireShim, module, module.exports, UserReact, loopGuard);
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
    root.render(React.createElement(React.Fragment, null,
      React.createElement(ErrorBoundary, null, React.createElement(Component)),
      React.createElement(Committed)));
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
    if (msg.type === 'ping') { send({ type: 'pong' }); return; }
    if (msg.type !== 'render') return;
    document.documentElement.dataset.theme = msg.theme === 'dark' ? 'dark' : 'light';
    render(String(msg.code || ''));
  });

  send({ type: 'ready' });
})();
