const STORAGE_KEY = 'friendorder:burger:v1';

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — ignore
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function exportState(state) {
  const payload = {
    app: 'friendorder',
    type: 'burger',
    version: 1,
    savedAt: new Date().toISOString(),
    state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `friendorder-burger-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function readImportedState(file) {
  const text = await file.text();
  const payload = JSON.parse(text);
  if (!payload || payload.type !== 'burger' || !payload.state || typeof payload.state !== 'object') {
    throw new Error('invalid file');
  }
  return payload.state;
}
