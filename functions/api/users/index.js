import { authenticateAdmin } from '../../_lib/auth.js';
import { json, errorResponse } from '../../_lib/respond.js';

export async function onRequestGet(context) {
  const result = await authenticateAdmin(context.request, context.env);
  if (result.status) {
    return errorResponse(result.status, result.reason);
  }
  const { results } = await context.env.DB.prepare(
    'SELECT id, email, name, role, created_at, last_login_at FROM users ORDER BY created_at ASC'
  ).all();
  return json({ users: results || [] });
}
