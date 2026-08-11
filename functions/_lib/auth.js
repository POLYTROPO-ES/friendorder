import { jwtVerify, createRemoteJWKSet } from 'jose';

const jwksCache = new Map();

function isConfigured(env) {
  const teamDomain = env?.TEAM_DOMAIN || '';
  const policyAud = env?.POLICY_AUD || '';
  return (
    teamDomain.startsWith('https://') &&
    !teamDomain.includes('<your-team>') &&
    policyAud.length > 8 &&
    !policyAud.includes('<your-')
  );
}

function getJWKS(teamDomain) {
  if (!jwksCache.has(teamDomain)) {
    jwksCache.set(teamDomain, createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`)));
  }
  return jwksCache.get(teamDomain);
}

/**
 * Verifies the Cloudflare Access JWT from the Cf-Access-Jwt-Assertion header
 * against the team domain signing keys and the application AUD tag.
 * Returns the verified identity payload ({ id, email, name, ... }) or null.
 */
export async function verifyAccessJwt(request, env) {
  if (!isConfigured(env)) {
    return null;
  }
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, getJWKS(env.TEAM_DOMAIN), {
      issuer: env.TEAM_DOMAIN,
      audience: env.POLICY_AUD,
    });
    return payload;
  } catch {
    return null;
  }
}

export async function getUserByEmail(db, email) {
  return db
    .prepare('SELECT id, email, name, role, created_at, last_login_at FROM users WHERE email = ?')
    .bind(email)
    .first();
}

/**
 * Returns the user row for a verified identity, creating it on first visit
 * (default role 'user') and updating name/last_login on every login.
 * Returns null when the identity has no email.
 */
export async function upsertUser(db, identity) {
  const email = String(identity?.email || '').trim().toLowerCase();
  if (!email) {
    return null;
  }
  const now = new Date().toISOString();
  const existing = await getUserByEmail(db, email);
  if (existing) {
    const name = String(identity?.name || existing.name || '');
    await db
      .prepare('UPDATE users SET name = ?, last_login_at = ? WHERE email = ?')
      .bind(name, now, email)
      .run();
    return { ...existing, name, last_login_at: now };
  }
  const row = {
    id: String(identity?.id || crypto.randomUUID()),
    email,
    name: String(identity?.name || email.split('@')[0] || ''),
    role: 'user',
    created_at: now,
    last_login_at: now,
  };
  await db
    .prepare('INSERT INTO users (id, email, name, role, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(row.id, row.email, row.name, row.role, row.created_at, row.last_login_at)
    .run();
  return row;
}

/**
 * Authenticates a request via the Access JWT.
 * Returns { user } on success, or { status, reason } (401 unauthenticated / 503 unconfigured).
 */
export async function authenticate(request, env) {
  if (!isConfigured(env)) {
    return { status: 503, reason: 'auth not configured' };
  }
  const identity = await verifyAccessJwt(request, env);
  if (!identity) {
    return { status: 401, reason: 'unauthenticated' };
  }
  const user = await upsertUser(env.DB, identity);
  if (!user) {
    return { status: 401, reason: 'unauthenticated' };
  }
  return { user };
}

/**
 * Authenticates a request and requires the caller to have the admin role.
 * Returns { user } or { status, reason } (401/403/503).
 */
export async function authenticateAdmin(request, env) {
  const result = await authenticate(request, env);
  if (result.status) {
    return result;
  }
  if (result.user.role !== 'admin') {
    return { status: 403, reason: 'forbidden' };
  }
  return result;
}
