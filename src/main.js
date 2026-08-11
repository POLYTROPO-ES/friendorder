import { VERSION_INFO } from './generated/version.js';

const versionEl = document.getElementById('version');
if (versionEl) {
  versionEl.textContent = `FriendOrder v${VERSION_INFO.version}`;
}
