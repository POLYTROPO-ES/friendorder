const W = 480;
const H = 560;
const CX = W / 2;

const MEAT_COLORS = {
  crudo: '#d33',
  pocoHecho: '#c0392b',
  alPunto: '#a85a32',
  hecho: '#7a4a26',
  muyHecho: '#4e342e',
  especialCasa: '#a85a32',
};

const BREAD_COLORS = {
  normal: ['#f0b04c', '#d98a2b'],
  glutenFree: ['#e2c190', '#c9a46c'],
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBottomBun(ctx, bread) {
  const [light, dark] = BREAD_COLORS[bread] || BREAD_COLORS.normal;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(CX, 472, 172, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.ellipse(CX, 466, 168, 36, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7ecd8';
  ctx.beginPath();
  ctx.ellipse(CX, 458, 150, 20, 0, 0, Math.PI);
  ctx.fill();
}

function drawTopBun(ctx, bread, grilled) {
  const [light, dark] = BREAD_COLORS[bread] || BREAD_COLORS.normal;
  ctx.fillStyle = dark;
  ctx.beginPath();
  ctx.ellipse(CX, 190, 176, 95, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.ellipse(CX, 184, 170, 88, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  const seeds = [
    [160, 152], [200, 132], [240, 138], [280, 152], [318, 172],
    [182, 180], [300, 192], [222, 188], [140, 180], [268, 172],
  ];
  seeds.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 4, 2.4, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });
  if (grilled) {
    ctx.strokeStyle = 'rgba(110, 62, 12, 0.4)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(120, 148);
    ctx.lineTo(360, 172);
    ctx.moveTo(150, 116);
    ctx.lineTo(330, 142);
    ctx.moveTo(200, 200);
    ctx.lineTo(380, 200);
    ctx.stroke();
  }
}

function drawPatties(ctx, count, color) {
  const stackTop = 300;
  const stackBottom = 440;
  const h = (stackBottom - stackTop) / count;
  for (let i = 0; i < count; i += 1) {
    const y = stackBottom - h * (i + 1);
    ctx.fillStyle = color;
    roundRect(ctx, CX - 150, y, 300, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(CX - 118, y + h * 0.35);
    ctx.lineTo(CX + 118, y + h * 0.35);
    ctx.moveTo(CX - 118, y + h * 0.62);
    ctx.lineTo(CX + 118, y + h * 0.62);
    ctx.stroke();
  }
}

function drawCheese(ctx, count) {
  const layers = Math.min(count, 3);
  for (let i = 0; i < layers; i += 1) {
    const y = 294 - i * 9;
    ctx.fillStyle = 'rgba(255, 201, 60, 0.95)';
    ctx.beginPath();
    ctx.moveTo(CX - 155, y + 10);
    ctx.lineTo(CX - 130, y + 2);
    ctx.lineTo(CX + 130, y + 2);
    ctx.lineTo(CX + 155, y + 10);
    ctx.lineTo(CX + 130, y + 16);
    ctx.lineTo(CX - 130, y + 16);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlate(ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(CX, 505, 215, 48, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e3e3e3';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(CX, 502, 182, 38, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#ececec';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPepperGlyph(ctx, x, y, color) {
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
  // stem
  ctx.fillStyle = '#558b2f';
  ctx.beginPath();
  ctx.ellipse(x, y - 15, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCourgetteGlyph(ctx, x, y) {
  // griddled courgette slice: green ring, pale flesh, small seeds
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

function drawCheeseSliceGlyph(ctx, x, y) {
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

function drawToppingGlyph(ctx, topping, x, y) {
  if (topping.id === 'bacon' || topping.id === 'panceta') {
    const w = 30;
    const h = 14;
    ctx.fillStyle = topping.color;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    if (topping.id === 'bacon') {
      // red crispy bacon with white fat streaks
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + 6, y - 3);
      ctx.lineTo(x + w / 2 - 6, y - 3);
      ctx.moveTo(x - w / 2 + 6, y + 3);
      ctx.lineTo(x + w / 2 - 6, y + 3);
      ctx.stroke();
    } else {
      // white panceta with a thin meat streak
      ctx.strokeStyle = 'rgba(190, 30, 30, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - w / 2 + 5, y);
      ctx.lineTo(x + w / 2 - 5, y);
      ctx.stroke();
    }
    return;
  }
  if (
    topping.id === 'pimientosVerdes' ||
    topping.id === 'pimientoVerdePlancha' ||
    topping.id === 'pimientoRojo'
  ) {
    drawPepperGlyph(ctx, x, y, topping.color);
    return;
  }
  if (topping.id === 'calabacinPlancha') {
    drawCourgetteGlyph(ctx, x, y);
    return;
  }
  if (topping.id === 'queson') {
    drawCheeseSliceGlyph(ctx, x, y);
    return;
  }
  ctx.fillText(topping.emoji, x, y);
}

function drawToppingIcons(ctx, toppings) {
  const fontSize = toppings.length > 14 ? 20 : toppings.length > 10 ? 24 : 30;
  const step = toppings.length > 14 ? 28 : toppings.length > 10 ? 32 : 40;
  const maxPerRow = Math.max(1, Math.floor(310 / step));
  ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rows = [];
  for (let i = 0; i < toppings.length; i += maxPerRow) {
    rows.push(toppings.slice(i, i + maxPerRow));
  }
  const baseY = rows.length > 1 ? 232 : 246;
  rows.forEach((row, ri) => {
    const startX = CX - (step * (row.length - 1)) / 2;
    row.forEach((topping, i) => {
      drawToppingGlyph(ctx, topping, startX + i * step, baseY + ri * (fontSize + 9));
    });
  });
}

function drawToppingsAside(ctx, toppings) {
  const fontSize = toppings.length > 8 ? 22 : 26;
  ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const half = Math.ceil(toppings.length / 2);
  const left = toppings.slice(0, half);
  const right = toppings.slice(half);
  const spacing = fontSize + 8;
  const startY = 480 - ((Math.max(left.length, right.length) - 1) * spacing) / 2;
  [[left, 100], [right, 380]].forEach(([group, x]) => {
    group.forEach((topping, i) => {
      drawToppingGlyph(ctx, topping, x, startY + i * spacing);
    });
  });
}

function drawHouseSpecialStar(ctx) {
  ctx.save();
  ctx.fillStyle = '#ffca28';
  ctx.strokeStyle = '#f57f17';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const r = 24;
  for (let i = 0; i < 10; i += 1) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(CX + Math.cos(a) * radius, 96 + Math.sin(a) * radius);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws the burger for the given state onto the canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {object} state normalized burger state
 * @param {Array} toppings full toppings list (toppings.json)
 */
export function renderBurger(canvas, state, toppings) {
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const hasBread = state.bread !== 'none';
  const selected = toppings.filter((t) => state.toppings.includes(t.id));
  const modeFor = (category) =>
    state.toppingsAparte ? 'aside' : (state.serve && state.serve[category]) || 'inside';
  const insideCheeses = selected.filter(
    (t) => (t.id === 'dobleQueso' || t.id === 'tripleQueso') && modeFor('extra') === 'inside'
  );
  const insideIcons = selected.filter(
    (t) => t.id !== 'dobleQueso' && t.id !== 'tripleQueso' && modeFor(t.category) === 'inside'
  );
  const asideIcons = selected.filter((t) => modeFor(t.category) === 'aside');

  drawPlate(ctx);

  if (hasBread) {
    drawBottomBun(ctx, state.bread);
  }

  drawPatties(ctx, state.patties, MEAT_COLORS[state.meatPoint] || MEAT_COLORS.alPunto);

  if (insideCheeses.length > 0) {
    drawCheese(ctx, insideCheeses.length);
  }

  if (insideIcons.length > 0) {
    drawToppingIcons(ctx, insideIcons);
  }

  if (asideIcons.length > 0) {
    drawToppingsAside(ctx, asideIcons);
  }

  if (hasBread) {
    drawTopBun(ctx, state.bread, state.grilledBread);
  }

  if (state.meatPoint === 'especialCasa') {
    drawHouseSpecialStar(ctx);
  }
}

export function downloadPng(canvas, filename) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
