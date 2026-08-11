import toppings from './data/toppings.json';
import { createI18n } from './i18n.js';
import {
  DEFAULT_STATE,
  normalizeState,
  BREAD_OPTIONS,
  MEAT_POINTS,
  decodeShareConfig,
  buildShareUrl,
} from './burger/state.js';
import { saveState, loadState, clearState, exportState, readImportedState } from './store.js';
import { renderBurger, downloadPng } from './burger/renderer.js';

export function initApp() {
  const urlConfig = decodeShareConfig(new URLSearchParams(window.location.search).get('c'));
  const saved = loadState();
  const state = normalizeState(urlConfig || saved || DEFAULT_STATE);
  let i18n = createI18n(state.language);

  const $ = (id) => document.getElementById(id);
  const canvas = $('burger-canvas');
  const summaryEl = $('summary');
  const langToggle = $('lang-toggle');
  const menuToggle = $('menu-toggle');
  const menuPop = $('menu-pop');
  const breadEl = $('bread-options');
  const grillWrap = $('grill-wrap');
  const grillToggle = $('grill-toggle');
  const pattyEl = $('patty-stepper');
  const meatEl = $('meat-options');
  const toppingsEl = $('topping-groups');
  const importFile = $('import-file');
  const toastEl = $('toast');
  const nameInput = $('order-name');
  const orderDateEl = $('order-date');
  const toppingsAsideToggle = $('toppings-aside-toggle');

  const toppingById = new Map(toppings.map((t) => [t.id, t]));

  let toastTimer = null;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 2200);
  }

  function persist() {
    state.updatedAt = new Date().toISOString();
    saveState(state);
  }

  function formatDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString(state.language === 'es' ? 'es-ES' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  function renderName() {
    if (nameInput && document.activeElement !== nameInput) {
      nameInput.value = state.name;
    }
  }

  function renderDate() {
    if (!orderDateEl) return;
    if (!state.updatedAt) {
      orderDateEl.hidden = true;
      return;
    }
    orderDateEl.hidden = false;
    orderDateEl.textContent = `${i18n.t('orderDate')}: ${formatDate(state.updatedAt)}`;
  }

  function renderBread() {
    breadEl.innerHTML = BREAD_OPTIONS.map((id) => {
      const label = i18n.dict.breadOptions[id];
      return `<button type="button" data-bread="${id}" class="${state.bread === id ? 'active' : ''}">${label}</button>`;
    }).join('');
    breadEl.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.bread = btn.dataset.bread;
        if (state.bread === 'none') {
          state.grilledBread = false;
        }
        persist();
        renderAll();
      });
    });
    grillWrap.hidden = state.bread === 'none';
    grillToggle.checked = state.grilledBread;
    toppingsAsideToggle.checked = state.toppingsAparte;
  }

  function renderPatties() {
    pattyEl.innerHTML = `
      <button type="button" id="patty-minus" aria-label="-" ${state.patties <= 1 ? 'disabled' : ''}>−</button>
      <div class="value">${state.patties}<small>${i18n.dict.pattyCount[state.patties]}</small></div>
      <button type="button" id="patty-plus" aria-label="+" ${state.patties >= 4 ? 'disabled' : ''}>+</button>
    `;
    $('patty-minus').addEventListener('click', () => {
      state.patties = Math.max(1, state.patties - 1);
      persist();
      renderAll();
    });
    $('patty-plus').addEventListener('click', () => {
      state.patties = Math.min(4, state.patties + 1);
      persist();
      renderAll();
    });
  }

  function renderMeat() {
    meatEl.innerHTML = MEAT_POINTS.map((id) => {
      const label = i18n.dict.meatOptions[id];
      return `<button type="button" data-meat="${id}" class="${state.meatPoint === id ? 'active' : ''}">${label}</button>`;
    }).join('');
    meatEl.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.meatPoint = btn.dataset.meat;
        persist();
        renderAll();
      });
    });
  }

  function renderToppings() {
    const categories = ['veggie', 'extra', 'sauce'];
    const forced = state.toppingsAparte;
    toppingsEl.innerHTML = categories
      .map((category) => {
        const items = toppings.filter((t) => t.category === category);
        const chips = items
          .map((t) => {
            const active = state.toppings.includes(t.id);
            return `<button type="button" data-topping="${t.id}" class="${active ? 'active' : ''}" aria-pressed="${active}">
              <span class="t-emoji">${t.emoji}</span>${t.name[state.language]}</button>`;
          })
          .join('');
        const effective = forced ? 'aside' : state.serve[category];
        const head = `<div class="group-head"><h3>${i18n.dict.categoryOptions[category]}</h3>
            <select data-serve-cat="${category}" class="serve-select" aria-label="${i18n.t('serveTitle')}" ${forced ? 'disabled' : ''}>
              <option value="inside" ${effective === 'inside' ? 'selected' : ''}>${i18n.dict.serveInside}</option>
              <option value="aside" ${effective === 'aside' ? 'selected' : ''}>${i18n.dict.serveAside}</option>
            </select>
          </div>`;
        return `<div class="group">${head}<div class="topping-grid">${chips}</div></div>`;
      })
      .join('');
    toppingsEl.querySelectorAll('button[data-topping]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.topping;
        const idx = state.toppings.indexOf(id);
        if (idx >= 0) {
          state.toppings.splice(idx, 1);
        } else {
          state.toppings.push(id);
        }
        persist();
        renderAll();
      });
    });
    toppingsEl.querySelectorAll('select[data-serve-cat]').forEach((sel) => {
      sel.addEventListener('change', () => {
        state.serve[sel.dataset.serveCat] = sel.value;
        persist();
        renderAll();
      });
    });
  }

  function buildSummaryParts() {
    const d = i18n.dict;
    const parts = [];
    const breadLabel = d.breadOptions[state.bread];
    if (state.bread === 'none') {
      parts.push(d.breadOptions.none);
    } else {
      parts.push(state.grilledBread ? `${breadLabel} (${d.grilled})` : breadLabel);
    }
    parts.push(d.pattyCount[state.patties]);
    parts.push(d.meatOptions[state.meatPoint]);
    const names = state.toppings
      .map((id) => toppingById.get(id)?.name[state.language])
      .filter(Boolean);
    if (names.length > 0) {
      parts.push(names.join(', '));
    }
    return parts;
  }

  function renderSummary() {
    summaryEl.textContent = buildSummaryParts().join(' · ');
  }

  function renderPreview() {
    renderBurger(canvas, state, toppings);
  }

  function applyStaticTexts() {
    document.documentElement.lang = state.language;
    langToggle.textContent = state.language === 'es' ? 'EN' : 'ES';
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = i18n.t(el.dataset.i18n);
    });
    if (nameInput) {
      nameInput.placeholder = i18n.t('orderNamePlaceholder');
      nameInput.setAttribute('aria-label', i18n.t('orderName'));
    }
  }

  function renderAll() {
    applyStaticTexts();
    renderName();
    renderDate();
    renderBread();
    renderPatties();
    renderMeat();
    renderToppings();
    renderPreview();
    renderSummary();
  }

  function setLanguage(lang) {
    state.language = lang;
    i18n = createI18n(lang);
    persist();
    renderAll();
  }

  function shareSummary() {
    const d = i18n.dict;
    const parts = [];
    if (state.name) {
      parts.push(state.name);
    }
    parts.push(`${d.shareIntro} ${buildSummaryParts().join(', ')}.`);
    parts.push(d.madeWith);
    if (state.updatedAt) {
      parts.push(formatDate(state.updatedAt));
    }
    return `${parts.join(' · ')} — ${buildShareUrl(state)}`;
  }

  // --- events ---
  langToggle.addEventListener('click', () => setLanguage(state.language === 'es' ? 'en' : 'es'));

  nameInput.addEventListener('input', () => {
    state.name = nameInput.value.slice(0, 60);
    persist();
    renderSummary();
    renderDate();
  });

  toppingsAsideToggle.addEventListener('change', () => {
    state.toppingsAparte = toppingsAsideToggle.checked;
    persist();
    renderAll();
  });

  grillToggle.addEventListener('change', () => {
    state.grilledBread = grillToggle.checked;
    persist();
    renderPreview();
    renderSummary();
  });

  menuToggle.addEventListener('click', () => {
    const open = menuPop.hidden;
    menuPop.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', (e) => {
    if (!menuPop.hidden && !menuPop.contains(e.target) && e.target !== menuToggle) {
      menuPop.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  $('action-export').addEventListener('click', () => {
    exportState(state);
    menuPop.hidden = true;
  });
  $('action-import').addEventListener('click', () => {
    importFile.click();
    menuPop.hidden = true;
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    importFile.value = '';
    if (!file) return;
    try {
      const imported = await readImportedState(file);
      Object.assign(state, normalizeState({ ...state, ...imported }));
      i18n = createI18n(state.language);
      persist();
      renderAll();
      toast(i18n.t('imported'));
    } catch {
      toast(i18n.t('importError'));
    }
  });
  $('action-delete').addEventListener('click', () => {
    menuPop.hidden = true;
    if (!window.confirm(i18n.t('confirmDelete'))) return;
    clearState();
    Object.assign(state, normalizeState(DEFAULT_STATE));
    i18n = createI18n(state.language);
    renderAll();
    toast(i18n.t('deleted'));
  });

  $('btn-download').addEventListener('click', () => {
    downloadPng(canvas, `friendorder-burger-${Date.now()}.png`);
  });

  $('btn-whatsapp').addEventListener('click', () => {
    const text = shareSummary();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  });

  $('btn-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(state));
      toast(i18n.t('copied'));
    } catch {
      toast(i18n.t('copied'));
    }
  });

  // --- boot ---
  if (!state.updatedAt) {
    state.updatedAt = new Date().toISOString();
  }
  renderAll();
}
