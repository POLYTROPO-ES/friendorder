import { describe, it, expect, beforeAll } from 'vitest';
import {
  DEFAULT_STATE,
  normalizeState,
  MEAT_POINTS,
  BREAD_OPTIONS,
  encodeShareConfig,
  decodeShareConfig,
  buildShareUrl,
} from './state.js';

beforeAll(() => {
  // buildShareUrl uses window.location.href
  globalThis.window = { location: { href: 'https://friendorder.tinkertask.com/' } };
});

describe('normalizeState', () => {
  it('returns the default state when nothing is passed', () => {
    expect(normalizeState(null)).toEqual(DEFAULT_STATE);
  });

  it('clamps patties to 1..4 and handles junk values', () => {
    expect(normalizeState({ patties: 9 }).patties).toBe(4);
    expect(normalizeState({ patties: 0 }).patties).toBe(1);
    expect(normalizeState({ patties: 2.6 }).patties).toBe(3);
    expect(normalizeState({ patties: 'nope' }).patties).toBe(1);
  });

  it('rejects unknown bread and meat points', () => {
    expect(normalizeState({ bread: 'ciabatta' }).bread).toBe(DEFAULT_STATE.bread);
    expect(normalizeState({ meatPoint: 'crudo' }).meatPoint).toBe(DEFAULT_STATE.meatPoint);
    expect(BREAD_OPTIONS).not.toContain('ciabatta');
    expect(MEAT_POINTS).not.toContain('crudo');
  });

  it('clears grilledBread when bread is none', () => {
    expect(normalizeState({ bread: 'none', grilledBread: true }).grilledBread).toBe(false);
  });

  it('sanitizes toppings to strings and name to 60 chars', () => {
    const state = normalizeState({ toppings: ['bacon', 42, null, {}], name: 'x'.repeat(100) });
    expect(state.toppings).toEqual(['bacon']);
    expect(state.name).toHaveLength(60);
  });

  it('only accepts en/es languages', () => {
    expect(normalizeState({ language: 'en' }).language).toBe('en');
    expect(normalizeState({ language: 'fr' }).language).toBe('es');
  });

  it('maps serve values to inside/aside only', () => {
    const state = normalizeState({ serve: { veggie: 'aside', extra: 'outside', sauce: 'inside' } });
    expect(state.serve).toEqual({ veggie: 'aside', extra: 'inside', sauce: 'inside' });
  });
});

describe('share encoding', () => {
  it('round-trips a full state including unicode names', () => {
    const state = normalizeState({
      bread: 'glutenFree',
      grilledBread: true,
      patties: 3,
      meatPoint: 'especialCasa',
      toppings: ['bacon', 'pimientoRojo', 'salsaBBQ'],
      toppingsAparte: true,
      serve: { veggie: 'aside', extra: 'inside', sauce: 'aside' },
      name: 'La burger de José 🍔',
    });
    const decoded = normalizeState(decodeShareConfig(encodeShareConfig(state)));
    expect(decoded).toMatchObject({
      bread: 'glutenFree',
      grilledBread: true,
      patties: 3,
      meatPoint: 'especialCasa',
      toppings: ['bacon', 'pimientoRojo', 'salsaBBQ'],
      toppingsAparte: true,
      serve: { veggie: 'aside', extra: 'inside', sauce: 'aside' },
      name: 'La burger de José 🍔',
    });
  });

  it('returns null for invalid tokens', () => {
    expect(decodeShareConfig('!!!not-base64!!!')).toBeNull();
    expect(decodeShareConfig(null)).toBeNull();
  });

  it('strips language from the shared config', () => {
    const token = encodeShareConfig(normalizeState({ language: 'en' }));
    const decoded = decodeShareConfig(token);
    expect(decoded).not.toHaveProperty('language');
  });

  it('builds a share URL with the encoded config', () => {
    const url = buildShareUrl(normalizeState({ patties: 2 }));
    const parsed = new URL(url);
    expect(parsed.origin).toBe('https://friendorder.tinkertask.com');
    expect(decodeShareConfig(parsed.searchParams.get('c'))).not.toBeNull();
  });

  it('still decodes links produced by the legacy escape/unescape algorithm', () => {
    // Compatibility pin: share links created by older versions must keep working.
    const legacy = { bread: 'none', patties: 4, meatPoint: 'muyHecho', toppings: ['queson'], name: 'Pepe' };
    const json = JSON.stringify(legacy);
    const base64 = Buffer.from(unescape(encodeURIComponent(json)), 'binary').toString('base64');
    const token = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(decodeShareConfig(token)).toEqual(legacy);
  });
});
