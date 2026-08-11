import { authenticateAdmin } from '../../_lib/auth.js';
import { json, errorResponse } from '../../_lib/respond.js';

export async function onRequestPatch(context) {
  const result = await authenticateAdmin(context.request, context.env);
  if (result.status) {
    return errorResponse(result.status, result.reason);
  }

  const id = String(context.params.id || '');
  const body = await context.request.json().catch(() => null);
  const role = body?.role;
  if (role !== 'admin' && role !== 'user') {
    return errorResponse(400, 'role must be "admin" or "user"');
  }
  if (id === result.user.id) {
    return errorResponse(400, 'cannot change your own role');
  }

  const user = await context.env.DB.prepare(
    'UPDATE users SET role = ? WHERE id = ? RETURNING id, email, name, role, created_at, last_login_at'
  )
    .bind(role, id)
    .first();

  if (!user) {
    return errorResponse(404, 'user not found');
  }
  return json({ user });
}
