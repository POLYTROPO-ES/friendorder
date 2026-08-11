import { VERSION_INFO } from './generated/version.js';

const versionEl = document.getElementById('version');
if (versionEl) {
  versionEl.textContent = `FriendOrder v${VERSION_INFO.version}`;
}

const userArea = document.getElementById('user-area');
const adminPanel = document.getElementById('admin-panel');

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function initial(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}

function setStatus(message) {
  if (userArea) {
    userArea.innerHTML = `<p class="hint" role="status">${escapeHtml(message)}</p>`;
  }
}

function renderUser(user, logoutUrl) {
  if (!userArea) return;
  userArea.innerHTML = `
    <div class="user-chip">
      <span class="avatar" aria-hidden="true">${escapeHtml(initial(user.name))}</span>
      <span class="user-meta">
        <span class="user-name">${escapeHtml(user.name || user.email)}</span>
        <span class="user-email">${escapeHtml(user.email)}</span>
      </span>
      <span class="role-badge role-${escapeHtml(user.role)}">${escapeHtml(user.role)}</span>
      <a class="logout-link" href="${escapeHtml(logoutUrl || '/')}" rel="noopener">Sign out</a>
    </div>
  `;
}

async function renderAdminPanel() {
  if (!adminPanel) return;
  const { ok, body } = await fetchJson('/api/users');
  const errorEl = adminPanel.querySelector('#admin-error');
  if (!ok) {
    errorEl.hidden = false;
    errorEl.textContent = body.error || 'Failed to load members.';
    return;
  }
  errorEl.hidden = true;
  const rows = (body.users || [])
    .map((user) => `
      <tr>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(user.name || '')}</td>
        <td><span class="role-badge role-${escapeHtml(user.role)}">${escapeHtml(user.role)}</span></td>
        <td>${user.last_login_at ? escapeHtml(new Date(user.last_login_at).toLocaleString()) : '—'}</td>
        <td>
          <button type="button" class="role-toggle" data-id="${escapeHtml(user.id)}" data-next="${user.role === 'admin' ? 'user' : 'admin'}">
            ${user.role === 'admin' ? 'Make user' : 'Make admin'}
          </button>
        </td>
      </tr>
    `)
    .join('');
  adminPanel.querySelector('tbody').innerHTML = rows;
  adminPanel.querySelectorAll('.role-toggle').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.id;
      const role = button.dataset.next;
      button.disabled = true;
      const result = await fetchJson(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (result.ok) {
        await renderAdminPanel();
      } else {
        button.disabled = false;
        errorEl.hidden = false;
        errorEl.textContent = result.body.error || 'Could not update role.';
      }
    });
  });
}

async function init() {
  setStatus('Signing in…');
  const { ok, status, body } = await fetchJson('/api/me');
  if (ok && body.user) {
    renderUser(body.user, body.logoutUrl);
    if (body.user.role === 'admin' && adminPanel) {
      adminPanel.hidden = false;
      renderAdminPanel();
    }
    return;
  }
  if (status === 503) {
    setStatus('Auth not configured yet — see docs/AuthCloudflareAccess.md.');
    return;
  }
  setStatus('Please sign in to continue.');
}

init();
