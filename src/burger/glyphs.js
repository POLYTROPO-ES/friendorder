// Single source of truth for custom topping glyphs.
// Each custom topping is rendered in two places: an inline SVG in the UI chips
// and a canvas drawing in the burger image. Keeping both here prevents drift.

const PEPPER_IDS = ['pimientosVerdes', 'pimientoVerdePlancha', 'pimientoRojo'];

const CUSTOM_IDS = new Set([...PEPPER_IDS, 'bacon', 'panceta', 'calabacinPlancha', 'queson']);

export function isCustomGlyph(id) {
  return CUSTOM_IDS.has(id);
}

/** Inline SVG for a topping chip (24x24 viewBox). Returns null for emoji-only toppings. */
export function glyphSvg(id, color) {
  switch (id) {
    case 'bacon':
      return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="4" fill="${color}"/><rect x="6" y="9" width="12" height="2" rx="1" fill="rgba(255,255,255,0.75)"/><rect x="6" y="14" width="12" height="2" rx="1" fill="rgba(255,255,255,0.75)"/></svg>`;
    case 'panceta':
      return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="4" fill="${color}" stroke="rgba(0,0,0,0.3)"/><rect x="6" y="11" width="12" height="2" rx="1" fill="rgba(190,30,30,0.7)"/></svg>`;
    case 'pimientosVerdes':
    case 'pimientoVerdePlancha':
    case 'pimientoRojo':
      return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2c5 0 6.5 4 4.5 7l-1.5 7.5c-.8 1.8-5.7 1.8-6.5 0L7 9C5 6 6.5 2 12 2z" fill="${color}"/><rect x="11" y="0" width="2" height="5" rx="1" fill="#558b2f"/></svg>`;
    case 'calabacinPlancha':
      return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="${color}"/><circle cx="12" cy="12" r="6" fill="#eaf2d8"/><circle cx="10" cy="10" r="1.4" fill="#a5c882"/><circle cx="14" cy="12" r="1.4" fill="#a5c882"/><circle cx="12" cy="15" r="1.4" fill="#a5c882"/></svg>`;
    case 'queson':
      return `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3 15 L10 3 L21 8 L17 16 Z" fill="${color}" stroke="rgba(0,0,0,0.2)"/><circle cx="10" cy="11" r="1.6" fill="#f5a800"/><circle cx="15" cy="10" r="1.6" fill="#f5a800"/></svg>`;
    default:
      return null;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPepper(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 11);
  ctx.bezierCurveTo(x + 11, y - 11, x + 11, y + 2, x + 6, y + 10);
  ctx.quadraticCurveTo(x + 3, y + 13, x, y + 9);
  ctx.quadraticCurveTo(x - 3, y + 13, x - 6, y + 10);
  ctx.bezierCurveTo(x - 11, y + 2, x - 11, y - 11, x, y - 11);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#558b2f';
  ctx.beginPath();
  ctx.ellipse(x, y - 15, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCourgette(ctx, x, y) {
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#eaf2d8';
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a5c882';
  [[-3, 0], [3, 0], [0, -3], [0, 3]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCheeseSlice(ctx, x, y) {
  ctx.fillStyle = '#ffca28';
  ctx.beginPath();
  ctx.moveTo(x - 11, y + 9);
  ctx.lineTo(x - 3, y - 11);
  ctx.lineTo(x + 11, y - 4);
  ctx.lineTo(x + 6, y + 9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#f5a800';
  [[-1, -2], [6, 2], [-6, 4]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** Draws a custom glyph on the canvas at (x, y). Returns true when the id is a custom glyph. */
export function drawGlyph(ctx, id, color, x, y) {
  if (id === 'bacon' || id === 'panceta') {
    const w = 30;
    const h = 14;
    ctx.fillStyle = color;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (id === 'bacon') {
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + 6, y - 3);
      ctx.lineTo(x + w / 2 - 6, y - 3);
      ctx.moveTo(x - w / 2 + 6, y + 3);
      ctx.lineTo(x + w / 2 - 6, y + 3);
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(190, 30, 30, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + 5, y);
      ctx.lineTo(x + w / 2 - 5, y);
      ctx.stroke();
    }
    return true;
  }
  if (PEPPER_IDS.includes(id)) {
    drawPepper(ctx, x, y, color);
    return true;
  }
  if (id === 'calabacinPlancha') {
    drawCourgette(ctx, x, y);
    return true;
  }
  if (id === 'queson') {
    drawCheeseSlice(ctx, x, y);
    return true;
  }
  return false;
}
