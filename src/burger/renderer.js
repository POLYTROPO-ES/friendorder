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

function drawSauces(ctx, sauces) {
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  sauces.forEach((sauce, i) => {
    const y = 286 + (i % 2) * 9;
    ctx.strokeStyle = sauce.color;
    ctx.beginPath();
    ctx.moveTo(CX - 130, y);
    ctx.quadraticCurveTo(CX - 60, y - 10, CX, y);
    ctx.quadraticCurveTo(CX + 60, y + 10, CX + 130, y);
    ctx.stroke();
  });
}

function drawToppingIcons(ctx, toppings) {
  const many = toppings.length > 10;
  const fontSize = many ? 24 : 30;
  const step = many ? 32 : 40;
  const maxPerRow = Math.max(1, Math.floor(310 / step));
  ctx.font = `${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rows = [];
  for (let i = 0; i < toppings.length; i += maxPerRow) {
    rows.push(toppings.slice(i, i + maxPerRow));
  }
  const baseY = rows.length > 1 ? 230 : 246;
  rows.forEach((row, ri) => {
    const startX = CX - (step * (row.length - 1)) / 2;
    row.forEach((topping, i) => {
      ctx.fillText(topping.emoji, startX + i * step, baseY + ri * (fontSize + 10));
    });
  });
}

function drawLettuceWrap(ctx) {
  // base leaf
  ctx.fillStyle = '#66bb6a';
  ctx.beginPath();
  ctx.ellipse(CX, 452, 165, 24, 0, 0, Math.PI);
  ctx.fill();
  // left leaf
  ctx.beginPath();
  ctx.moveTo(CX - 142, 440);
  ctx.quadraticCurveTo(CX - 178, 330, CX - 122, 242);
  ctx.quadraticCurveTo(CX - 92, 252, CX - 96, 360);
  ctx.closePath();
  ctx.fill();
  // right leaf
  ctx.beginPath();
  ctx.moveTo(CX + 142, 440);
  ctx.quadraticCurveTo(CX + 178, 330, CX + 122, 242);
  ctx.quadraticCurveTo(CX + 92, 252, CX + 96, 360);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.ellipse(CX - 122, 246, 12, 6, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(CX + 122, 246, 12, 6, 0.4, 0, Math.PI * 2);
  ctx.fill();
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
  const cheeses = selected.filter((t) => t.id === 'dobleQueso' || t.id === 'tripleQueso');
  const sauces = selected.filter((t) => t.category === 'sauce');
  const iconToppings = selected.filter((t) => t.category !== 'sauce');

  if (hasBread) {
    drawBottomBun(ctx, state.bread);
  }

  drawPatties(ctx, state.patties, MEAT_COLORS[state.meatPoint] || MEAT_COLORS.alPunto);

  if (cheeses.length > 0) {
    drawCheese(ctx, cheeses.length);
  }

  if (sauces.length > 0) {
    drawSauces(ctx, sauces);
  }

  if (iconToppings.length > 0) {
    drawToppingIcons(ctx, iconToppings);
  }

  if (hasBread) {
    drawTopBun(ctx, state.bread, state.grilledBread);
  } else {
    drawLettuceWrap(ctx);
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
