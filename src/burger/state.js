export const BREAD_OPTIONS = ['none', 'normal', 'glutenFree'];
export const PATTY_OPTIONS = [1, 2, 3, 4];
export const MEAT_POINTS = ['pocoHecho', 'alPunto', 'hecho', 'muyHecho', 'especialCasa'];

export const DEFAULT_STATE = {
  bread: 'normal',
  grilledBread: false,
  patties: 1,
  meatPoint: 'alPunto',
  toppings: [],
  toppingsAparte: false,
  serve: { veggie: 'inside', extra: 'inside', sauce: 'inside' },
  name: '',
  updatedAt: null,
  language: 'es',
};

export function normalizeState(raw) {
  const state = { ...DEFAULT_STATE, ...(raw || {}) };
  if (!BREAD_OPTIONS.includes(state.bread)) {
    state.bread = DEFAULT_STATE.bread;
  }
  if (!MEAT_POINTS.includes(state.meatPoint)) {
    state.meatPoint = DEFAULT_STATE.meatPoint;
  }
  const patties = Number(state.patties);
  state.patties = Number.isFinite(patties) ? Math.min(4, Math.max(1, Math.round(patties))) : DEFAULT_STATE.patties;
  state.grilledBread = Boolean(state.grilledBread);
  state.toppingsAparte = Boolean(state.toppingsAparte);
  const serve = state.serve && typeof state.serve === 'object' ? state.serve : {};
  state.serve = {
    veggie: serve.veggie === 'aside' ? 'aside' : 'inside',
    extra: serve.extra === 'aside' ? 'aside' : 'inside',
    sauce: serve.sauce === 'aside' ? 'aside' : 'inside',
  };
  if (state.bread === 'none') {
    state.grilledBread = false;
  }
  state.toppings = Array.isArray(state.toppings) ? state.toppings.filter((t) => typeof t === 'string') : [];
  state.name = typeof state.name === 'string' ? state.name.slice(0, 60) : '';
  state.updatedAt =
    typeof state.updatedAt === 'string' && !Number.isNaN(Date.parse(state.updatedAt)) ? state.updatedAt : null;
  state.language = state.language === 'en' ? 'en' : 'es';
  return state;
}

// --- shareable link encoding (?c=<url-safe base64 of compact JSON>) ---

function encode(value) {
  const json = JSON.stringify(value);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function encodeShareConfig(state) {
  const { language, updatedAt, ...config } = state;
  return encode(config);
}

export function decodeShareConfig(value) {
  try {
    return decode(value);
  } catch {
    return null;
  }
}

export function buildShareUrl(state) {
  const url = new URL(window.location.href);
  url.search = `?c=${encodeShareConfig(state)}`;
  return url.toString();
}
